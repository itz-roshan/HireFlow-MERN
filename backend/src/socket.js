import { Server } from 'socket.io';
import { env } from './config/env.js';
import { ACCESS, verifyAccess } from './utils/jwt.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import User from './models/User.js';
import { notify } from './services/notification.service.js';
function cookieValue(header, name) {
    return header?.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`))?.split('=')[1];
}
export function attachSocket(server) {
    const io = new Server(server, { cors: { origin: env.clientUrl, credentials: true } });
    io.use(async (socket, next) => {
        try {
            const token = cookieValue(socket.handshake.headers.cookie, ACCESS);
            if (!token)
                throw new Error('Unauthorized');
            const payload = verifyAccess(token);
            const user = await User.findById(payload.sub).select('_id name role status sessionVersion');
            if (!user || user.status !== 'ACTIVE' || (payload.sv ?? 0) !== (user.sessionVersion ?? 0))
                throw new Error('Unauthorized');
            socket.user = { sub: String(user._id), name: user.name, role: user.role };
            next();
        }
        catch {
            next(new Error('Unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.sub}`);
        socket.on('conversation:join', async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user.sub }).select('_id');
                if (conversation)
                    socket.join(`conversation:${conversationId}`);
            }
            catch { /* invalid conversation ids are simply ignored */ }
        });
        socket.on('conversation:leave', (conversationId) => socket.leave(`conversation:${conversationId}`));
        socket.on('message:send', async ({ conversationId, body } = {}, acknowledge = () => { }) => {
            try {
                const text = String(body || '').trim();
                if (!text)
                    return acknowledge({ ok: false, message: 'Message cannot be empty.' });
                if (text.length > 2000)
                    return acknowledge({ ok: false, message: 'Message is too long.' });
                const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user.sub });
                if (!conversation)
                    return acknowledge({ ok: false, message: 'Conversation not found.' });
                const message = await Message.create({ conversation: conversation._id, sender: socket.user.sub, body: text, readBy: [socket.user.sub] });
                conversation.lastMessage = text;
                conversation.lastMessageAt = new Date();
                await conversation.save();
                const populated = await message.populate('sender', 'name avatar');
                const other = conversation.participants.find((id) => String(id) !== String(socket.user.sub));
                // Deliver to both participants even when the recipient has not opened this chat room.
                io.to(`user:${socket.user.sub}`).to(`user:${String(other || '')}`).emit('message:new', populated);
                if (other) {
                    // A notification failure must not make an already-persisted message look unsent.
                    await notify(other, 'MESSAGE', 'New message', `${socket.user.name || 'A contact'} sent you a message.`, '/messages').catch(() => { });
                }
                acknowledge({ ok: true, message: populated });
            }
            catch {
                acknowledge({ ok: false, message: 'Message could not be sent.' });
            }
        });
    });
    return io;
}
export async function getOrCreateConversation(a, b) {
    const participants = [a, b].map(String).sort();
    if (participants[0] === participants[1])
        throw new Error('Cannot create a conversation with yourself');
    const activeUsers = await User.countDocuments({ _id: { $in: participants }, status: 'ACTIVE' });
    if (activeUsers !== 2)
        throw new Error('One or more users are not available');
    const participantKey = participants.join('_');
    let conversation = await Conversation.findOne({ participantKey });
    if (!conversation) {
        try {
            conversation = await Conversation.create({ participants, participantKey });
        }
        catch (error) {
            if (error.code !== 11000)
                throw error;
            conversation = await Conversation.findOne({ participantKey });
        }
    }
    return conversation;
}
