import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    duration: { type: Number, default: 45, min: 15, max: 240 },
    type: { type: String, enum: ['ONLINE', 'PHONE', 'ONSITE'], default: 'ONLINE' },
    meetingLink: String,
    notes: String,
    status: { type: String, enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }
}, { timestamps: true });
schema.index({ candidate: 1, date: 1, endsAt: 1 });
schema.index({ recruiter: 1, date: 1, endsAt: 1 });
export default mongoose.model('Interview', schema);
