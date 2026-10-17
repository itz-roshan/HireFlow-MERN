import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    participantKey: { type: String, unique: true, index: true },
    lastMessage: String,
    lastMessageAt: Date
}, { timestamps: true });
schema.index({ participants: 1 });
export default mongoose.model('Conversation', schema);
