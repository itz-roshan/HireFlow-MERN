import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true, maxlength: 50 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true, maxlength: 300 },
    read: { type: Boolean, default: false, index: true }
}, { timestamps: true });
schema.index({ user: 1, read: 1, createdAt: -1 });
export default mongoose.model('Notification', schema);
