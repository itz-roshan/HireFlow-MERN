import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
export default function AdminSkillsPage() {
    const { data, reload } = useFetch(() => api.get('/admin/skills'), []);
    const [name, setName] = useState('');
    const [toast, setToast] = useState('');
    const create = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2)
            return setToast('Skill name must be at least 2 characters.');
        try {
            await api.post('/admin/skills', { name: name.trim() });
            setName('');
            setToast('Skill created.');
            reload();
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not create skill.');
        }
    };
    const toggle = async (id) => {
        try {
            await api.patch(`/admin/skills/${id}/toggle`);
            reload();
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not update skill.');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · TAXONOMY</div>
                <h1>Skills</h1>
                <p>Keep searchable skills consistent across jobs and profiles.</p>
            </div>
        </div>
        <section className="panel">
            <form className="toolbar" onSubmit={create}>
                <div className="toolbar-search">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. React"
                        aria-label="Skill name"
                    />
                </div>
                <button className="btn btn-primary">Add skill</button>
            </form>
            {data?.skills?.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.skills.map(c => (<tr key={c._id}>
                            <td>
                                <b>
                                    {c.name}
                                </b>
                            </td>
                            <td>
                                {c.slug}
                            </td>
                            <td>
                                <span className={`status-pill ${c.active ? 'success' : ''}`}>
                                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </td>
                            <td>
                                <button className="btn btn-ghost btn-sm" onClick={() => toggle(c._id)}>
                                    {c.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No skills yet" message="Add the first skill above."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
