import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import { ok, fail } from '../utils/api.js';
import { isImageMagic } from '../middleware/upload.js';
const schema = z.object({
    name: z.string().trim().min(2).max(120),
    website: z.string().url().optional().or(z.literal('')),
    description: z.string().max(3000).optional(),
    location: z.string().max(120).optional(),
    logo: z.string().max(300).optional()
});
const slug = v => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
const safeDelete = (relative) => {
    if (!relative || !relative.startsWith('/uploads/')) {
        return;
    }

    const uploadsRoot = path.resolve(root, 'uploads');
    const target = path.resolve(root, relative.slice(1).split('/').join(path.sep));
    if (!target.startsWith(`${uploadsRoot}${path.sep}`)) {
        return;
    }

    try {
        fs.unlinkSync(target);
    } catch {
        // The file may already have been removed or may not exist locally.
    }
};
export async function list(req, res) {
    const q = String(req.query.search || '').trim();
    const c = await Company.find(q ? { $text: { $search: q } } : {}).sort({ verified: -1, name: 1 }).limit(50);
    return ok(res, { companies: c });
}
export async function getMine(req, res) {
    return ok(res, { company: await Company.findOne({ owner: req.user._id }) });
}
export async function save(req, res) {
    const d = schema.parse(req.body);
    const company = await Company.findOneAndUpdate(
        { owner: req.user._id },
        { ...d, slug: `${slug(d.name)}-${String(req.user._id).slice(-6)}` },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return ok(res, { company }, 'Company saved');
}
export async function uploadLogo(req, res) {
    if (!req.file)
        return fail(res, 'A logo image is required', 400);
    const bytes = fs.readFileSync(req.file.path);
    if (!isImageMagic(bytes)) {
        try {
            fs.unlinkSync(req.file.path);
        }
        catch { }
        ;
        return fail(res, 'The uploaded image is invalid', 400);
    }
    const c = await Company.findOne({ owner: req.user._id });
    if (!c) {
        try {
            fs.unlinkSync(req.file.path);
        }
        catch { }
        ;
        return fail(res, 'Create your company profile first', 400);
    }
    const old = c.logo;
    c.logo = `/uploads/images/${req.file.filename}`;
    await c.save();
    safeDelete(old);
    return ok(res, { company: c }, 'Company logo updated');
}
export async function getOne(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid company id', 400);
    const c = await Company.findById(req.params.id);
    if (!c)
        return fail(res, 'Company not found', 404);
    return ok(res, { company: c });
}
export async function jobs(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid company id', 400);
    const j = await Job.find({ company: req.params.id, published: true }).populate('company', 'name logo location verified').sort({ createdAt: -1 });
    return ok(res, { jobs: j });
}
