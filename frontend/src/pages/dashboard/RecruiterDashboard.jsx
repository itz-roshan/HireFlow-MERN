import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BriefcaseBusiness, Plus, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/applications/StatusBadge';
export default function RecruiterDashboard() {
    const jobs = useFetch(() => api.get('/jobs/mine'), []), apps = useFetch(() => api.get('/applications/recruiter'), []), interviews = useFetch(() => api.get('/interviews'), []);
    const list = apps.data?.applications || [];
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">RECRUITER WORKSPACE</div>
                <h1>Build your candidate pipeline</h1>
                <p>Post clearly, review thoughtfully and keep candidates informed.</p>
            </div>
            <Link className="btn btn-primary" to="/my-jobs/new"><Plus size={17}/> Post a job</Link>
        </div>
        <div className="stats-grid">
            <StatCard icon={<BriefcaseBusiness />} label="Your jobs" value={jobs.data?.jobs?.length ?? '—'}/>
            <StatCard icon={<Users />} label="Applications" value={list.length}/>
            <StatCard
                icon={<BarChart3 />}
                label="Shortlisted"
                value={list.filter(x => x.status === 'SHORTLISTED').length}
            />
            <StatCard
                icon={<BriefcaseBusiness />}
                label="Upcoming interviews"
                value={interviews.data?.interviews?.filter(x => ['SCHEDULED', 'CONFIRMED'].includes(x.status)).length ?? '—'}
            />
        </div>
        <div className="dash-grid">
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Recent applicants</h2>
                        <p>Latest people entering your pipeline.</p>
                    </div>
                    <Link to="/applicants">Manage</Link>
                </div>
                {list.length ? <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.slice(0, 8).map(x => (<tr key={x._id}>
                                <td>
                                    <b>
                                        {x.applicant.name}
                                    </b>
                                    <span>
                                        {x.applicant.email}
                                    </span>
                                </td>
                                <td>
                                    {x.job.title}
                                </td>
                                <td>
                                    <StatusBadge status={x.status}/>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div> : <div className="empty-state">
                    <Users size={40}/>
                    <h3>No applicants yet</h3>
                    <p>Publish your first role to start the conversation.</p>
                </div>}
            </section>
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Your roles</h2>
                        <p>Keep details fresh.</p>
                    </div>
                    <Link to="/my-jobs">View all</Link>
                </div>
                <div className="compact-job-list">
                    {jobs.data?.jobs?.slice(0, 5).map(j => (<Link key={j._id} to={`/jobs/${j._id}`}>
                        <b>
                            {j.title}
                        </b>
                        <span>{j.location} · {j.published ? 'Published' : 'Hidden'}</span>
                    </Link>))}
                </div>
            </section>
        </div>
    </DashboardLayout>);
}
