import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getOrCreateConversation } from '../socket.js';
import { ok, fail } from '../utils/api.js';
const r = Router();
r.use(requireAuth);
r.get('/conversations', async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate('participants', 'name avatar role')
        .sort({ lastMessageAt: -1, updatedAt: -1 });

    return ok(res, { conversations });
});
r.post('/conversations', async (req, res) => {
    const { userId } = z.object({ userId: z.string().trim().min(1) }).parse(req.body);
    if (!isValidObjectId(userId))
        return fail(res, 'Invalid user id', 400);
    if (String(userId) === String(req.user._id))
        return fail(res, 'Cannot message yourself', 400);
    const other = await User.findById(userId).select('_id');
    if (!other)
        return fail(res, 'User not found', 404);
    const c = await getOrCreateConversation(req.user._id, userId);
    return ok(res, { conversation: await c.populate('participants', 'name avatar role') }, 'Conversation ready', 201);
});
r.get('/conversations/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid conversation id', 400);
    const c = await Conversation.findOne({ _id: req.params.id, participants: req.user._id });
    if (!c)
        return fail(res, 'Conversation not found', 404);
    const messages = await Message.find({ conversation: c._id }).populate('sender', 'name avatar').sort({ createdAt: 1 }).limit(300);
    return ok(res, { conversation: c, messages });
});
export default r;
