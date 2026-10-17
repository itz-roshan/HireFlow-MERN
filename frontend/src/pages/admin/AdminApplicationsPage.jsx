import { useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/applications/StatusBadge';
import Toast from '../../components/common/Toast';
const statuses = [
    'APPLIED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
];
export default function AdminApplicationsPage() {
    const { data, reload } = useFetch(() => api.get('/admin/applications'), []);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [busyId, setBusyId] = useState('');
    const [toast, setToast] = useState('');
    const applications = data?.applications || [];
    const filtered = useMemo(() => applications
        .filter((item) => {
        const haystack = [
            item.applicant?.name,
            item.applicant?.email,
            item.job?.title,
            item.job?.company?.name,
            item.job?.recruiter?.name,
            item.job?.recruiter?.email,
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase().trim());
    })
        .filter((item) => !statusFilter || item.status === statusFilter), [applications, query, statusFilter]);
    const updateStatus = async (application, nextStatus) => {
        if (!nextStatus || nextStatus === application.status)
            return;
        setBusyId(application._id);
        try {
            const response = await api.patch(`/admin/applications/${application._id}/status`, {
                status: nextStatus,
            });
            setToast(response.data.message || 'Application status updated by admin.');
            reload();
        }
        catch (error) {
            setToast(error.response?.data?.message || 'Could not update application status.');
        }
        finally {
            setBusyId('');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · APPLICATIONS</div>
                <h1>Hiring decisions</h1>
                <p>Review every application and correct a status when an administrative override is needed.</p>
            </div>
        </div>
        <section className="panel">
            <div className="alert warning" role="note">
          <ShieldCheck size={16}/> Admin overrides are recorded in audit history and the candidate and recruiter are notified. This includes applications already marked Hired.
        </div>
            <div className="toolbar">
                <div className="toolbar-search">
                    <Search size={16}/>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search candidate, role, company or recruiter"
                    />
                </div>
                <div className="toolbar-filter">
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filter by application status"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (<option key={status} value={status}>
                            {status.replace('_', ' ')}
                        </option>))}
                    </select>
                </div>
            </div>
            {filtered.length ? (<div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job / Company</th>
                            <th>Recruiter</th>
                            <th>Current status</th>
                            <th>Admin override</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((application) => (<tr key={application._id}>
                            <td>
                                <b>
                                    {application.applicant?.name || 'Unknown candidate'}
                                </b>
                                <span>
                                    {application.applicant?.email || '—'}
                                </span>
                                <span>Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '—'}</span>
                            </td>
                            <td>
                                <b>
                                    {application.job?.title || 'Deleted job'}
                                </b>
                                <span>
                                    {application.job?.company?.name || '—'}
                                </span>
                            </td>
                            <td>
                                <b>
                                    {application.job?.recruiter?.name || '—'}
                                </b>
                                <span>
                                    {application.job?.recruiter?.email || ''}
                                </span>
                            </td>
                            <td>
                                <StatusBadge status={application.status}/>
                            </td>
                            <td>
                                <select
                                    value={application.status}
                                    disabled={busyId === application._id}
                                    onChange={(event) => updateStatus(application, event.target.value)}
                                    aria-label={`Change status for ${application.applicant?.name || 'candidate'}`}
                                >
                                    {statuses.map((status) => (<option key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </option>))}
                                </select>
                                {busyId === application._id && <span>Saving…</span>}
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>) : (<EmptyState
                title="No applications found"
                message="Try another search or status filter. Applications will appear here once candidates apply."
            />)}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
