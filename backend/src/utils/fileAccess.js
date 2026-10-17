import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const resumeDir = path.join(projectRoot, 'uploads', 'resumes');
export function fileNameFromUrl(value) {
    if (!value || typeof value !== 'string' || !value.startsWith('/uploads/resumes/'))
        return null;
    const name = path.basename(value);
    if (!name || name.includes('..'))
        return null;
    return name;
}
export function absoluteResumePath(value) {
    const name = fileNameFromUrl(value);
    if (!name)
        return null;
    const full = path.resolve(resumeDir, name);
    if (!full.startsWith(path.resolve(resumeDir) + path.sep))
        return null;
    return full;
}
export function resumeExists(value) {
    const full = absoluteResumePath(value);
    return Boolean(full && fs.existsSync(full));
}
