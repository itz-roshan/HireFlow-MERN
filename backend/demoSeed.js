
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Company from './src/models/Company.js';
import Job from './src/models/Job.js';

// These accounts are managed by this script.
// Existing passwords for these exact accounts are regenerated
// so the login credentials from the earlier failed run can be recovered.
const RESET_LISTED_ACCOUNT_PASSWORDS = true;

const admins = [
  { name: 'Roshan Kumar', email: 'roshan.kumar@hireflow.local' },
  { name: 'Admin User', email: 'admin@hireflow.local' }
];

const recruiters = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@hireflow.local' },
  { name: 'Neha Verma', email: 'neha.verma@hireflow.local' },
  { name: 'Arjun Patel', email: 'arjun.patel@hireflow.local' },
  { name: 'Kavita Gupta', email: 'kavita.gupta@hireflow.local' }
];

const seekers = [
  { name: 'Rohan Mishra', email: 'rohan.mishra@hireflow.local' },
  { name: 'Ananya Das', email: 'ananya.das@hireflow.local' }
];

const companyData = [
  {
    name: 'Nexora Technologies',
    slug: 'nexora-technologies',
    location: 'Noida, India'
  },
  {
    name: 'BrightPath Analytics',
    slug: 'brightpath-analytics',
    location: 'Bengaluru, India'
  },
  {
    name: 'CloudPeak Solutions',
    slug: 'cloudpeak-solutions',
    location: 'Hyderabad, India'
  },
  {
    name: 'PixelCraft Digital',
    slug: 'pixelcraft-digital',
    location: 'Delhi, India'
  }
];

const jobData = [
  {
    title: 'Junior Data Analyst',
    description:
      'Analyze business datasets, identify trends, prepare reports and share actionable insights with business teams.',
    location: 'Noida, India',
    workMode: 'HYBRID',
    type: 'FULL_TIME',
    experience: '0–1 years',
    minSalary: 300000,
    maxSalary: 500000,
    skills: ['SQL', 'Excel', 'Python', 'Power BI'],
    category: 'Data Analytics'
  },
  {
    title: 'Data Analyst Intern',
    description:
      'Assist with data cleaning, exploratory analysis, dashboard creation and reporting for business stakeholders.',
    location: 'Bengaluru, India',
    workMode: 'REMOTE',
    type: 'INTERNSHIP',
    experience: 'Fresher',
    minSalary: 120000,
    maxSalary: 240000,
    skills: ['Python', 'Pandas', 'SQL', 'Excel'],
    category: 'Data Analytics'
  },
  {
    title: 'Frontend Developer',
    description:
      'Develop responsive user interfaces, improve accessibility and collaborate with designers and backend engineers.',
    location: 'Delhi, India',
    workMode: 'HYBRID',
    type: 'FULL_TIME',
    experience: '0–2 years',
    minSalary: 350000,
    maxSalary: 600000,
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    category: 'Software Development'
  },
  {
    title: 'MERN Stack Developer Intern',
    description:
      'Assist with web application development using MongoDB, Express, React and Node.js while learning industry practices.',
    location: 'Hyderabad, India',
    workMode: 'ONSITE',
    type: 'INTERNSHIP',
    experience: 'Fresher',
    minSalary: 120000,
    maxSalary: 240000,
    skills: ['React', 'Node.js', 'Express', 'MongoDB'],
    category: 'Software Development'
  },
  {
    title: 'Python Developer',
    description:
      'Build maintainable Python services, integrate APIs, write tests and help resolve application issues.',
    location: 'Noida, India',
    workMode: 'REMOTE',
    type: 'FULL_TIME',
    experience: '0–2 years',
    minSalary: 400000,
    maxSalary: 700000,
    skills: ['Python', 'REST API', 'Git', 'SQL'],
    category: 'Software Development'
  },
  {
    title: 'Power BI Developer Intern',
    description:
      'Prepare datasets, create interactive Power BI dashboards and assist with DAX measures and reporting.',
    location: 'Bengaluru, India',
    workMode: 'HYBRID',
    type: 'INTERNSHIP',
    experience: 'Fresher',
    minSalary: 120000,
    maxSalary: 240000,
    skills: ['Power BI', 'DAX', 'Excel', 'SQL'],
    category: 'Business Intelligence'
  },
  {
    title: 'QA Tester',
    description:
      'Execute test cases, document defects, verify fixes and collaborate with developers to improve product quality.',
    location: 'Delhi, India',
    workMode: 'ONSITE',
    type: 'FULL_TIME',
    experience: '0–1 years',
    minSalary: 250000,
    maxSalary: 450000,
    skills: ['Manual Testing', 'Test Cases', 'SQL', 'Jira'],
    category: 'Quality Assurance'
  },
  {
    title: 'Backend Developer Intern',
    description:
      'Help build API endpoints, connect databases, validate requests and write clear technical documentation.',
    location: 'Hyderabad, India',
    workMode: 'REMOTE',
    type: 'INTERNSHIP',
    experience: 'Fresher',
    minSalary: 150000,
    maxSalary: 260000,
    skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
    category: 'Software Development'
  }
];

