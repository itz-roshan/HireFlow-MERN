import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import Avatar from '../../components/ui/Avatar';
import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
export default function AdminCompaniesPage() {
    const { data, reload } = useFetch(() => api.get('/admin/companies'), []);
    const [toast, setToast] = useState('');
    const toggle = async (id) => {
        try {
            await api.patch(`/admin/companies/${id}/toggle`);
            setToast('Company verification updated.');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not update company.');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">COMPANIES</div>
                <h1>Company moderation</h1>
                <p>Review hiring organisations and keep the marketplace trustworthy.</p>
            </div>
        </div>
        <section className="panel">
            {data?.companies?.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Owner</th>
                            <th>Location</th>
                            <th>Verification</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.companies.map(c => (<tr key={c._id}>
                            <td>
                                <div className="table-person">
                                    <Avatar src={c.logo} name={c.name} size="sm"/>
                                    <div>
                                        <b>
                                            {c.name}
                                        </b>
                                        <span>
                                            {c.website || 'No website'}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {c.owner?.name}
                                <span>
                                    {c.owner?.email}
                                </span>
                            </td>
                            <td>
                                {c.location || '—'}
                            </td>
                            <td>
                                <span className={`status-pill ${c.verified ? 'success' : ''}`}>
                                    {c.verified ? 'VERIFIED' : 'UNVERIFIED'}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="icon-btn"
                                    onClick={() => toggle(c._id)}
                                    title={c.verified ? 'Remove verification' : 'Verify company'}
                                >
                                    {c.verified ? <ShieldOff size={16}/> : <ShieldCheck size={16}/>}
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No companies yet" message="Recruiter companies will appear here as they join."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
