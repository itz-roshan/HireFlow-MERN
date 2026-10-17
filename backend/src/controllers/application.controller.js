import { isValidObjectId } from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { applicationSchema } from '../validators/application.js';
import { statusSchema } from '../validators/job.js';
import { notify } from '../services/notification.service.js';
import { audit } from '../services/audit.service.js';
import { ok, fail } from '../utils/api.js';
export async function apply(req, res) {
    const d = applicationSchema.parse(req.body);
    if (!isValidObjectId(d.jobId))
        return fail(res, 'Invalid job id', 400);
    if (!req.user.resumeUrl)
        return fail(res, 'Please upload a resume before applying', 400);
    const job = await Job.findOne({ _id: d.jobId, published: true });
    if (!job)
        return fail(res, 'Job is not available', 404);
    if (job.deadline && job.deadline < new Date())
        return fail(res, 'Application deadline has passed', 400);
    if (await Application.findOne({ job: job._id, applicant: req.user._id }))
        return fail(res, 'You have already applied for this job', 409);
    let application;
    try {
        application = await Application.create({
            job: job._id,
            applicant: req.user._id,
            resumeUrl: req.user.resumeUrl,
            coverLetter: d.coverLetter,
            expectedSalary: d.expectedSalary,
            noticePeriod: d.noticePeriod,
            history: [{ status: 'APPLIED', changedBy: req.user._id }]
        });
    }
    catch (error) {
        // The unique compound index is the final guard against simultaneous duplicate submissions.
        if (error?.code === 11000)
            return fail(res, 'You have already applied for this job', 409);
        throw error;
    }
    await notify(job.recruiter, 'APPLICATION', 'New application', `${req.user.name} applied for ${job.title}`, '/applicants');
    await audit(req.user._id, 'APPLY_JOB', 'Application', application._id, { job: job.title });
    return ok(res, { application }, 'Application submitted', 201);
}
export async function checkMine(req, res) {
    if (!isValidObjectId(req.params.jobId))
        return fail(res, 'Invalid job id', 400);
    const application = await Application.findOne({
        job: req.params.jobId,
        applicant: req.user._id
    }).select('_id status createdAt updatedAt');
    return ok(res, { applied: Boolean(application), application });
}
export async function mine(req, res) {
    const applications = await Application.find({ applicant: req.user._id })
        .populate({ path: 'job', populate: { path: 'company', select: 'name logo location' } })
        .sort({ createdAt: -1 });
    return ok(res, { applications });
}
export async function recruiter(req, res) {
    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id title company location type').lean();
    const jobIds = recruiterJobs.map((job) => job._id);
    const applications = await Application.find({ job: { $in: jobIds } })
        .populate('applicant', 'name email headline skills experience resumeUrl location avatar social education bio')
        .populate('job', 'title company location type')
        .sort({ createdAt: -1 });
    return ok(res, { applications });
}
export async function status(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid application id', 400);
    const d = statusSchema.parse(req.body);
    const application = await Application.findById(req.params.id).populate('job').populate('applicant', 'name');
    if (!application || !application.job || String(application.job.recruiter) !== String(req.user._id))
        return fail(res, 'Application not found or access denied', 404);
    const transitions = {
        APPLIED: ['UNDER_REVIEW', 'REJECTED'],
        UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
        SHORTLISTED: ['INTERVIEW', 'REJECTED'],
        INTERVIEW: ['OFFERED', 'REJECTED'],
        OFFERED: ['HIRED', 'REJECTED'],
        HIRED: [],
        REJECTED: [],
        WITHDRAWN: []
    };
    if (!transitions[application.status]?.includes(d.status))
        return fail(res, `Cannot move application from ${application.status.replace('_', ' ')} to ${d.status.replace('_', ' ')}`, 400);
    application.status = d.status;
    application.history.push({ status: d.status, note: d.note, changedBy: req.user._id });
    await application.save();
    await audit(req.user._id, 'UPDATE_APPLICATION_STATUS', 'Application', application._id, { status: d.status });
    await notify(
        application.applicant._id,
        'APPLICATION_STATUS',
        'Application updated',
        `Your application for ${application.job.title} is now ${d.status.replace('_', ' ')}`,
        '/applications'
    );
    return ok(res, { application }, 'Status updated');
}
export async function withdraw(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid application id', 400);
    const application = await Application.findOne({ _id: req.params.id, applicant: req.user._id }).populate('job');
    if (!application)
        return fail(res, 'Application not found', 404);
    if (['HIRED', 'REJECTED', 'WITHDRAWN'].includes(application.status))
        return fail(res, 'This application cannot be withdrawn now', 400);
    application.status = 'WITHDRAWN';
    application.history.push({ status: 'WITHDRAWN', changedBy: req.user._id });
    await application.save();
    if (application.job?.recruiter)
        await notify(application.job.recruiter, 'APPLICATION_STATUS', 'Candidate withdrew', `${req.user.name} withdrew an application for ${application.job.title}`, '/applicants');
    await audit(req.user._id, 'WITHDRAW_APPLICATION', 'Application', application._id);
    return ok(res, { application }, 'Application withdrawn');
}
