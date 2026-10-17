import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true, index: true }
}, { timestamps: true });
export default mongoose.model('Skill', schema);
