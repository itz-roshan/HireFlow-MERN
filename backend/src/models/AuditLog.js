import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });
schema.index({ createdAt: -1 });
export default mongoose.model('AuditLog', schema);
