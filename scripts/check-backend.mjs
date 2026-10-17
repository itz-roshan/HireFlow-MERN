import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'backend', 'src');
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}
const files = walk(src).filter((file) => file.endsWith('.js'));
for (const file of files) {
    execFileSync(process.execPath, ['--check', file], { stdio: 'ignore' });
}
for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const re = /from\s+['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = re.exec(text))) {
        const target = path.resolve(path.dirname(file), match[1]);
        const candidates = path.extname(target)
            ? [target]
            : [target + '.js', target + '.mjs', path.join(target, 'index.js')];
        if (!candidates.some(fs.existsSync)) {
            throw new Error(`Missing backend import: ${path.relative(root, file)} -> ${match[1]}`);
        }
    }
}
console.log(`Backend checks passed: ${files.length} JS files.`);
