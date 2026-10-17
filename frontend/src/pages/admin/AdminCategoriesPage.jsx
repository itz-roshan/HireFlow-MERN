import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
export default function AdminCategoriesPage() {
    const { data, reload } = useFetch(() => api.get('/admin/categories'), []);
    const [name, setName] = useState('');
    const [toast, setToast] = useState('');
    const create = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2)
            return setToast('Category name must be at least 2 characters.');
        try {
            await api.post('/admin/categories', { name: name.trim() });
            setName('');
            setToast('Category created.');
            reload();
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not create category.');
        }
    };
    const toggle = async (id) => {
        try {
            await api.patch(`/admin/categories/${id}/toggle`);
            reload();
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not update category.');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · TAXONOMY</div>
                <h1>Job categories</h1>
                <p>Keep the search taxonomy clean and useful.</p>
            </div>
        </div>
        <section className="panel">
            <form className="toolbar" onSubmit={create}>
                <div className="toolbar-search">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Engineering"
                        aria-label="Category name"
                    />
                </div>
                <button className="btn btn-primary">Add category</button>
            </form>
            {data?.categories?.length ? <div className="table-wrap">
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
                        {data.categories.map(c => (<tr key={c._id}>
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
            </div> : <EmptyState title="No categories yet" message="Add the first category above."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
