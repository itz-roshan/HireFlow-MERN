import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { Edit3, Eye, Plus, Trash2, EyeOff, Globe2 } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
export default function MyJobsPage() {
    const { data, reload } = useFetch(() => api.get('/jobs/mine'), []);
    const nav = useNavigate();
    const [toast, setToast] = useState('');
    const [confirmId, setConfirmId] = useState(null);
    const [busy, setBusy] = useState(false);
    const toggle = async (id) => {
        try {
            const r = await api.patch(`/jobs/${id}/publish`);
            setToast(r.data.message);
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not update visibility');
        }
    };
    const del = async () => {
        if (!confirmId)
            return;
        setBusy(true);
        try {
            await api.delete(`/jobs/${confirmId}`);
            setToast('Job deleted.');
            setConfirmId(null);
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not delete job');
        }
        finally {
            setBusy(false);
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">YOUR ROLES</div>
                <h1>Manage jobs</h1>
                <p>Keep job details useful, honest and current.</p>
            </div>
            <Link className="btn btn-primary" to="/my-jobs/new"><Plus size={16}/> Post a job</Link>
        </div>
        <section className="panel">
            {data?.jobs?.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.jobs.map(j => (<tr key={j._id}>
                            <td>
                                <b>
                                    {j.title}
                                </b>
                                <span>
                                    {j.category}
                                </span>
                            </td>
                            <td>
                                {j.location}
                                <span>
                                    {j.workMode}
                                </span>
                            </td>
                            <td>
                                <span className={`status-pill ${j.published ? 'success' : ''}`}>
                                    {j.published ? 'PUBLISHED' : 'HIDDEN'}
                                </span>
                            </td>
                            <td>
                                <div className="row-actions">
                                    <button className="icon-btn" title="View job" onClick={() => nav(`/jobs/${j._id}`)}>
                                        <Eye size={16}/>
                                    </button>
                                    <Link className="icon-btn" title="Edit job" to={`/my-jobs/${j._id}/edit`}>
                                        <Edit3 size={16}/>
                                    </Link>
                                    <button
                                        className="icon-btn"
                                        title={j.published ? 'Hide job' : 'Publish job'}
                                        onClick={() => toggle(j._id)}
                                    >
                                        {j.published ? <EyeOff size={16}/> : <Globe2 size={16}/>}
                                    </button>
                                    <button className="icon-btn danger" title="Delete job" onClick={() => setConfirmId(j._id)}>
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState
                title="No jobs posted"
                message="Create your first role to start your candidate pipeline."
            />}
        </section>
        <ConfirmDialog
            open={Boolean(confirmId)}
            onClose={() => setConfirmId(null)}
            onConfirm={del}
            busy={busy}
            title="Delete this job?"
            message="Published roles with applications cannot be deleted; HireFlow will ask you to hide them instead."
            confirmLabel="Delete job"
        />
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
