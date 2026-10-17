import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import Report from '../models/Report.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { ok, fail } from '../utils/api.js';
import { audit } from '../services/audit.service.js';
import { notify } from '../services/notification.service.js';
const createSchema = z.object({
    targetType: z.enum(['JOB', 'COMPANY', 'USER', 'MESSAGE']),
    targetId: z.string().trim().min(1),
    reason: z.string().trim().min(5).max(1000)
});
export async function create(req, res) {
    const d = createSchema.parse(req.body);
    if (!isValidObjectId(d.targetId))
        return fail(res, 'Invalid report target', 400);
    const Model = d.targetType === 'JOB' ? Job : d.targetType === 'COMPANY' ? Company : d.targetType === 'MESSAGE' ? Message : User;
    if (!(await Model.exists({ _id: d.targetId })))
        return fail(res, 'Reported item was not found', 404);
    const existing = await Report.exists({ reporter: req.user._id, targetType: d.targetType, targetId: d.targetId, status: 'OPEN' });
    if (existing)
        return fail(res, 'You already have an open report for this item', 409);
    const report = await Report.create({ ...d, reporter: req.user._id });
    await audit(req.user._id, 'CREATE_REPORT', 'Report', report._id, { targetType: d.targetType });
    const admins = await User.find({ role: 'ADMIN', status: 'ACTIVE' }).select('_id').lean();
    await Promise.all(admins.map((admin) => notify(admin._id, 'REPORT', 'New moderation report', `A ${d.targetType.toLowerCase()} was reported for review.`, '/admin/reports')));
    return ok(res, { report }, 'Report submitted', 201);
}
export async function update(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid report id', 400);
    const status = z.enum(['OPEN', 'REVIEWED', 'RESOLVED']).parse(req.body.status);
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report)
        return fail(res, 'Report not found', 404);
    await audit(req.user._id, 'UPDATE_REPORT', 'Report', report._id, { status });
    await notify(report.reporter, 'REPORT_UPDATE', 'Report updated', `Your report is now ${status.toLowerCase()}.`, '/notifications');
    return ok(res, { report }, 'Report updated');
}
