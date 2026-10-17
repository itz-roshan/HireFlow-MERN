import User from '../models/User.js';
import Application from '../models/Application.js';
import { ok, fail } from '../utils/api.js';
import { absoluteResumePath, resumeExists } from '../utils/fileAccess.js';
import { isValidObjectId } from 'mongoose';
export async function myResume(req, res) {
    const user = await User.findById(req.user._id).select('name resumeUrl');
    if (!user?.resumeUrl)
        return fail(res, 'No resume has been uploaded yet', 404);
    const file = absoluteResumePath(user.resumeUrl);
    if (!file || !resumeExists(user.resumeUrl))
        return fail(res, 'Resume file is not available', 404);
    return res.type('application/pdf').sendFile(file, { headers: { 'Content-Disposition': 'inline; filename="HireFlow-Resume.pdf"' } });
}
export async function applicationResume(req, res) {
    if (!isValidObjectId(req.params.id))
        return fail(res, 'Invalid application id', 400);
    const application = await Application.findById(req.params.id).select('applicant resumeUrl job').populate('job', 'recruiter');
    if (!application?.resumeUrl)
        return fail(res, 'Submitted resume is not available', 404);
    const isCandidate = String(application.applicant) === String(req.user._id);
    const isRecruiter = String(application.job?.recruiter) === String(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';
    if (!isCandidate && !isRecruiter && !isAdmin)
        return fail(res, 'You do not have access to this resume', 403);
    const file = absoluteResumePath(application.resumeUrl);
    if (!file || !resumeExists(application.resumeUrl))
        return fail(res, 'Submitted resume file is not available', 404);
    res.type('application/pdf');
    return res.download(file, `HireFlow-Resume-${application._id}.pdf`);
}
