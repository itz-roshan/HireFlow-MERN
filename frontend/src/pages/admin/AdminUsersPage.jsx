import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import Avatar from '../../components/ui/Avatar';
import { ShieldOff, ShieldCheck } from 'lucide-react';
export default function AdminUsersPage() {
    const { data, reload } = useFetch(() => api.get('/admin/users'), []);
    const [toast, setToast] = useState('');
    const users = data?.users || [];
    const toggle = async (id) => {
        try {
            await api.patch(`/admin/users/${id}/toggle`);
            setToast('User access updated.');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update user');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · USERS</div>
                <h1>People & access</h1>
                <p>Keep the platform welcoming, active and accountable.</p>
            </div>
        </div>
        <section className="panel">
            <div className="panel-head">
                <div>
                    <h2>All users</h2>
                    <p>{users.length} records in the moderation view.</p>
                </div>
            </div>
            {users.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Person</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (<tr key={u._id}>
                            <td>
                                <div className="table-person">
                                    <Avatar src={u.avatar} name={u.name} size="sm"/>
                                    <div>
                                        <b>
                                            {u.name}
                                        </b>
                                        <span>
                                            {u.email}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className="badge">
                                    {u.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                                <span className={`status-pill ${u.status === 'BLOCKED' ? 'danger' : 'success'}`}>
                                    {u.status}
                                </span>
                            </td>
                            <td>
                                <button className="btn btn-ghost btn-sm" onClick={() => toggle(u._id)}>
                                    {u.status === 'BLOCKED' ? <><ShieldCheck size={15}/> Activate</> : <><ShieldOff size={15}/> Block</>}
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No users yet" message="New accounts will appear here."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
