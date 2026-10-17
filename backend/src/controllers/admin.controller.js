import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import Category from '../models/Category.js';
import Skill from '../models/Skill.js';
import { z } from 'zod';
import { audit } from '../services/audit.service.js';
import { notify } from '../services/notification.service.js';
import { ok, fail } from '../utils/api.js';
export async function overview(req, res) {
    const [users, recruiters, jobs, companies, applications, openReports] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'RECRUITER' }),
        Job.countDocuments(),
        Company.countDocuments(),
        Application.countDocuments(),
        Report.countDocuments({ status: 'OPEN' })
    ]);
    return ok(res, { users, recruiters, jobs, companies, applications, openReports });
}
const adminApplicationStatusSchema = z.object({
    status: z.enum(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN']),
    note: z.string().trim().max(1000).optional()
});
export async function applications(req, res) {
    const rows = await Application.find()
        .populate('applicant', 'name email avatar headline')
        .populate({
        path: 'job',
        select: 'title location type recruiter company',
        populate: [
            { path: 'recruiter', select: 'name email' },
            { path: 'company', select: 'name' }
        ]
    })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(500);
    return ok(res, { applications: rows });
}
export async function updateApplicationStatus(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid application id', 400);
    const data = adminApplicationStatusSchema.parse(req.body);
    const application = await Application.findById(req.params.id)
        .populate('job', 'title recruiter')
        .populate('applicant', 'name');
    if (!application)
        return fail(res, 'Application not found', 404);
    const previousStatus = application.status;
    if (previousStatus === data.status)
        return ok(res, { application }, 'Application already has this status');
    const note = data.note || `Admin override: ${previousStatus} → ${data.status}`;
    application.status = data.status;
    application.history.push({ status: data.status, note, changedBy: req.user._id });
    await application.save();
    await audit(req.user._id, 'ADMIN_OVERRIDE_APPLICATION_STATUS', 'Application', application._id, {
        previousStatus,
        status: data.status,
        note
    });
    const roleTitle = application.job?.title || 'the role';
    if (application.applicant?._id) {
        await notify(
            application.applicant._id,
            'APPLICATION_STATUS',
            'Application status updated by HireFlow admin',
            `Your application for ${roleTitle} was changed from ${previousStatus.replace('_', ' ')} to ${data.status.replace('_', ' ')}.`,
            '/applications'
        );
    }
    if (application.job?.recruiter) {
        await notify(
            application.job.recruiter,
            'APPLICATION_STATUS',
            'Application status adjusted by admin',
            `${application.applicant?.name || 'A candidate'}'s application for ${roleTitle} changed from ${previousStatus.replace('_', ' ')} to ${data.status.replace('_', ' ')}.`,
            '/applicants'
        );
    }
    return ok(res, { application }, 'Application status overridden by admin');
}
export async function users(req, res) {
    return ok(res, { users: await User.find().select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 }).limit(200) });
}
export async function jobs(req, res) {
    return ok(res, { jobs: await Job.find().populate('company', 'name').populate('recruiter', 'name email').sort({ createdAt: -1 }).limit(200) });
}
export async function toggleUser(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid user id', 400);
    const user = await User.findById(req.params.id);
    if (!user)
        return fail(res, 'User not found', 404);
    if (String(user._id) === String(req.user._id))
        return fail(res, 'You cannot block yourself', 400);
    if (user.role === 'ADMIN')
        return fail(res, 'Admin accounts cannot be blocked from this moderation screen', 400);
    const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const update = { $set: { status: nextStatus } };
    if (nextStatus === 'BLOCKED')
        update.$unset = { refreshTokenHash: 1 };
    const updatedUser = await User.findByIdAndUpdate(user._id, update, { new: true }).select('-passwordHash -refreshTokenHash');
    user.status = updatedUser.status;
    await audit(req.user._id, 'TOGGLE_USER', 'User', user._id, { status: user.status });
    await notify(user._id, 'ACCOUNT_STATUS', 'Account status updated', `Your HireFlow account is now ${user.status.toLowerCase()}.`, '/account');
    return ok(res, { user }, 'User status updated');
}
export async function toggleJob(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid job id', 400);
    const job = await Job.findById(req.params.id);
    if (!job)
        return fail(res, 'Job not found', 404);
    job.published = !job.published;
    await job.save();
    await audit(req.user._id, 'TOGGLE_JOB', 'Job', job._id, { published: job.published });
    await notify(job.recruiter, 'JOB_VISIBILITY', 'Job visibility updated', `${job.title} is now ${job.published ? 'public' : 'hidden'}.`, '/my-jobs');
    return ok(res, { job }, 'Job visibility updated');
}
export async function companies(req, res) {
    return ok(res, { companies: await Company.find().populate('owner', 'name email').sort({ createdAt: -1 }).limit(200) });
}
export async function toggleCompany(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid company id', 400);
    const company = await Company.findById(req.params.id);
    if (!company)
        return fail(res, 'Company not found', 404);
    company.verified = !company.verified;
    await company.save();
    await audit(req.user._id, 'TOGGLE_COMPANY_VERIFIED', 'Company', company._id, { verified: company.verified });
    await notify(company.owner, 'COMPANY_STATUS', 'Company verification updated', `${company.name} is now ${company.verified ? 'verified' : 'unverified'}.`, '/company');
    return ok(res, { company }, 'Company verification updated');
}
export async function reports(req, res) {
    return ok(res, { reports: await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 }).limit(200) });
}
export async function auditLogs(req, res) {
    return ok(res, { logs: await AuditLog.find().populate('actor', 'name email').sort({ createdAt: -1 }).limit(200) });
}
const taxonomySchema = z.object({ name: z.string().trim().min(2).max(80) });
const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export async function categories(req, res) {
    return ok(res, { categories: await Category.find().sort({ name: 1 }) });
}
export async function createCategory(req, res) {
    const d = taxonomySchema.parse(req.body);
    const item = await Category.create({ name: d.name, slug: slugify(d.name) });
    return ok(res, { category: item }, 'Category created', 201);
}
export async function toggleCategory(req, res) {
    const item = await Category.findById(req.params.id);
    if (!item)
        return fail(res, 'Category not found', 404);
    item.active = !item.active;
    await item.save();
    await audit(req.user._id, 'TOGGLE_CATEGORY', 'Category', item._id, { active: item.active });
    return ok(res, { category: item }, 'Category updated');
}
export async function skills(req, res) {
    return ok(res, { skills: await Skill.find().sort({ name: 1 }) });
}
export async function createSkill(req, res) {
    const d = taxonomySchema.extend({ name: z.string().trim().min(2).max(60) }).parse(req.body);
    const item = await Skill.create({ name: d.name, slug: slugify(d.name) });
    return ok(res, { skill: item }, 'Skill created', 201);
}
export async function toggleSkill(req, res) {
    const item = await Skill.findById(req.params.id);
    if (!item)
        return fail(res, 'Skill not found', 404);
    item.active = !item.active;
    await item.save();
    await audit(req.user._id, 'TOGGLE_SKILL', 'Skill', item._id, { active: item.active });
    return ok(res, { skill: item }, 'Skill updated');
}
