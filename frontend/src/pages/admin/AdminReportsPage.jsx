import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
export default function AdminReportsPage() {
    const { data, reload } = useFetch(() => api.get('/admin/reports'), []);
    const [toast, setToast] = useState('');
    const reports = data?.reports || [];
    const update = async (id, status) => {
        try {
            await api.patch(`/reports/${id}`, { status });
            setToast('Report status updated.');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update report');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · REPORTS</div>
                <h1>Reports & trust</h1>
                <p>Handle community reports with a clear, auditable process.</p>
            </div>
        </div>
        <section className="panel">
            {reports.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Reporter</th>
                            <th>Target</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r) => (<tr key={r._id}>
                            <td>
                                <b>
                                    {r.reporter?.name || '—'}
                                </b>
                                <span>
                                    {r.reporter?.email || ''}
                                </span>
                            </td>
                            <td>
                                {r.targetType}
                                <span>
                                    {String(r.targetId)}
                                </span>
                            </td>
                            <td>
                                {r.reason}
                            </td>
                            <td>
                                <span className={`status-pill ${r.status === 'RESOLVED' ? 'success' : r.status === 'OPEN' ? 'danger' : ''}`}>
                                    {r.status}
                                </span>
                            </td>
                            <td>
                                <select value={r.status} onChange={(e) => update(r._id, e.target.value)}>
                                    <option>OPEN</option>
                                    <option>REVIEWED</option>
                                    <option>RESOLVED</option>
                                </select>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No reports" message="The trust center is clear for now."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
