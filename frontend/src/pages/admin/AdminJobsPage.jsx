import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export default function AdminJobsPage() {
    const { data, reload } = useFetch(() => api.get('/admin/jobs'), []);
    const jobs = data?.jobs || [];
    const [toast, setToast] = useState('');
    const toggle = async (id) => {
        try {
            const r = await api.patch(`/admin/jobs/${id}/toggle`);
            setToast(r.data.message || 'Job visibility updated');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update job');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · JOBS</div>
                <h1>Job quality center</h1>
                <p>Review what is public before candidates see it.</p>
            </div>
        </div>
        <section className="panel">
            {jobs.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Company</th>
                            <th>Recruiter</th>
                            <th>Published</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(j => (<tr key={j._id}>
                            <td>
                                <b>
                                    {j.title}
                                </b>
                                <span>{j.location} · {j.type.replace('_', ' ')}</span>
                            </td>
                            <td>
                                {j.company?.name || '—'}
                            </td>
                            <td>
                                <b>
                                    {j.recruiter?.name || '—'}
                                </b>
                                <span>
                                    {j.recruiter?.email || ''}
                                </span>
                            </td>
                            <td>
                                <span className={`status-pill ${j.published ? 'success' : 'danger'}`}>
                                    {j.published ? 'PUBLIC' : 'HIDDEN'}
                                </span>
                            </td>
                            <td>
                                <button className="btn btn-ghost btn-sm" onClick={() => toggle(j._id)}>
                                    {j.published ? <><EyeOff size={15}/> Hide</> : <><Eye size={15}/> Publish</>}
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No jobs yet" message="Published and unpublished roles will appear here."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
