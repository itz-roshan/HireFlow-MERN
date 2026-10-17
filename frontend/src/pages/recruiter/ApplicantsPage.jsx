import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import { Eye, Filter, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/applications/StatusBadge';
import ApplicantDetailsModal from '../../components/recruiter/ApplicantDetailsModal';
import InterviewScheduler from '../../components/recruiter/InterviewScheduler';
import Toast from '../../components/common/Toast';
const transitions = {
    APPLIED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
    SHORTLISTED: ['INTERVIEW', 'REJECTED'],
    INTERVIEW: ['OFFERED', 'REJECTED'],
    OFFERED: ['HIRED', 'REJECTED'],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: []
};
const statuses = Object.keys(transitions);
export default function ApplicantsPage() {
    const nav = useNavigate();
    const { data, reload } = useFetch(() => api.get('/applications/recruiter'), []);
    const [selected, setSelected] = useState(null);
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [toast, setToast] = useState('');
    const status = async (id, v) => {
        try {
            await api.patch(`/applications/${id}/status`, { status: v });
            setToast('Application status updated and candidate notified.');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not update status');
        }
    };
    const list = (data?.applications || [])
        .filter((application) => {
            const searchText = `${application.applicant?.name} ${application.applicant?.email} ${application.job?.title}`;
            return searchText.toLowerCase().includes(q.toLowerCase());
        })
        .filter((application) => !statusFilter || application.status === statusFilter);
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">CANDIDATE PIPELINE</div>
                <h1>Applicants</h1>
                <p>Review people with context, keep decisions transparent, and move hiring forward.</p>
            </div>
        </div>
        <section className="panel">
            <div className="toolbar">
                <div className="toolbar-search">
                    <Search size={16}/>
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search candidate or role"/>
                </div>
                <div className="toolbar-filter">
                    <Filter size={15}/>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        {statuses.map(s => (<option key={s}>
                            {s}
                        </option>))}
                    </select>
                </div>
            </div>
            {list.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Next step</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(a => (<tr key={a._id}>
                            <td>
                                <div className="table-person">
                                    <Avatar src={a.applicant.avatar} name={a.applicant.name} size="sm"/>
                                    <div>
                                        <b>
                                            {a.applicant.name}
                                        </b>
                                        <span>
                                            {a.applicant.headline || a.applicant.email}
                                        </span>
                                        {a.applicant.location && <span>
                                            {a.applicant.location}
                                        </span>}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <b>
                                    {a.job.title}
                                </b>
                                <span>
                                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                                </span>
                            </td>
                            <td>
                                {(transitions[a.status] || []).length ? <select value="" onChange={e => status(a._id, e.target.value)} aria-label="Move application">
                                    <option value="">
                                        {a.status.replace('_', ' ')}
                                    </option>
                                    {transitions[a.status].map(s => (<option key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </option>))}
                                </select> : <StatusBadge status={a.status}/>}
                            </td>
                            <td>
                                <div className="row-actions">
                                    <button className="icon-btn" onClick={() => setSelected(a)} title="View candidate">
                                        <Eye size={16}/>
                                    </button>
                                    {['SHORTLISTED', 'INTERVIEW'].includes(a.status) && <InterviewScheduler application={a} onDone={reload}/>}
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState
                title="No matching applicants"
                message="Try another search, status filter, or publish a role to start your pipeline."
            />}
        </section>
        <ApplicantDetailsModal
            app={selected}
            onClose={() => setSelected(null)}
            onMessage={async (person) => {
                try {
                    const response = await api.post('/messages/conversations', { userId: person._id });
                    nav(`/messages?conversation=${response.data.data.conversation._id}`);
                }
            catch (e) {
                    setToast(e.response?.data?.message || 'Could not start conversation');
                }
            }}
        />
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