function generatePassword() {
  return `Hf!${randomBytes(15).toString('hex')}a9`;
}

async function getOrCreateUser(data, role, credentials) {
  const email = data.email.toLowerCase();
  let user = await User.findOne({ email });

  if (user) {
    if (user.role !== role) {
      throw new Error(
        `Role mismatch for ${email}. Existing account was not changed.`
      );
    }

    if (RESET_LISTED_ACCOUNT_PASSWORDS) {
      const password = generatePassword();
      user.passwordHash = await bcrypt.hash(password, 12);
      user.status = 'ACTIVE';
      await user.save();

      credentials.push({ name: data.name, email, role, password });
      console.log(`Password reset for listed account: ${email}`);
    } else {
      console.log(`Existing account kept: ${email}`);
    }

    return user;
  }

  const password = generatePassword();

  user = await User.create({
    name: data.name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    status: 'ACTIVE'
  });

  credentials.push({ name: data.name, email, role, password });
  console.log(`Created ${role}: ${email}`);

  return user;
}

async function getUniqueSlug(baseSlug, ownerId) {
  const existingBase = await Company.findOne({ slug: baseSlug });

  if (!existingBase || existingBase.owner.toString() === ownerId.toString()) {
    return baseSlug;
  }

  const suffix = ownerId.toString().slice(-6);
  let candidate = `${baseSlug}-${suffix}`;
  let counter = 2;

  while (await Company.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${suffix}-${counter}`;
    counter++;
  }

  return candidate;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Check backend/.env.');
  }

  const credentials = [];

  try {
    await connectDB();

    // Create/recover the eight listed accounts first.
    // Print credentials before processing companies and jobs,
    // so a later failure cannot hide them from the terminal output.
    for (const admin of admins) {
      await getOrCreateUser(admin, 'ADMIN', credentials);
    }

    const recruiterUsers = [];

    for (const recruiter of recruiters) {
      recruiterUsers.push(
        await getOrCreateUser(recruiter, 'RECRUITER', credentials)
      );
    }

    for (const seeker of seekers) {
      await getOrCreateUser(seeker, 'JOB_SEEKER', credentials);
    }

    if (credentials.length > 0) {
      console.log('\nSAVE THESE LOGIN CREDENTIALS SECURELY NOW:');
      console.table(credentials);
    }

    // One company per recruiter. Existing company ownership is preserved.
    const companies = [];

    for (let i = 0; i < companyData.length; i++) {
      const data = companyData[i];
      const owner = recruiterUsers[i];

      let company = await Company.findOne({ owner: owner._id });

      if (!company) {
        const slug = await getUniqueSlug(data.slug, owner._id);

        company = await Company.create({
          ...data,
          slug,
          owner: owner._id,
          website: 'https://example.com',
          description:
            `${data.name} is a sample company profile showcasing career opportunities on HireFlow.`,
          verified: true
        });

        console.log(`Created company: ${company.name} (${company.slug})`);
      } else {
        console.log(`Existing company kept: ${company.name}`);
      }

      companies.push(company);
    }

    let jobsCreated = 0;

    for (let i = 0; i < jobData.length; i++) {
      const data = jobData[i];
      const companyIndex = i % companies.length;
      const recruiter = recruiterUsers[companyIndex];
      const company = companies[companyIndex];

      const existingJob = await Job.findOne({
        title: data.title,
        recruiter: recruiter._id
      });

      if (existingJob) {
        console.log(`Existing job kept: ${data.title}`);
        continue;
      }

      await Job.create({
        ...data,
        recruiter: recruiter._id,
        company: company._id,
        published: true,
        featured: i < 2
      });

      jobsCreated++;
      console.log(`Created vacancy: ${data.title}`);
    }

    console.log('\nSetup completed.');
    console.log('Accounts: 2 admins, 4 recruiters, 2 job seekers.');
    console.log(`New vacancies created: ${jobsCreated}`);
    console.log('Existing users, companies and jobs were not deleted.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Setup failed:', error.message);
  process.exitCode = 1;
});
