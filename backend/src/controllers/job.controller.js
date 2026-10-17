import Job from '../models/Job.js';
import { isValidObjectId } from 'mongoose';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import { jobSchema } from '../validators/job.js';
import { ok, fail } from '../utils/api.js';
import { audit } from '../services/audit.service.js';
const escapeRegex = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function normalize(d) {
    const x = { ...d, benefits: d.benefits || [], skills: d.skills || [] };
    if (x.deadline)
        x.deadline = new Date(x.deadline);
    return x;
}
export async function list(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 30);
    const q = String(req.query.search || '').trim();
    const loc = String(req.query.location || '').trim();
    const type = String(req.query.type || '').trim();
    const mode = String(req.query.workMode || '').trim();
    const category = String(req.query.category || '').trim();
    const f = { published: true };
    if (q) {
        const safe = escapeRegex(q);
        f.$or = [
            { title: new RegExp(safe, 'i') },
            { description: new RegExp(safe, 'i') },
            { requirements: new RegExp(safe, 'i') },
            { skills: new RegExp(safe, 'i') }
        ];
    }
    if (loc)
        f.location = new RegExp(escapeRegex(loc), 'i');
    if (type)
        f.type = type;
    if (mode)
        f.workMode = mode;
    if (category)
        f.category = category;
    const [jobs, total] = await Promise.all([
        Job.find(f).populate('company', 'name logo location verified').sort({ featured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Job.countDocuments(f)
    ]);
    return ok(res, { jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
export async function featured(req, res) {
    const jobs = await Job.find({ published: true, featured: true }).populate('company', 'name logo location verified').limit(6).sort({ createdAt: -1 });
    return ok(res, { jobs });
}
export async function one(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid job id', 400);
    const job = await Job.findById(req.params.id).populate('company', 'name logo location website description verified').populate('recruiter', 'name email avatar');
    if (!job)
        return fail(res, 'Job not found', 404);
    const isOwner = String(job.recruiter?._id || job.recruiter) === String(req.user?._id);
    const isAdmin = req.user?.role === 'ADMIN';
    if (!job.published && !isOwner && !isAdmin)
        return fail(res, 'Job not found', 404);
    if (!req.user) {
        job.views += 1;
        await job.save();
    }
    return ok(res, { job, applications: await Application.countDocuments({ job: job._id }) });
}
export async function mine(req, res) {
    const jobs = await Job.find({ recruiter: req.user._id }).populate('company', 'name logo').sort({ createdAt: -1 });
    return ok(res, { jobs });
}
export async function create(req, res) {
    const d = normalize(jobSchema.parse(req.body));
    const company = await Company.findOne({ owner: req.user._id });
    if (!company)
        return fail(res, 'Create your company profile first', 400);
    const job = await Job.create({ ...d, recruiter: req.user._id, company: company._id, published: d.published !== false });
    await audit(req.user._id, 'CREATE_JOB', 'Job', job._id, { title: job.title });
    return ok(res, { job }, job.published ? 'Job published' : 'Job saved as draft', 201);
}
export async function update(req, res) {
    const d = normalize(jobSchema.parse(req.body));
    const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user._id }, d, { new: true, runValidators: true });
    if (!job)
        return fail(res, 'Job not found or access denied', 404);
    await audit(req.user._id, 'UPDATE_JOB', 'Job', job._id, { title: job.title });
    return ok(res, { job }, 'Job updated');
}
export async function togglePublish(req, res) {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job)
        return fail(res, 'Job not found or access denied', 404);
    job.published = !job.published;
    await job.save();
    await audit(req.user._id, 'TOGGLE_JOB_VISIBILITY', 'Job', job._id, { published: job.published });
    return ok(res, { job }, job.published ? 'Job published' : 'Job hidden');
}
export async function remove(req, res) {
    const j = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!j)
        return fail(res, 'Job not found or access denied', 404);
    const count = await Application.countDocuments({ job: j._id });
    if (count > 0)
        return fail(res, 'This role has applications. Hide it instead of deleting it.', 409);
    await j.deleteOne();
    await audit(req.user._id, 'DELETE_JOB', 'Job', j._id, { title: j.title });
    return ok(res, null, 'Job deleted');
}
