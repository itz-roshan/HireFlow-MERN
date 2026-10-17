import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { profileSchema } from '../validators/profile.js';
import { ok, fail } from '../utils/api.js';
import { isImageMagic, isPdfMagic } from '../middleware/upload.js';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
function safeDelete(relative) {
    if (!relative || !relative.startsWith('/uploads/'))
        return;
    const relativePath = relative.replace(/^\/+/, '').replace(/\//g, path.sep);
    const uploadsRoot = path.resolve(projectRoot, 'uploads');
    const abs = path.resolve(projectRoot, relativePath);
    if (!abs.startsWith(uploadsRoot + path.sep))
        return;
    try {
        fs.unlinkSync(abs);
    }
    catch { }
}
export async function get(req, res) {
    const u = await User.findById(req.user._id).select('-passwordHash -refreshTokenHash');
    return ok(res, { user: u });
}
export async function update(req, res) {
    const d = profileSchema.parse(req.body);
    const u = await User.findByIdAndUpdate(req.user._id, d, { new: true, runValidators: true }).select('-passwordHash -refreshTokenHash');
    return ok(res, { user: u }, 'Profile updated');
}
export async function resume(req, res) {
    if (!req.file)
        return fail(res, 'A PDF resume is required', 400);
    const bytes = fs.readFileSync(req.file.path);
    if (!isPdfMagic(bytes)) {
        try {
            fs.unlinkSync(req.file.path);
        }
        catch { }
        ;
        return fail(res, 'The uploaded file is not a valid PDF', 400);
    }
    const old = (await User.findById(req.user._id))?.resumeUrl;
    const u = await User.findByIdAndUpdate(req.user._id, { resumeUrl: `/uploads/resumes/${req.file.filename}` }, { new: true }).select('-passwordHash -refreshTokenHash');
    if (old && !(await Application.exists({ applicant: req.user._id, resumeUrl: old })))
        safeDelete(old);
    return ok(res, { user: u }, 'Resume uploaded');
}
export async function avatar(req, res) {
    if (!req.file)
        return fail(res, 'An image is required', 400);
    const bytes = fs.readFileSync(req.file.path);
    if (!isImageMagic(bytes)) {
        try {
            fs.unlinkSync(req.file.path);
        }
        catch { }
        ;
        return fail(res, 'The uploaded file is not a supported image', 400);
    }
    const old = (await User.findById(req.user._id))?.avatar;
    const u = await User.findByIdAndUpdate(req.user._id, { avatar: `/uploads/images/${req.file.filename}` }, { new: true }).select('-passwordHash -refreshTokenHash');
    if (old)
        safeDelete(old);
    return ok(res, { user: u }, 'Profile photo updated');
}
export async function removeAvatar(req, res) {
    const u = await User.findById(req.user._id).select('avatar');
    if (!u?.avatar)
        return fail(res, 'No profile photo to remove', 404);
    const old = u.avatar;
    u.avatar = undefined;
    await u.save();
    safeDelete(old);
    const fresh = await User.findById(req.user._id).select('-passwordHash -refreshTokenHash');
    return ok(res, { user: fresh }, 'Profile photo removed');
}
export async function removeResume(req, res) {
    const u = await User.findById(req.user._id).select('resumeUrl');
    if (!u?.resumeUrl)
        return fail(res, 'No resume to remove', 404);
    const old = u.resumeUrl;
    const used = await Application.exists({ applicant: req.user._id, resumeUrl: old });
    u.resumeUrl = undefined;
    await u.save();
    if (!used)
        safeDelete(old);
    const fresh = await User.findById(req.user._id).select('-passwordHash -refreshTokenHash');
    return ok(res, { user: fresh }, 'Resume removed');
}
