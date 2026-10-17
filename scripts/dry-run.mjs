import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const mustExist = [
    'package.json',
    'README.md',
    '.nvmrc',
    '.gitignore',
    'docker-compose.yml',
    'frontend/package.json',
    'frontend/index.html',
    'frontend/src/main.jsx',
    'frontend/src/styles/global.css',
    'backend/package.json',
    'backend/src/server.js',
    'backend/src/config/db.js',
    'backend/src/seed.js',
    'backend/src/models/User.js',
    'backend/src/models/Job.js',
    'backend/src/models/Application.js',
    'backend/src/models/Notification.js',
    'backend/src/models/Conversation.js',
    'backend/src/models/Message.js'
];
for (const rel of mustExist)
    if (!fs.existsSync(path.join(root, rel)))
        throw new Error(`Missing required file: ${rel}`);
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}
const backendFiles = walk(path.join(root, 'backend/src')).filter((f) => f.endsWith('.js'));
for (const file of backendFiles)
    execFileSync(process.execPath, ['--check', file], { stdio: 'ignore' });
const frontendFiles = walk(path.join(root, 'frontend/src')).filter((f) => /\.(jsx?|mjs|css)$/.test(f));
const importCandidates = (target) => path.extname(target)
    ? [target]
    : [
        target + '.js',
        target + '.jsx',
        target + '.mjs',
        target + '.css',
        path.join(target, 'index.js'),
        path.join(target, 'index.jsx')
    ];
const missing = [];
for (const file of frontendFiles.filter((f) => /\.(jsx?|mjs)$/.test(f))) {
    const content = fs.readFileSync(file, 'utf8');
    const re = /(?:from\s+|import\s*\()(['"])(\.[^'"]+)\1/g;
    let m;
    while ((m = re.exec(content))) {
        const target = path.resolve(path.dirname(file), m[2]);
        if (!importCandidates(target).some(fs.existsSync))
            missing.push(`${path.relative(root, file)} -> ${m[2]}`);
    }
}
if (missing.length)
    throw new Error(`Missing local imports:\n${missing.join('\n')}`);
const css = fs.readFileSync(path.join(root, 'frontend/src/styles/global.css'), 'utf8');
if (/\\n|\\t/.test(css))
    throw new Error('Literal escaped newline/tab characters found in global.css');
const allSource = [...backendFiles, ...frontendFiles];
for (const file of allSource) {
    const content = fs.readFileSync(file, 'utf8');
    if (/\balert\(|window\.prompt\(|window\.confirm\(/.test(content))
        throw new Error(`Browser alert/prompt/confirm found in ${path.relative(root, file)}`);
}
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const backendPkg = JSON.parse(fs.readFileSync(path.join(root, 'backend/package.json'), 'utf8'));
const frontendPkg = JSON.parse(fs.readFileSync(path.join(root, 'frontend/package.json'), 'utf8'));
if (!rootPkg.workspaces?.includes('frontend') || !rootPkg.workspaces?.includes('backend'))
    throw new Error('Workspace configuration is incomplete');
if (!backendPkg.dependencies?.mongoose)
    throw new Error('Mongoose dependency missing');
if (!backendPkg.dependencies?.['sparse-bitfield'])
    throw new Error('Missing-install guard dependency is not declared');
if (!frontendPkg.dependencies?.react || !frontendPkg.devDependencies?.vite)
    throw new Error('Frontend dependency baseline is incomplete');
console.log(`DRY RUN PASS: ${backendFiles.length} backend files, ${frontendFiles.length} frontend files, 0 missing local imports, CSS clean.`);
