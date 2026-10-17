import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import User from './models/User.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import SavedJob from './models/SavedJob.js';
import Notification from './models/Notification.js';
import Application from './models/Application.js';
import Interview from './models/Interview.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Report from './models/Report.js';
import AuditLog from './models/AuditLog.js';
import Category from './models/Category.js';
import Skill from './models/Skill.js';
if (env.nodeEnv === 'production')
    throw new Error('Seed is disabled in production.');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, '../uploads');
const resumeDir = path.join(uploadsRoot, 'resumes');
fs.mkdirSync(resumeDir, { recursive: true });
// A minimal valid PDF, sufficient for local development and resume download tests.
const demoPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 77 >>
stream
BT
/F1 20 Tf
72 720 Td
(HireFlow Demo Resume) Tj
0 -30 Td
(A development-only resume for smoke testing.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000062 00000 n 
0000000124 00000 n 
0000000271 00000 n 
0000000398 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
476
%%EOF
`;
fs.writeFileSync(path.join(resumeDir, 'demo-resume.pdf'), demoPdf, 'utf8');
try {
    await connectDB();
    // Repeatable development seed. This avoids duplicate-key failures on Engineering,
    // skills, users and all other seeded entities when the command is run again.
    await Promise.all([
        User.deleteMany({}),
        Company.deleteMany({}),
        Job.deleteMany({}),
        SavedJob.deleteMany({}),
        Notification.deleteMany({}),
        Application.deleteMany({}),
        Interview.deleteMany({}),
        Conversation.deleteMany({}),
        Message.deleteMany({}),
        Report.deleteMany({}),
        AuditLog.deleteMany({}),
        Category.deleteMany({}),
        Skill.deleteMany({})
    ]);
    const hash = (password) => bcrypt.hash(password, 12);
    const [adminHash, recruiterHash, seekerHash] = await Promise.all([
        hash('Admin@12345'),
        hash('Recruiter@12345'),
        hash('User@12345')
    ]);
    const admin = await User.create({
        name: 'HireFlow Admin',
        email: 'admin@hireflow.local',
        passwordHash: adminHash,
        role: 'ADMIN'
    });
    const recruiter = await User.create({
        name: 'Neha Sharma',
        email: 'recruiter@hireflow.local',
        passwordHash: recruiterHash,
        role: 'RECRUITER',
        headline: 'Talent Partner',
        location: 'Bengaluru'
    });
    const seeker = await User.create({
        name: 'Alex Morgan',
        email: 'user@hireflow.local',
        passwordHash: seekerHash,
        role: 'JOB_SEEKER',
        headline: 'MCA | Data & Web Enthusiast',
        location: 'Ghaziabad',
        skills: ['React', 'JavaScript', 'Node.js', 'SQL', 'Power BI'],
        education: ['MCA — Invertis University'],
        experience: ['Data Analyst Intern'],
        resumeUrl: '/uploads/resumes/demo-resume.pdf'
    });
    const categories = ['Engineering', 'Analytics', 'Design', 'Marketing', 'Sales', 'Operations'];
    await Category.insertMany(categories.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })));
    const skills = [
        'React',
        'JavaScript',
        'Node.js',
        'MongoDB',
        'Express',
        'SQL',
        'Power BI',
        'Excel',
        'Figma',
        'Testing',
        'Playwright',
        'REST API',
        'UX',
        'UI'
    ];
    await Skill.insertMany(skills.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })));
    const company = await Company.create({
        name: 'NovaTech Labs',
        slug: 'novatech-labs',
        owner: recruiter._id,
        location: 'Bengaluru',
        website: 'https://example.com',
        description: 'A product engineering team building useful software for modern businesses.',
        verified: true
    });
    const jobs = await Job.insertMany([
        {
            title: 'React Developer',
            description: 'Build thoughtful web experiences with React and modern JavaScript. Work closely with product and design to ship features customers use every day.',
            responsibilities: 'Create reusable UI components; integrate REST APIs; improve accessibility and performance.',
            requirements: 'React, JavaScript, Git, REST APIs. Strong problem solving and communication.',
            location: 'Bengaluru',
            workMode: 'HYBRID',
            type: 'FULL_TIME',
            experience: '1–3 years',
            minSalary: 600000,
            maxSalary: 1000000,
            skills: ['React', 'JavaScript', 'REST API'],
            category: 'Engineering',
            benefits: ['Learning budget', 'Flexible hours'],
            recruiter: recruiter._id,
            company: company._id,
            featured: true
        },
        {
            title: 'Node.js Backend Engineer',
            description: 'Design reliable APIs and services that power customer-facing products. Own backend features from data model to monitoring.',
            responsibilities: 'Build Express APIs; model MongoDB collections; improve reliability.',
            requirements: 'Node.js, Express, MongoDB, API design.',
            location: 'Remote',
            workMode: 'REMOTE',
            type: 'FULL_TIME',
            experience: '2–5 years',
            minSalary: 800000,
            maxSalary: 1400000,
            skills: ['Node.js', 'MongoDB', 'Express'],
            category: 'Engineering',
            benefits: ['Remote first', 'Health cover'],
            recruiter: recruiter._id,
            company: company._id,
            featured: true
        },
        {
            title: 'Data Analyst Intern',
            description: 'Turn product and business data into clear insights. Work with SQL, Excel and dashboards while learning from experienced analysts.',
            responsibilities: 'Clean datasets; build reports; communicate trends.',
            requirements: 'SQL basics, Excel and a curious analytical mindset.',
            location: 'Delhi',
            workMode: 'ONSITE',
            type: 'INTERNSHIP',
            experience: 'Fresher',
            minSalary: 150000,
            maxSalary: 240000,
            skills: ['SQL', 'Excel', 'Power BI'],
            category: 'Analytics',
            benefits: ['Mentorship', 'Certificate'],
            recruiter: recruiter._id,
            company: company._id,
            featured: true
        },
        {
            title: 'Product Designer',
            description: 'Design simple experiences for candidates and recruiters. Partner with product and engineering from early concept through delivery.',
            responsibilities: 'Create flows, prototypes and accessible interfaces.',
            requirements: 'Figma, user-centred design and strong communication.',
            location: 'Pune',
            workMode: 'HYBRID',
            type: 'FULL_TIME',
            experience: '2–4 years',
            minSalary: 700000,
            maxSalary: 1200000,
            skills: ['Figma', 'UX', 'UI'],
            category: 'Design',
            benefits: ['Design budget', 'Flexible hours'],
            recruiter: recruiter._id,
            company: company._id,
            featured: true
        },
        {
            title: 'QA Automation Engineer',
            description: 'Help the team release with confidence by building reliable automated coverage across critical customer workflows.',
            responsibilities: 'Create automation suites; investigate failures; partner with engineers.',
            requirements: 'JavaScript, Playwright or Selenium, testing fundamentals.',
            location: 'Hyderabad',
            workMode: 'HYBRID',
            type: 'FULL_TIME',
            experience: '1–3 years',
            minSalary: 550000,
            maxSalary: 900000,
            skills: ['Testing', 'JavaScript', 'Playwright'],
            category: 'Engineering',
            benefits: ['Learning budget'],
            recruiter: recruiter._id,
            company: company._id
        }
    ]);
    // Existing development application for the candidate timeline.
    const application = await Application.create({
        job: jobs[0]._id,
        applicant: seeker._id,
        resumeUrl: seeker.resumeUrl,
        coverLetter: 'I enjoy building clean React interfaces and reliable APIs.',
        expectedSalary: 750000,
        noticePeriod: 'Immediate',
        status: 'UNDER_REVIEW',
        history: [
            { status: 'APPLIED', changedBy: seeker._id, at: new Date(Date.now() - 86400000) },
            { status: 'UNDER_REVIEW', changedBy: recruiter._id, note: 'Profile is being reviewed.', at: new Date() }
        ]
    });
    const interviewStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const interviewEnd = new Date(interviewStart.getTime() + 45 * 60000);
    await Interview.create({
        application: application._id,
        candidate: seeker._id,
        recruiter: recruiter._id,
        date: interviewStart,
        endsAt: interviewEnd,
        duration: 45,
        type: 'ONLINE',
        meetingLink: 'https://meet.google.com/example-hireflow',
        status: 'SCHEDULED'
    });
    await SavedJob.create({ user: seeker._id, job: jobs[0]._id });
    await Notification.create([
        {
            user: seeker._id,
            type: 'WELCOME',
            title: 'Welcome to HireFlow',
            message: 'Complete your profile to make your next application stronger.',
            link: '/profile'
        },
        {
            user: seeker._id,
            type: 'INTERVIEW_SCHEDULED',
            title: 'Interview scheduled',
            message: `Your ${jobs[0].title} interview is coming up.`,
            link: '/interviews'
        },
        {
            user: recruiter._id,
            type: 'APPLICATION_SUBMITTED',
            title: 'New application',
            message: `Alex Morgan applied for ${jobs[0].title}.`,
            link: '/applicants'
        }
    ]);
    const participantKey = [String(seeker._id), String(recruiter._id)].sort().join('_');
    const conversation = await Conversation.create({
        participants: [seeker._id, recruiter._id],
        participantKey,
        lastMessage: 'Thanks for applying — we will be in touch.',
        lastMessageAt: new Date()
    });
    await Message.create({
        conversation: conversation._id,
        sender: recruiter._id,
        body: 'Thanks for applying — we will be in touch.',
        readBy: [recruiter._id]
    });
    await Report.create({
        reporter: seeker._id,
        targetType: 'JOB',
        targetId: jobs[1]._id,
        reason: 'Demo report for the moderation workflow.'
    });
    await AuditLog.create({
        actor: admin._id,
        action: 'SEED_DATA_CREATED',
        entityType: 'System',
        metadata: { jobs: jobs.length }
    });
    console.log('');
    console.log('========================================');
    console.log('✓ HireFlow seed completed successfully');
    console.log('========================================');
    console.log(`✓ ${jobs.length} jobs created`);
    console.log('✓ categories and skills created');
    console.log('✓ candidate + recruiter + admin created');
    console.log('✓ sample resume created');
    console.log('✓ application + interview created');
    console.log('✓ notifications + conversation + message created');
    console.log('✓ report + audit log created');
    console.log('');
    console.log('Admin     admin@hireflow.local / Admin@12345');
    console.log('Recruiter recruiter@hireflow.local / Recruiter@12345');
    console.log('Seeker    user@hireflow.local / User@12345');
}
catch (error) {
    console.error('✕ HireFlow seed failed:', error.message);
    if (error?.code === 11000)
        console.error('A unique index rejected duplicate development data. The seed should be repeatable; check the database state and run again.');
    process.exitCode = 1;
}
finally {
    await mongoose.disconnect();
}
