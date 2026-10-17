import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import Toast from '../../components/common/Toast';
import { Save, CheckCircle2 } from 'lucide-react';
import CompanyLogoUploader from '../../components/recruiter/CompanyLogoUploader';
import Avatar from '../../components/ui/Avatar';
const empty = { name: '', website: '', description: '', location: '', logo: '' };
export default function CompanyPage() {
    const [f, setF] = useState(empty), [toast, setToast] = useState(''), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
    useEffect(() => {
        api.get('/companies/mine/profile')
            .then((response) => {
                if (response.data.data.company) {
                    setF(response.data.data.company);
                }
            })
            .catch((error) => {
                setToast(error.response?.data?.message || 'Could not load company');
            })
            .finally(() => setLoading(false));
    }, []);
    const save = async () => {
        if (f.name.trim().length < 2)
            return setToast('Company name must be at least 2 characters.');
        setSaving(true);
        try {
            const r = await api.put('/companies/mine', {
                name: f.name.trim(),
                website: f.website.trim(),
                description: f.description.trim(),
                location: f.location.trim(),
                logo: f.logo || ''
            });
            setF(r.data.data.company);
            setToast('Company profile saved.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not save company.');
        }
        finally {
            setSaving(false);
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">COMPANY WORKSPACE</div>
                <h1>Your company story</h1>
                <p>Give candidates a real sense of the team behind the job.</p>
            </div>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
                <Save size={16}/>
                {saving ? 'Saving…' : 'Save company'}
            </button>
        </div>
        {loading ? <div className="page-loader">
            <span>Loading company…</span>
        </div> : <>
            <section className="company-profile-hero panel">
                <CompanyLogoUploader company={f} onChange={c => setF(c)}/>
                <div>
                    <div className="eyebrow">PUBLIC COMPANY PROFILE</div>
                    <h2>
                        {f.name || 'Your company name'}
                    </h2>
                    <p>
                        {f.location || 'Add your location'}
                        {f.website && <> · <a href={f.website} target="_blank" rel="noreferrer">Website</a>
            </>}
                    </p>
                    {f.verified && <span className="status-pill success"><CheckCircle2 size={14}/> Verified company</span>}
                </div>
            </section>
            <section className="panel form-grid">
                <label>Company name *<input
                        required
                        minLength="2"
                        maxLength="120"
                        value={f.name}
                        onChange={e => setF({ ...f, name: e.target.value })}
                    /></label>
                <label>Location<input
                        maxLength="120"
                        value={f.location || ''}
                        onChange={e => setF({ ...f, location: e.target.value })}
                        placeholder="Bengaluru, India"
                    /></label>
                <label>Website<input
                        type="url"
                        value={f.website || ''}
                        onChange={e => setF({ ...f, website: e.target.value })}
                        placeholder="https://example.com"
                    /></label>
                <label className="logo-url-field">Logo URL <span className="field-hint">optional</span>
        <input
                        value={f.logo || ''}
                        onChange={e => setF({ ...f, logo: e.target.value })}
                        placeholder="https://..."
                    /></label>
                <label className="span-2">Description<textarea
                        rows="8"
                        maxLength="3000"
                        value={f.description || ''}
                        onChange={e => setF({ ...f, description: e.target.value })}
                        placeholder="What does your company build? What kind of people thrive here?"
                    /></label>
            </section>
        </>}
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
