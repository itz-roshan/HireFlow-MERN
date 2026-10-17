import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, MessageCircle, Share2, Flag, Users } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import Modal from '../../components/ui/Modal';
import JobApplicationModal from '../../components/jobs/JobApplicationModal';
import Avatar from '../../components/ui/Avatar';
export default function JobDetailsPage() {
    const { id } = useParams(), { user } = useAuth(), nav = useNavigate();
    const [job, setJob] = useState(null);
    const [saved, setSaved] = useState(false);
    const [application, setApplication] = useState(null);
    const [checkingApplication, setCheckingApplication] = useState(false);
    const [applyOpen, setApplyOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [toast, setToast] = useState('');
    useEffect(() => {
        api.get(`/jobs/${id}`).then(r => setJob(r.data.data.job)).catch(() => setToast('Job not found'));
    }, [id]);
    useEffect(() => {
        if (user?.role !== 'JOB_SEEKER')
            return;
        api.get(`/saved-jobs/check/${id}`).then(r => setSaved(r.data.data.saved)).catch(() => { });
    }, [user, id]);
    useEffect(() => {
        let cancelled = false;
        if (user?.role !== 'JOB_SEEKER') {
            setApplication(null);
            setCheckingApplication(false);
            return () => {
                cancelled = true;
            };
        }
        setApplication(null);
        setCheckingApplication(true);
        api.get(`/applications/check/${id}`).then(r => {
            if (!cancelled)
                setApplication(r.data.data.application || null);
        }).catch(() => {
            if (!cancelled)
                setApplication(null);
        }).finally(() => {
            if (!cancelled)
                setCheckingApplication(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id, user?._id, user?.role]);
    if (!job)
        return (<div className="center-page">
            <span>Loading opportunity…</span>
        </div>);
    const apply = () => {
        if (!user)
            return nav('/login', { state: { from: window.location.pathname } });
        if (user.role !== 'JOB_SEEKER')
            return setToast('Only job seekers can apply.');
        if (application)
            return nav('/applications');
        setApplyOpen(true);
    };
    const save = async () => {
        if (!user)
            return nav('/login', { state: { from: window.location.pathname } });
        if (user.role !== 'JOB_SEEKER')
            return setToast('Only job seekers can save jobs.');
        try {
            if (saved) {
                await api.delete(`/saved-jobs/${job._id}`);
                setSaved(false);
                setToast('Removed from saved jobs.');
            }
            else {
                await api.post(`/saved-jobs/${job._id}`);
                setSaved(true);
                setToast('Saved to your jobs.');
            }
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not update saved jobs.');
        }
    };
    const message = async () => {
        if (!user)
            return nav('/login');
        if (user.role !== 'JOB_SEEKER')
            return setToast('Messaging from this page is available to job seekers.');
        try {
            const r = await api.post('/messages/conversations', { userId: job.recruiter?._id });
            nav(`/messages?conversation=${r.data.data.conversation._id}`);
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not start conversation.');
        }
    };
    const report = async () => {
        if (!user)
            return nav('/login');
        if (reportReason.trim().length < 5)
            return setToast('Please add at least 5 characters so the team has useful context.');
        try {
            await api.post('/reports', { targetType: 'JOB', targetId: job._id, reason: reportReason.trim() });
            setReportReason('');
            setReportOpen(false);
            setToast('Thanks. Your report is now with the team.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not submit report.');
        }
    };
    const share = async () => {
        try {
            await navigator.clipboard?.writeText(window.location.href);
            setToast('Job link copied.');
        }
        catch {
            setToast('Copy the page URL to share this role.');
        }
    };
    return (<main className="container page">
        <Link className="back-link" to="/jobs"><ArrowLeft size={16}/> Back to jobs</Link>
        <div className="detail-grid">
            <article className="detail-main">
                <div className="company-hero">
                    <Avatar src={job.company?.logo} name={job.company?.name || 'Company'} size="lg"/>
                    <div>
                        <span className="badge">
                            {job.featured ? 'Featured role' : 'Open role'}
                        </span>
                        <h1>
                            {job.title}
                        </h1>
                        <p>
                            {job.company?.name}
                        </p>
                    </div>
                </div>
                <div className="detail-meta">
                    <span>📍 {job.location}</span>
                    <span>
                        <BriefcaseBusiness size={15}/>
                        {String(job.type).replace('_', ' ')}
                    </span>
                    <span>
                        <CalendarDays size={15}/>
                        {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span><Users size={15}/>{job.views || 0} views</span>
                </div>
                {[
            ['About the role', job.description],
            ['Responsibilities', job.responsibilities],
            ['Requirements', job.requirements]
        ].map(([h, t]) => (<section key={h}>
                    <h2>
                        {h}
                    </h2>
                    <p className="rich-text">
                        {t || 'The hiring team has not added this section yet.'}
                    </p>
                </section>))}
                <section>
                    <h2>Skills</h2>
                    <div className="chips large-chips">
                        {job.skills.map(s => (<span className="chip" key={s}>
                            {s}
                        </span>))}
                    </div>
                </section>
                <div className="report-line">
                    <button className="btn btn-ghost btn-sm" onClick={() => user ? setReportOpen(true) : nav('/login')}><Flag size={14}/> Report listing</button>
                </div>
            </article>
            <aside className="detail-side">
                <div className="apply-box">
                    <div className="eyebrow">APPLICATION</div>
                    <h3>
                        {job.minSalary ? `₹${(job.minSalary / 100000).toFixed(1)}L` : 'Salary'}
                        {job.maxSalary ? ` – ₹${(job.maxSalary / 100000).toFixed(1)}L` : ''}
                    </h3>
                    <p>
                        {job.experience || 'Experience flexible'}
                    </p>
                    <button
                        className="btn btn-primary btn-wide"
                        onClick={apply}
                        disabled={checkingApplication || Boolean(application)}
                    >
                        {checkingApplication ? 'Checking application…' : application ? 'Already applied' : 'Apply now'}
                    </button>
                    {application && <Link className="btn btn-outline btn-wide" to="/applications">Track application status</Link>}
                    <button
                        className={`btn ${saved ? 'btn-primary' : 'btn-outline'} btn-wide`}
                        onClick={save}
                    >
                        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'}/>
                        {saved ? 'Saved' : 'Save job'}
                    </button>
                    <button className="btn btn-outline btn-wide" onClick={message}><MessageCircle size={16}/> Message recruiter</button>
                    <button className="btn btn-ghost btn-wide" onClick={share}><Share2 size={16}/> Share</button>
                </div>
                <div className="side-note">
                    <CheckCircle2 />
                    <div>
                        <b>Clear hiring journey</b>
                        <p>Apply once, then follow status updates and interviews from your dashboard.</p>
                    </div>
                </div>
            </aside>
        </div>
        {reportOpen && <Modal
            open
            onClose={() => setReportOpen(false)}
            title="Report this listing"
            subtitle="Tell the trust team what needs review."
        >
            <form className="form-stack" onSubmit={e => {
                    e.preventDefault();
                    report();
                }}>
                <label>Reason *<textarea
                        rows={6}
                        maxLength={1000}
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        placeholder="What looks incorrect or unsafe?"
                        autoFocus
                    /></label>
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setReportOpen(false)}>Cancel</button>
                    <button className="btn btn-primary">Submit report</button>
                </div>
            </form>
        </Modal>}
        {applyOpen && <JobApplicationModal job={job} user={user} onClose={() => setApplyOpen(false)} onSubmitted={() => {
                setApplication({ status: 'APPLIED' });
                setToast('Application submitted. You can track its status from Applications.');
            }}/>}
        <Toast message={toast} onClose={() => setToast('')}/>
    </main>);
}
