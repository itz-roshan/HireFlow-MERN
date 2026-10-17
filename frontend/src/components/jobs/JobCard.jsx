import { Link } from 'react-router-dom';
import { Bookmark, MapPin, BriefcaseBusiness, Clock3 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Toast from '../common/Toast';
export default function JobCard({ job, saved = false, onSave }) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(saved), [toast, setToast] = useState('');
    useEffect(() => setIsSaved(saved), [saved]);
    const toggle = async () => {
        if (onSave)
            return onSave(job);
        if (!user || user.role !== 'JOB_SEEKER')
            return setToast('Login as a job seeker to save jobs.');
        try {
            if (isSaved) {
                await api.delete(`/saved-jobs/${job._id}`);
                setIsSaved(false);
                setToast('Removed from saved jobs.');
            }
            else {
                await api.post(`/saved-jobs/${job._id}`);
                setIsSaved(true);
                setToast('Saved to your jobs.');
            }
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not update saved jobs.');
        }
    };
    return (<>
        <article className="job-card">
            <div className="job-card-top">
                <Avatar src={job.company?.logo} name={job.company?.name || 'Company'} size="md"/>
                <button
                    className={`icon-btn ${isSaved ? 'saved' : ''}`}
                    onClick={toggle}
                    aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                >
                    <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'}/>
                </button>
            </div>
            <Link className="job-title" to={`/jobs/${job._id}`}>
                {job.title}
            </Link>
            <p className="company-name">
                {job.company?.name || 'Company'}
            </p>
            <div className="job-meta">
                <span>
                    <MapPin size={15}/>
                    {job.location}
                </span>
                <span>
                    <BriefcaseBusiness size={15}/>
                    {job.workMode}
                </span>
                <span>
                    <Clock3 size={15}/>
                    {String(job.type).replace('_', ' ')}
                </span>
            </div>
            <div className="chips">
                {(job.skills || []).slice(0, 4).map(s => (<span className="chip" key={s}>
                    {s}
                </span>))}
            </div>
            <div className="job-card-foot">
                <strong>
                    {job.minSalary ? `₹${(job.minSalary / 100000).toFixed(1)}L` : 'Salary'}
                    {job.maxSalary ? ` – ₹${(job.maxSalary / 100000).toFixed(1)}L` : ''}
                </strong>
                <span>
                    {job.experience || 'Flexible'}
                </span>
            </div>
        </article>
        <Toast message={toast} onClose={() => setToast('')}/>
    </>);
}
