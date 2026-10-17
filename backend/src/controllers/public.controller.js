import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Category from '../models/Category.js';
import Skill from '../models/Skill.js';
export async function stats(req, res) {
    const [openJobs, hiringTeams, professionals] = await Promise.all([
        Job.countDocuments({ published: true, $or: [{ deadline: null }, { deadline: { $gt: new Date() } }] }),
        Company.countDocuments(),
        User.countDocuments({ role: 'JOB_SEEKER', status: 'ACTIVE' })
    ]);
    res.json({
        success: true,
        data: { openJobs, hiringTeams, professionals }
    });
}
export async function taxonomy(req, res) {
    const [categories, skills] = await Promise.all([
        Category.find({ active: true }).sort({ name: 1 }).lean(),
        Skill.find({ active: true }).sort({ name: 1 }).lean()
    ]);
    return res.json({ success: true, data: { categories, skills } });
}
