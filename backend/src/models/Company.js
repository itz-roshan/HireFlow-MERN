import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    website: { type: String, maxlength: 300 },
    description: { type: String, maxlength: 3000 },
    location: { type: String, maxlength: 120 },
    logo: { type: String, maxlength: 300 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    verified: { type: Boolean, default: false, index: true }
}, { timestamps: true });
schema.index({ name: 'text', description: 'text' });
export default mongoose.model('Company', schema);
