import { isValidObjectId } from 'mongoose';
import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/api.js';
export async function list(req, res) {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    return ok(res, { notifications, unread });
}
export async function read(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid notification id', 400);
    const result = await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { read: true } });
    if (!result.matchedCount)
        return fail(res, 'Notification not found', 404);
    return ok(res, null, 'Marked read');
}
export async function readAll(req, res) {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    return ok(res, null, 'All marked read');
}
