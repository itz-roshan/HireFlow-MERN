import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import Toast from '../../components/common/Toast';
import { Save, ArrowLeft } from 'lucide-react';
const init = {
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    location: '',
    workMode: 'HYBRID',
    type: 'FULL_TIME',
    experience: '',
    minSalary: '',
    maxSalary: '',
    skills: '',
    category: 'Engineering',
    benefits: '',
    deadline: '',
    published: true
};
const toLocalInput = (value) => {
    if (!value)
        return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime()))
        return '';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};
export default function JobEditorPage() {
    const { id } = useParams(), edit = Boolean(id), nav = useNavigate();
    const [f, setF] = useState(init);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(edit);
    const [taxonomy, setTaxonomy] = useState({ categories: [], skills: [] });
    useEffect(() => {
        api.get('/public/taxonomy').then(r => setTaxonomy(r.data.data)).catch(() => { });
    }, []);
    useEffect(() => {
        if (!edit)
            return;
        api.get(`/jobs/${id}`).then(r => {
            const j = r.data.data.job;
            setF({
                ...j,
                skills: (j.skills || []).join(', '),
                benefits: (j.benefits || []).join(', '),
                minSalary: j.minSalary ?? '',
                maxSalary: j.maxSalary ?? '',
                deadline: toLocalInput(j.deadline)
            });
        }).catch(e => setToast(e.response?.data?.message || 'Could not load job')).finally(() => setLoading(false));
    }, [id, edit]);
    const set = (k, v) => setF(x => ({ ...x, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        const skills = f.skills.split(',').map(x => x.trim()).filter(Boolean), benefits = f.benefits.split(',').map(x => x.trim()).filter(Boolean);
        if (f.title.trim().length < 3)
            return setToast('Job title must be at least 3 characters.');
        if (f.description.trim().length < 40)
            return setToast('Description must be at least 40 characters.');
        if (!skills.length)
            return setToast('Add at least one skill.');
        if (f.minSalary && f.maxSalary && Number(f.maxSalary) < Number(f.minSalary))
            return setToast('Maximum salary cannot be lower than minimum salary.');
        if (f.deadline && new Date(f.deadline) <= new Date())
            return setToast('Deadline must be in the future.');
        setSaving(true);
        const p = {
            title: f.title.trim(),
            description: f.description.trim(),
            responsibilities: f.responsibilities.trim() || undefined,
            requirements: f.requirements.trim() || undefined,
            location: f.location.trim(),
            workMode: f.workMode,
            type: f.type,
            experience: f.experience.trim() || undefined,
            minSalary: f.minSalary ? Number(f.minSalary) : undefined,
            maxSalary: f.maxSalary ? Number(f.maxSalary) : undefined,
            skills,
            category: f.category,
            benefits,
            deadline: f.deadline ? new Date(f.deadline).toISOString() : undefined,
            published: f.published !== false
        };
        try {
            edit ? await api.put(`/jobs/${id}`, p) : await api.post('/jobs', p);
            nav('/my-jobs');
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not save job.');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return (<DashboardLayout>
            <div className="page-loader">Loading job…</div>
        </DashboardLayout>);
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <button className="back-link inline" onClick={() => nav('/my-jobs')}><ArrowLeft size={16}/> Back to roles</button>
                <div className="eyebrow">
                    {edit ? 'EDIT ROLE' : 'NEW ROLE'}
                </div>
                <h1>
                    {edit ? 'Refine the opportunity' : 'Create a clear job post'}
                </h1>
                <p>Write for people first. Be specific, honest and useful.</p>
            </div>
        </div>
        <form className="panel form-grid" onSubmit={submit} noValidate>
            <label>Job title *<input
                    required
                    minLength="3"
                    maxLength="100"
                    value={f.title}
                    onChange={e => set('title', e.target.value)}
                /></label>
            <label>Category *<select value={f.category} onChange={e => set('category', e.target.value)}>
                    {(taxonomy.categories?.length
                        ? taxonomy.categories.map((category) => category.name)
                        : ['Engineering', 'Analytics', 'Design', 'Marketing', 'Sales', 'Operations']
                    ).map((category) => (<option key={category}>
                        {category}
                    </option>))}
                </select>
    </label>
            <label>Location *<input
                    required
                    maxLength="120"
                    value={f.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="Delhi / Remote"
                /></label>
            <label>Work mode<select value={f.workMode} onChange={e => set('workMode', e.target.value)}>
                    <option>ONSITE</option>
                    <option>HYBRID</option>
                    <option>REMOTE</option>
                </select>
    </label>
            <label>Job type<select value={f.type} onChange={e => set('type', e.target.value)}>
                    <option>FULL_TIME</option>
                    <option>PART_TIME</option>
                    <option>CONTRACT</option>
                    <option>INTERNSHIP</option>
                </select>
    </label>
            <label>Experience<input
                    maxLength="80"
                    value={f.experience || ''}
                    onChange={e => set('experience', e.target.value)}
                    placeholder="Fresher / 1–3 years"
                /></label>
            <label>Min salary<input
                    type="number"
                    min="0"
                    value={f.minSalary || ''}
                    onChange={e => set('minSalary', e.target.value)}
                    placeholder="600000"
                /></label>
            <label>Max salary<input
                    type="number"
                    min="0"
                    value={f.maxSalary || ''}
                    onChange={e => set('maxSalary', e.target.value)}
                    placeholder="1000000"
                /></label>
            <label className="span-2">Description *<textarea
                    required
                    minLength="40"
                    maxLength="10000"
                    rows="7"
                    value={f.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="What will this person own? What problem will they solve?"
                /></label>
            <label className="span-2">Responsibilities<textarea
                    maxLength="5000"
                    rows="6"
                    value={f.responsibilities || ''}
                    onChange={e => set('responsibilities', e.target.value)}
                /></label>
            <label className="span-2">Requirements<textarea
                    maxLength="5000"
                    rows="6"
                    value={f.requirements || ''}
                    onChange={e => set('requirements', e.target.value)}
                /></label>
            <label>Skills *<input
                    required
                    value={f.skills}
                    onChange={e => set('skills', e.target.value)}
                    placeholder="React, JavaScript, REST API"
                />
                <span className="field-hint">
                    Separate skills with commas.
                    {taxonomy.skills?.length
                        ? `Examples: ${taxonomy.skills.slice(0, 5).map((skill) => skill.name).join(', ')}`
                        : ''}
                </span>
    </label>
            <label>Benefits<input
                    value={f.benefits}
                    onChange={e => set('benefits', e.target.value)}
                    placeholder="Learning budget, flexible hours"
                /></label>
            <label>Deadline<input
                    type="datetime-local"
                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    value={f.deadline || ''}
                    onChange={e => set('deadline', e.target.value)}
                /></label>
            <div className="form-actions span-2">
                <button type="button" className="btn btn-ghost" onClick={() => nav('/my-jobs')}>Cancel</button>
                <button className="btn btn-primary" disabled={saving}>
                    <Save size={16}/>
                    {saving ? 'Saving…' : edit ? 'Update job' : 'Publish job'}
                </button>
            </div>
        </form>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
