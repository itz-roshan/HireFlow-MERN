
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import User from './models/User.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import SavedJob from './models/SavedJob.js';
import Notification from './models/Notification.js';
import Interview from './models/Interview.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Report from './models/Report.js';
import AuditLog from './models/AuditLog.js';
import Category from './models/Category.js';
import Skill from './models/Skill.js';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function findOrCreate(Model, filter, data) {
  const existing = await Model.findOne(filter);
  if (existing) return { doc: existing, created: false };

  try {
    const doc = await Model.create(data);
    return { doc, created: true };
  } catch (error) {
    // Handle a concurrent run without overwriting existing data.
    if (error?.code === 11000) {
      const doc = await Model.findOne(filter);
      if (doc) return { doc, created: false };
    }
    throw error;
  }
}

async function main() {
  // Explicit safeguards: this is intentionally not the old destructive seed.
  if (process.env.DEMO_SEED_ENABLED !== 'true') {
    throw new Error('Set DEMO_SEED_ENABLED=true to enable demo seeding.');
  }
  if (process.env.DEMO_SEED_CONFIRM !== 'I_UNDERSTAND') {
    throw new Error('Set DEMO_SEED_CONFIRM=I_UNDERSTAND to confirm.');
  }
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('This script is intended for the live production database.');
  }

  const passwords = {
    admin: required('DEMO_ADMIN_PASSWORD'),
    recruiter: required('DEMO_RECRUITER_PASSWORD'),
    seeker: required('DEMO_SEEKER_PASSWORD')
  };

  for (const [role, password] of Object.entries(passwords)) {
    if (password.length < 12) {
      throw new Error(`DEMO_${role.toUpperCase()}_PASSWORD must be at least 12 characters.`);
    }
  }

  await connectDB();

  const users = [];

  const userSpecs = [
    {
      key: 'admin',
      name: 'HireFlow Demo Admin',
      email: 'demo-admin@hireflow.local',
      role: 'ADMIN'
    },
    {
      key: 'recruiter',
      name: 'Neha Sharma (Demo)',
      email: 'demo-recruiter@hireflow.local',
      role: 'RECRUITER',
      headline: 'Talent Partner',
      location: 'Bengaluru'
    },
    {
      key: 'seeker',
      name: 'Alex Morgan (Demo)',
      email: 'demo-seeker@hireflow.local',
      role: 'JOB_SEEKER',
      headline: 'MCA | Data & Web Enthusiast',
      location: 'Ghaziabad',
      skills: ['React', 'JavaScript', 'Node.js', 'SQL', 'Power BI'],
      education: ['MCA — Invertis University'],
      experience: ['Data Analyst Intern']
    }
  ];

  for (const spec of userSpecs) {
    const email = spec.email.toLowerCase();
    let user = await User.findOne({ email }).select('+passwordHash');

    if (user) {
      if (user.role !== spec.role) {
        throw new Error(
          `Role conflict for ${email}. No data was changed; inspect this account manually.`
        );
      }
      console.log(`Existing demo user preserved: ${email}`);
    } else {
      const passwordHash = await bcrypt.hash(passwords[spec.key], 12);
      user = await User.create({
        ...spec,
        email,
        passwordHash,
        status: 'ACTIVE'
      });
      console.log(`Created demo user: ${email}`);
    }

    users.push(user);
  }

  const [admin, recruiter, seeker] = users;

  const categories = [
    'Engineering', 'Analytics', 'Design',
    'Marketing', 'Sales', 'Operations'
  ];

  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z 0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await findOrCreate(Category, { slug }, { name, slug });
  }

  const skillNames = [
    'React', 'JavaScript', 'Node.js', 'MongoDB', 'Express',
    'SQL', 'Power BI', 'Excel', 'Figma', 'Testing',
    'Playwright', 'REST API', 'UX', 'UI'
  ];

  for (const name of skillNames) {
    const slug = name.toLowerCase().replace(/[^a-z 0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await findOrCreate(Skill, { slug }, { name, slug });
  }

  const { doc: company } = await findOrCreate(
    Company,
    { slug: 'hireflow-demo-novatech' },
    {
      name: 'NovaTech Labs (Demo)',
      slug: 'hireflow-demo-novatech',
      owner: recruiter._id,
      location: 'Bengaluru',
      website: 'https://example.com',
      description: 'Sample company for the HireFlow academic demonstration.',
      verified: true
    }
  );

  const jobSpecs = [
    {
      title: 'React Developer',
      description: 'Build web interfaces using React and modern JavaScript.',
      responsibilities: 'Create reusable UI components and integrate APIs.',
      requirements: 'React, JavaScript, Git and REST APIs.',
      location: 'Bengaluru',
      workMode: 'HYBRID',
      type: 'FULL_TIME',
      experience: '1–3 years',
      minSalary: 600000,
      maxSalary: 1000000,
      skills: ['React', 'JavaScript', 'REST API'],
      category: 'Engineering',
      benefits: ['Learning budget', 'Flexible hours'],
      featured: true
    },
    {
      title: 'Node.js Backend Engineer',
      description: 'Build APIs and services using Node.js and MongoDB.',
      responsibilities: 'Develop Express APIs and improve reliability.',
      requirements: 'Node.js, Express, MongoDB and API design.',
      location: 'Remote',
      workMode: 'REMOTE',
      type: 'FULL_TIME',
      experience: '2–5 years',
      minSalary: 800000,
      maxSalary: 1400000,
      skills: ['Node.js', 'MongoDB', 'Express'],
      category: 'Engineering',
      benefits: ['Remote first', 'Health cover'],
      featured: true
    },
    {
      title: 'Data Analyst Intern',
      description: 'Analyze business data using SQL, Excel and dashboards.',
      responsibilities: 'Clean datasets, build reports and communicate trends.',
      requirements: 'SQL basics, Excel and analytical thinking.',
      location: 'Delhi',
      workMode: 'ONSITE',
      type: 'INTERNSHIP',
      experience: 'Fresher',
      minSalary: 150000,
      maxSalary: 240000,
      skills: ['SQL', 'Excel', 'Power BI'],
      category: 'Analytics',
      benefits: ['Mentorship', 'Certificate'],
      featured: true
    },
    {
      title: 'Product Designer',
      description: 'Design clear, accessible candidate and recruiter experiences.',
      responsibilities: 'Create user flows, prototypes and interface designs.',
      requirements: 'Figma, UX and UI fundamentals.',
      location: 'Pune',
      workMode: 'HYBRID',
      type: 'FULL_TIME',
      experience: '2–4 years',
      minSalary: 700000,
      maxSalary: 1200000,
      skills: ['Figma', 'UX', 'UI'],
      category: 'Design',
      benefits: ['Design budget', 'Flexible hours'],
      featured: true
    },
    {
      title: 'QA Automation Engineer',
      description: 'Build automated tests for important application workflows.',
      responsibilities: 'Create test suites and investigate test failures.',
      requirements: 'JavaScript, Playwright or Selenium.',
      location: 'Hyderabad',
      workMode: 'HYBRID',
      type: 'FULL_TIME',
      experience: '1–3 years',
      minSalary: 550000,
      maxSalary: 900000,
      skills: ['Testing', 'JavaScript', 'Playwright'],
      category: 'Engineering',
      benefits: ['Learning budget']
    }
  ];

  const jobs = [];

  for (const spec of jobSpecs) {
    const filter = { title: spec.title, recruiter: recruiter._id };
    const { doc } = await findOrCreate(Job, filter, {
      ...spec,
      recruiter: recruiter._id,
      company: company._id
    });
    jobs.push(doc);
  }

  // Create one sample application only if this demo pair has none.
  const { doc: application } = await findOrCreate(
    Application,
    { job: jobs[0]._id, applicant: seeker._id },
    {
      job: jobs[0]._id,
      applicant: seeker._id,
      coverLetter: 'I enjoy building clean interfaces and reliable APIs.',
      expectedSalary: 750000,
      noticePeriod: 'Immediate',
      status: 'UNDER_REVIEW',
      history: [
        {
          status: 'APPLIED',
          changedBy: seeker._id,
          at: new Date()
        },
        {
          status: 'UNDER_REVIEW',
          changedBy: recruiter._id,
          note: 'Demo profile is being reviewed.',
          at: new Date()
        }
      ]
    }
  );

  await findOrCreate(
    SavedJob,
    { user: seeker._id, job: jobs[0]._id },
    { user: seeker._id, job: jobs[0]._id }
  );

  await findOrCreate(
    Interview,
    { application: application._id },
    {
      application: application._id,
      candidate: seeker._id,
      recruiter: recruiter._id,
      date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 45 * 60 * 1000),
      duration: 45,
      type: 'ONLINE',
      meetingLink: 'https://meet.google.com/',
      status: 'SCHEDULED'
    }
  );

  const notificationSpecs = [
    {
      user: seeker._id,
      type: 'WELCOME',
      title: 'Welcome to HireFlow',
      message: 'Complete your demo profile to explore the platform.',
      link: '/profile'
    },
    {
      user: seeker._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Demo interview scheduled',
      message: `Your ${jobs[0].title} demo interview is coming up.`,
      link: '/interviews'
    },
    {
      user: recruiter._id,
      type: 'APPLICATION_SUBMITTED',
      title: 'New demo application',
      message: `Alex Morgan (Demo) applied for ${jobs[0].title}.`,
      link: '/applicants'
    }
  ];

  for (const item of notificationSpecs) {
    await findOrCreate(
      Notification,
      { user: item.user, title: item.title },
      item
    );
  }

  const participantKey = [String(seeker._id), String(recruiter._id)].sort().join('_');
  const { doc: conversation } = await findOrCreate(
    Conversation,
    { participantKey },
    {
      participants: [seeker._id, recruiter._id],
      participantKey,
      lastMessage: 'Thanks for applying — we will be in touch.',
      lastMessageAt: new Date()
    }
  );

  await findOrCreate(
    Message,
    { conversation: conversation._id, sender: recruiter._id },
    {
      conversation: conversation._id,
      sender: recruiter._id,
      body: 'Thanks for applying — we will be in touch.',
      readBy: [recruiter._id]
    }
  );

  await findOrCreate(
    Report,
    { reporter: seeker._id, targetType: 'JOB', targetId: jobs[1]._id },
    {
      reporter: seeker._id,
      targetType: 'JOB',
      targetId: jobs[1]._id,
      reason: 'Demo report for moderation workflow.'
    }
  );

  await findOrCreate(
    AuditLog,
    { actor: admin._id, action: 'DEMO_DATA_CREATED' },
    {
      actor: admin._id,
      action: 'DEMO_DATA_CREATED',
      entityType: 'System',
      metadata: { jobs: jobs.length }
    }
  );

  console.log('Demo setup completed. Existing unrelated data was not deleted.');
  console.log('Demo users:', userSpecs.map((u) => u.email).join(', '));
  console.log('Demo jobs:', jobs.length);
}

main()
  .catch((error) => {
    console.error('Demo setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
