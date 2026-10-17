import mongoose from 'mongoose';
const hist = new mongoose.Schema({
    status: String,
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
}, { _id: false });
const schema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, trim: true, maxlength: 300 },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    expectedSalary: { type: Number, min: 0 },
    noticePeriod: { type: String, trim: true, maxlength: 100 },
    status: {
        type: String,
        enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'],
        default: 'APPLIED'
    },
    history: { type: [hist], default: [] }
}, { timestamps: true });
schema.index({ applicant: 1, createdAt: -1 });
schema.index({ job: 1, status: 1 });
schema.index({ job: 1, createdAt: -1 });
schema.index({ job: 1, applicant: 1 }, { unique: true });
export default mongoose.model('Application', schema);
