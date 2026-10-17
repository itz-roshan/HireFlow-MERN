import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['JOB_SEEKER', 'RECRUITER', 'ADMIN'], default: 'JOB_SEEKER', index: true },
    status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE', index: true },
    avatar: String,
    phone: String,
    location: String,
    headline: String,
    bio: String,
    skills: { type: [String], default: [] },
    education: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    social: { linkedin: String, github: String, portfolio: String },
    resumeUrl: String,
    refreshTokenHash: { type: String, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: Date
}, { timestamps: true });
schema.index({ name: 'text', headline: 'text', skills: 'text' });
export default mongoose.model('User', schema);
