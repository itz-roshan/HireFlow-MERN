import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, minlength: 40, maxlength: 10000 },
    responsibilities: { type: String, maxlength: 5000 },
    requirements: { type: String, maxlength: 5000 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    workMode: { type: String, enum: ['ONSITE', 'HYBRID', 'REMOTE'], default: 'ONSITE' },
    type: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'], default: 'FULL_TIME' },
    experience: { type: String, maxlength: 80 },
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },
    skills: { type: [String], default: [] },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    benefits: { type: [String], default: [] },
    deadline: Date,
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    views: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
schema.index({ title: 'text', description: 'text', requirements: 'text', skills: 'text' });
schema.index({ company: 1, published: 1, createdAt: -1 });
schema.index({ recruiter: 1, createdAt: -1 });
schema.index({ location: 1, category: 1, type: 1, workMode: 1, createdAt: -1 });
schema.pre('validate', function () {
    if (this.minSalary != null && this.maxSalary != null && this.maxSalary < this.minSalary) {
        this.invalidate('maxSalary', 'Maximum salary must be >= minimum salary');
    }
});
export default mongoose.model('Job', schema);
