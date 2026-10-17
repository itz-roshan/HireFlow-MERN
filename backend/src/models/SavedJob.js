import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
}, { timestamps: true });
schema.index({ user: 1, job: 1 }, { unique: true });
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model('SavedJob', schema);
