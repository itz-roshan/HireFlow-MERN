import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { ExternalLink, XCircle } from 'lucide-react';
import StatusBadge from '../../components/applications/StatusBadge';
import { useState } from 'react';
import ApplicationDetailsModal from '../../components/applications/ApplicationDetailsModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
export default function ApplicationsPage() {
    const { data, reload } = useFetch(() => api.get('/applications/mine'), []);
    const [toast, setToast] = useState('');
    const [selected, setSelected] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [busy, setBusy] = useState(false);
    const withdraw = async () => {
        if (!confirmId)
            return;
        setBusy(true);
        try {
            await api.patch(`/applications/${confirmId}/withdraw`);
            setToast('Application withdrawn.');
            setConfirmId(null);
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to withdraw application');
        }
        finally {
            setBusy(false);
        }
    };
    const apps = data?.applications || [];
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">APPLICATIONS</div>
                <h1>Track your applications</h1>
                <p>See where each hiring conversation stands without losing the context.</p>
            </div>
        </div>
        <section className="panel">
            {apps.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Company</th>
                            <th>Applied</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(a => (<tr key={a._id}>
                            <td>
                                <button className="table-link" onClick={() => setSelected(a)}>
                                    {a.job.title}
                                </button>
                            </td>
                            <td>
                                {a.job.company?.name}
                            </td>
                            <td>
                                {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                                <StatusBadge status={a.status}/>
                            </td>
                            <td>
                                <div className="row-actions">
                                    <Link title="View role" to={`/jobs/${a.job._id}`}>
                                        <ExternalLink size={15}/>
                                    </Link>
                                    {!['HIRED', 'REJECTED', 'WITHDRAWN'].includes(a.status) && <button title="Withdraw" onClick={() => setConfirmId(a._id)}>
                                        <XCircle size={15}/>
                                    </button>}
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState
                title="No applications yet"
                message="Apply to a role and you will see the full journey here."
            />}
        </section>
        <ConfirmDialog
            open={Boolean(confirmId)}
            onClose={() => setConfirmId(null)}
            onConfirm={withdraw}
            busy={busy}
            title="Withdraw application?"
            message="This will move the application to Withdrawn. You can no longer continue this application from HireFlow."
            confirmLabel="Withdraw application"
        />
        <ApplicationDetailsModal application={selected} onClose={() => setSelected(null)}/>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
