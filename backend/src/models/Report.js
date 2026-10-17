import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['JOB', 'COMPANY', 'USER', 'MESSAGE'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['OPEN', 'REVIEWED', 'RESOLVED'], default: 'OPEN' }
}, { timestamps: true });
schema.index({ reporter: 1, targetType: 1, targetId: 1, status: 1 });
export default mongoose.model('Report', schema);
