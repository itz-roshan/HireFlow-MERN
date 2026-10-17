import Interview from '../models/Interview.js';
import { isValidObjectId } from 'mongoose';
import Application from '../models/Application.js';
import { interviewSchema } from '../validators/interview.js';
import { notify } from '../services/notification.service.js';
import { audit } from '../services/audit.service.js';
import { ok, fail } from '../utils/api.js';
export async function create(req, res) {
    const d = interviewSchema.parse(req.body);
    if (!isValidObjectId(d.applicationId))
        return fail(res, 'Invalid application id', 400);
    const application = await Application.findById(d.applicationId).populate('job');
    if (!application || !application.job || String(application.job.recruiter) !== String(req.user._id))
        return fail(res, 'Application not found or access denied', 404);
    if (['REJECTED', 'WITHDRAWN', 'HIRED'].includes(application.status))
        return fail(res, 'Application is not ready for an interview', 400);
    const date = new Date(d.date);
    const endsAt = new Date(date.getTime() + d.duration * 60000);
    if (date <= new Date())
        return fail(res, 'Interview date must be in the future', 400);
    const existingForApplication = await Interview.exists({ application: application._id, status: { $nin: ['CANCELLED', 'COMPLETED'] } });
    if (existingForApplication)
        return fail(res, 'An active interview already exists for this application. Cancel it before scheduling another.', 409);
    const conflict = await Interview.findOne({
        status: { $nin: ['CANCELLED', 'COMPLETED'] },
        $or: [{ candidate: application.applicant }, { recruiter: req.user._id }],
        date: { $lt: endsAt },
        endsAt: { $gt: date }
    });
    if (conflict)
        return fail(res, 'That interview time overlaps an existing interview', 409);
    const interview = await Interview.create({
        application: application._id,
        candidate: application.applicant,
        recruiter: req.user._id,
        date,
        endsAt,
        duration: d.duration,
        type: d.type,
        meetingLink: d.meetingLink,
        notes: d.notes
    });
    if (application.status !== 'INTERVIEW') {
        application.status = 'INTERVIEW';
        application.history.push({ status: 'INTERVIEW', changedBy: req.user._id });
    }
    await application.save();
    await notify(application.applicant, 'INTERVIEW', 'Interview scheduled', `Interview scheduled for ${application.job.title}`, '/interviews');
    await audit(req.user._id, 'SCHEDULE_INTERVIEW', 'Interview', interview._id, { application: application._id });
    return ok(res, { interview }, 'Interview scheduled', 201);
}
export async function list(req, res) {
    const interviews = await Interview.find({ $or: [{ candidate: req.user._id }, { recruiter: req.user._id }] })
        .populate('candidate', 'name email avatar')
        .populate('recruiter', 'name email avatar')
        .populate({ path: 'application', populate: { path: 'job', select: 'title company location' } })
        .sort({ date: 1 });
    return ok(res, { interviews });
}
export async function update(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid interview id', 400);
    const allowed = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(req.body.status))
        return fail(res, 'Invalid interview status', 400);
    const interview = await Interview.findById(req.params.id);
    if (!interview || ![String(interview.recruiter), String(interview.candidate)].includes(String(req.user._id)))
        return fail(res, 'Interview not found', 404);
    const from = interview.status;
    const candidateTransitions = { SCHEDULED: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['CANCELLED'], COMPLETED: [], CANCELLED: [] };
    const recruiterTransitions = { SCHEDULED: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] };
    const transitions = req.user.role === 'RECRUITER' ? recruiterTransitions : candidateTransitions;
    if (!transitions[from]?.includes(req.body.status))
        return fail(res, `Cannot move interview from ${from} to ${req.body.status}`, 400);
    interview.status = req.body.status;
    await interview.save();
    await audit(req.user._id, 'UPDATE_INTERVIEW_STATUS', 'Interview', interview._id, { from, to: interview.status });
    const recipient = String(interview.candidate) === String(req.user._id) ? interview.recruiter : interview.candidate;
    await notify(recipient, 'INTERVIEW_UPDATE', 'Interview updated', `Interview status changed to ${interview.status.replace('_', ' ')}`, '/interviews');
    return ok(res, { interview }, 'Interview updated');
}
