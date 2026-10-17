import { Link } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, CalendarDays, CheckCircle2, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/applications/StatusBadge';
export default function SeekerDashboard() {
    const { user } = useAuth();
    const applicationsQuery = useFetch(() => api.get('/applications/mine'), []);
    const savedJobsQuery = useFetch(() => api.get('/saved-jobs'), []);
    const interviewsQuery = useFetch(() => api.get('/interviews'), []);
    const apps = applicationsQuery.data?.applications || [];
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">WELCOME BACK, {user.name.split(' ')[0].toUpperCase()}</div>
                <h1>Your career workspace</h1>
                <p>Keep the search moving, one thoughtful application at a time.</p>
            </div>
            <Link className="btn btn-primary" to="/jobs">Explore jobs <ArrowRight size={16}/></Link>
        </div>
        <div className="stats-grid">
            <StatCard icon={<BriefcaseBusiness />} label="Applications" value={apps.length}/>
            <StatCard icon={<Bookmark />} label="Saved jobs" value={savedJobsQuery.data?.saved?.length ?? '—'}/>
            <StatCard
                icon={<CheckCircle2 />}
                label="Shortlisted"
                value={apps.filter(x => x.status === 'SHORTLISTED').length}
            />
            <StatCard
                icon={<CalendarDays />}
                label="Interviews"
                value={interviewsQuery.data?.interviews?.filter((interview) => ['SCHEDULED', 'CONFIRMED'].includes(interview.status)).length ?? '—'}
            />
        </div>
        <div className="dash-grid">
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Recent applications</h2>
                        <p>Your latest activity.</p>
                    </div>
                    <Link to="/applications">View all</Link>
                </div>
                {apps.length ? <div className="activity-list">
                    {apps.slice(0, 6).map(x => (<div className="activity-row" key={x._id}>
                        <div>
                            <b>
                                {x.job?.title}
                            </b>
                            <span>
                                {x.job?.company?.name}
                            </span>
                        </div>
                        <StatusBadge status={x.status}/>
                    </div>))}
                </div> : <EmptyState
                    title="No applications yet"
                    message="Explore jobs and apply when something feels right."
                />}
            </section>
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Saved for later</h2>
                        <p>Interesting roles you want to revisit.</p>
                    </div>
                    <Link to="/saved-jobs">View all</Link>
                </div>
                {savedJobsQuery.data?.saved?.length ? <div className="compact-job-list">
                    {savedJobsQuery.data.saved.slice(0, 5).map(x => (<Link key={x._id} to={`/jobs/${x.job._id}`}>
                        <b>
                            {x.job.title}
                        </b>
                        <span>{x.job.company?.name} · {x.job.location}</span>
                    </Link>))}
                </div> : <EmptyState title="Nothing saved yet"/>}
            </section>
        </div>
    </DashboardLayout>);
}
