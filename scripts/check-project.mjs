import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const backend = path.join(root, 'backend/src');
const frontend = path.join(root, 'frontend/src');
const required = [
    'README.md', 'docker-compose.yml', '.gitignore', '.nvmrc',
    'backend/.env.example', 'frontend/.env.example',
    'backend/package.json', 'frontend/package.json', 'package.json'
];
const requiredDirs = [
    'frontend/src/components/applications',
    'frontend/src/components/chat',
    'frontend/src/components/common',
    'frontend/src/components/dashboard',
    'frontend/src/components/jobs',
    'frontend/src/components/layout',
    'frontend/src/components/notifications',
    'frontend/src/components/profile',
    'frontend/src/components/recruiter',
    'frontend/src/components/ui',
    'frontend/src/pages/admin',
    'frontend/src/pages/auth',
    'frontend/src/pages/dashboard',
    'frontend/src/pages/public',
    'frontend/src/pages/recruiter',
    'backend/src/controllers',
    'backend/src/models',
    'backend/src/routes',
    'backend/src/validators'
];
for (const file of required)
    if (!fs.existsSync(path.join(root, file)))
        throw new Error(`Missing required file: ${file}`);
for (const dir of requiredDirs)
    if (!fs.existsSync(path.join(root, dir)))
        throw new Error(`Missing required module folder: ${dir}`);
for (const file of ['package.json', 'backend/package.json', 'frontend/package.json'])
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
    });
}
const backendFiles = walk(backend).filter((file) => file.endsWith('.js'));
for (const file of backendFiles)
    execFileSync(process.execPath, ['--check', file], { stdio: 'ignore' });
const frontendFiles = walk(frontend).filter((file) => /\.(jsx?|mjs)$/.test(file));
const missing = [];
for (const file of frontendFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const re = /from\s+['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = re.exec(content))) {
        const target = path.resolve(path.dirname(file), match[1]);
        const candidates = path.extname(target)
            ? [target]
            : [
                target + '.js',
                target + '.jsx',
                target + '.mjs',
                path.join(target, 'index.js'),
                path.join(target, 'index.jsx')
            ];
        if (!candidates.some(fs.existsSync))
            missing.push(`${path.relative(root, file)} -> ${match[1]}`);
    }
}
if (missing.length)
    throw new Error(`Missing local imports:\n${missing.join('\n')}`);
const sourceFiles = [...backendFiles, ...frontendFiles];
for (const file of sourceFiles) {
    const text = fs.readFileSync(file, 'utf8');
    if (/\balert\(|window\.prompt\(|window\.confirm\(/.test(text))
        throw new Error(`Browser prompt/alert UI found in: ${path.relative(root, file)}`);
}
const envExamples = [path.join(root, 'backend/.env.example'), path.join(root, 'frontend/.env.example')].map((file) => fs.readFileSync(file, 'utf8'));
if (envExamples.some((text) => text.includes('super-secret') || text.includes('Admin@12345')))
    throw new Error('Real/demo secrets must not be embedded in env examples.');
console.log(`HireFlow static checks passed: ${backendFiles.length} backend JS files, ${frontendFiles.length} frontend JS/JSX files, 0 missing imports.`);
