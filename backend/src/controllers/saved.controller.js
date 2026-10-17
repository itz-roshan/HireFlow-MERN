import { isValidObjectId } from 'mongoose';
import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { ok, fail } from '../utils/api.js';
export async function list(req, res) {
    const saved = await SavedJob.find({ user: req.user._id })
        .populate({
            path: 'job',
            populate: {
                path: 'company',
                select: 'name logo location verified'
            }
        })
        .sort({ createdAt: -1 });
    return ok(res, { saved });
}
export async function check(req, res) {
    if (!isValidObjectId(req.params.jobId))
        return fail(res, 'Invalid job id', 400);
    const saved = await SavedJob.exists({ user: req.user._id, job: req.params.jobId });
    return ok(res, { saved: Boolean(saved) });
}
export async function add(req, res) {
    if (!isValidObjectId(req.params.jobId))
        return fail(res, 'Invalid job id', 400);
    const job = await Job.findOne({ _id: req.params.jobId, published: true });
    if (!job)
        return fail(res, 'Job not found', 404);
    await SavedJob.updateOne({ user: req.user._id, job: job._id }, { $setOnInsert: { user: req.user._id, job: job._id } }, { upsert: true });
    return ok(res, null, 'Job saved');
}
export async function remove(req, res) {
    if (!isValidObjectId(req.params.jobId))
        return fail(res, 'Invalid job id', 400);
    await SavedJob.deleteOne({ user: req.user._id, job: req.params.jobId });
    return ok(res, null, 'Job removed');
}
