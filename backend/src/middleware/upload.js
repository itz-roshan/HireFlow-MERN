import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { env } from '../config/env.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, '../../uploads');
const resumeDir = path.join(baseDir, 'resumes');
const imageDir = path.join(baseDir, 'images');
fs.mkdirSync(resumeDir, { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });
const fileName = (file) => `${Date.now()}-${Math.random().toString(36).slice(2, 12)}${path.extname(file.originalname).toLowerCase()}`;
const imageStorage = multer.diskStorage({ destination: (_, __, cb) => cb(null, imageDir), filename: (_, file, cb) => cb(null, fileName(file)) });
const resumeStorage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, resumeDir),
    filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 12)}.pdf`)
});
export const resumeUpload = multer({
    storage: resumeStorage,
    limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
    fileFilter: (_, file, cb) => cb(null, file.mimetype === 'application/pdf')
});
export const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 3 * 1024 * 1024, files: 1 },
    fileFilter: (_, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
export const isPdfMagic = (buffer) => buffer?.subarray?.(0, 4)?.toString() === '%PDF';
export const isImageMagic = (buffer) => {
    if (!buffer)
        return false;
    const p = buffer.subarray(0, 12);
    const png = p.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    const jpg = p[0] === 0xff && p[1] === 0xd8 && p[2] === 0xff;
    const webp = p.subarray(0, 4).toString() === 'RIFF' && p.subarray(8, 12).toString() === 'WEBP';
    return png || jpg || webp;
};
export { resumeDir, imageDir };
