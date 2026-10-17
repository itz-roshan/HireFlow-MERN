import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import Toast from '../../components/common/Toast';
import { Save, ShieldCheck, LockKeyhole } from 'lucide-react';
import SkillManager from '../../components/profile/SkillManager';
import ProfileAvatarUploader from '../../components/profile/ProfileAvatarUploader';
import ResumeUploader from '../../components/profile/ResumeUploader';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
const emptySocial = { linkedin: '', github: '', portfolio: '' };
export default function ProfilePage() {
    const { user, refreshMe } = useAuth();
    const [f, setF] = useState({
        name: '',
        phone: '',
        location: '',
        headline: '',
        bio: '',
        skills: [],
        education: [],
        experience: [],
        social: emptySocial
    });
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [resumeBusy, setResumeBusy] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('/profile').then(r => {
            const u = r.data.data.user;
            setF({
                name: u.name || '',
                phone: u.phone || '',
                location: u.location || '',
                headline: u.headline || '',
                bio: u.bio || '',
                skills: u.skills || [],
                education: u.education || [],
                experience: u.experience || [],
                social: u.social || emptySocial
            });
        }).catch(e => setToast(e.response?.data?.message || 'Could not load profile')).finally(() => setLoading(false));
    }, []);
    const save = async () => {
        setSaving(true);
        try {
            const r = await api.patch('/profile', f);
            setToast('Profile saved.');
            if (r.data.data.user)
                await refreshMe();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not save profile');
        }
        finally {
            setSaving(false);
        }
    };
    const uploadAvatar = async (file) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
            return setToast('Use JPG, PNG or WEBP.');
        if (file.size > 3 * 1024 * 1024)
            return setToast('Profile photo must be 3 MB or smaller.');
        setAvatarBusy(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            await api.post('/profile/avatar', fd);
            await refreshMe();
            setToast('Profile photo updated.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Photo upload failed');
        }
        finally {
            setAvatarBusy(false);
        }
    };
    const removeAvatar = async () => {
        setAvatarBusy(true);
        try {
            await api.delete('/profile/avatar');
            await refreshMe();
            setToast('Profile photo removed.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not remove photo');
        }
        finally {
            setAvatarBusy(false);
        }
    };
    const removeResume = async () => {
        setResumeBusy(true);
        try {
            await api.delete('/profile/resume');
            await refreshMe();
            setToast('Resume removed.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not remove resume');
        }
        finally {
            setResumeBusy(false);
        }
    };
    const uploadResume = async (file) => {
        if (file.type !== 'application/pdf')
            return setToast('Only PDF resumes are allowed.');
        if (file.size > 5 * 1024 * 1024)
            return setToast('Resume must be 5 MB or smaller.');
        setResumeBusy(true);
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const r = await api.post('/profile/resume', fd);
            setToast('Resume updated.');
            if (r.data.data.user)
                await refreshMe();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Resume upload failed');
        }
        finally {
            setResumeBusy(false);
        }
    };
    const changePassword = async (e) => {
        e.preventDefault();
        if (password.newPassword !== password.confirm)
            return setToast('Passwords do not match.');
        try {
            await api.patch('/auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
            setToast('Password changed. Please sign in again.');
            setPassword({ currentPassword: '', newPassword: '', confirm: '' });
            setPasswordOpen(false);
            setTimeout(() => window.location.href = '/login', 900);
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not change password');
        }
    };
    const completion = useMemo(() => {
        const vals = [
            f.name,
            f.phone,
            f.location,
            f.headline,
            f.bio,
            f.skills.length,
            f.education.length,
            f.experience.length,
            user?.resumeUrl,
            f.social.linkedin,
            f.social.github
        ].map(Boolean);
        return Math.round(vals.filter(Boolean).length / vals.length * 100);
    }, [f, user]);
    if (loading)
        return (<DashboardLayout>
            <div className="page-loader">
                <span>Loading profile…</span>
            </div>
        </DashboardLayout>);
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">YOUR PROFILE</div>
                <h1>Tell your story</h1>
                <p>A thoughtful profile gives recruiters context beyond a keyword list.</p>
            </div>
            <div className="profile-actions">
                <button className="btn btn-outline" onClick={() => setPasswordOpen(true)}><LockKeyhole size={16}/> Change password</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    <Save size={17}/>
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </div>
        <div className="profile-overview panel">
            <ProfileAvatarUploader
                user={user}
                onUpload={uploadAvatar}
                onRemove={removeAvatar}
                busy={avatarBusy}
            />
            <div className="profile-overview-copy">
                <div className="eyebrow"><ShieldCheck size={14}/> PROFILE STRENGTH</div>
                <h2>
                    {f.name || user.name}
                </h2>
                <p>
                    {f.headline || 'Add a headline that tells recruiters what you do.'}
                </p>
                <div className="profile-progress">
                    <div>
                        <span>Profile completion</span>
                        <b>{completion}%</b>
                    </div>
                    <div className="progress">
                        <i style={{ width: `${completion}%` }}/>
                    </div>
                </div>
            </div>
        </div>
        <div className="profile-grid">
            <section className="panel">
                <h2>About you</h2>
                <div className="form-grid">
                    <label>Full name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} maxLength={80}/></label>
                    <label>Phone<input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} maxLength={25}/></label>
                    <label>Location<input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} maxLength={100}/></label>
                    <label>Headline<input
                            value={f.headline}
                            onChange={e => setF({ ...f, headline: e.target.value })}
                            maxLength={120}
                            placeholder="MCA | Data Analyst | React learner"
                        /></label>
                    <label className="span-2">Bio<textarea
                            rows="6"
                            value={f.bio}
                            onChange={e => setF({ ...f, bio: e.target.value })}
                            maxLength={2000}
                            placeholder="What do you enjoy building? What are you looking for next?"
                        /></label>
                </div>
                <h2 className="section-title">Skills</h2>
                <SkillManager skills={f.skills} onChange={v => setF({ ...f, skills: v })}/>
                <h2 className="section-title">Education</h2>
                <ArrayEditor
                    label="Add education"
                    items={f.education}
                    onChange={v => setF({ ...f, education: v })}
                    placeholder="MCA — Invertis University"
                />
                <h2 className="section-title">Experience</h2>
                <ArrayEditor
                    label="Add experience"
                    items={f.experience}
                    onChange={v => setF({ ...f, experience: v })}
                    placeholder="Data Analyst Intern — Company"
                />
                <h2 className="section-title">Social links</h2>
                <div className="form-grid">
                    <label>LinkedIn<input
                            value={f.social.linkedin || ''}
                            onChange={e => setF({ ...f, social: { ...f.social, linkedin: e.target.value } })}
                            placeholder="https://linkedin.com/in/..."
                        /></label>
                    <label>GitHub<input
                            value={f.social.github || ''}
                            onChange={e => setF({ ...f, social: { ...f.social, github: e.target.value } })}
                            placeholder="https://github.com/..."
                        /></label>
                    <label className="span-2">Portfolio<input
                            value={f.social.portfolio || ''}
                            onChange={e => setF({ ...f, social: { ...f.social, portfolio: e.target.value } })}
                            placeholder="https://..."
                        /></label>
                </div>
            </section>
            <aside className="profile-side">
                <section className="panel">
                    <ResumeUploader
                        userId={user?._id}
                        resumeUrl={user?.resumeUrl}
                        onUpload={uploadResume}
                        onRemove={removeResume}
                        busy={resumeBusy}
                    />
                </section>
                <section className="panel tip-card">
                    <b>Profile tip</b>
                    <p>Specific headlines, recent skills and a current resume help a recruiter understand your fit faster.</p>
                </section>
            </aside>
        </div>
        <Modal
            open={passwordOpen}
            onClose={() => setPasswordOpen(false)}
            title="Change your password"
            subtitle="Use a strong password you do not reuse elsewhere."
        >
            <form className="form-stack" onSubmit={changePassword}>
                <label>Current password<input
                        required
                        type="password"
                        value={password.currentPassword}
                        onChange={e => setPassword({ ...password, currentPassword: e.target.value })}
                    /></label>
                <label>New password<input
                        required
                        minLength={8}
                        type="password"
                        value={password.newPassword}
                        onChange={e => setPassword({ ...password, newPassword: e.target.value })}
                    /></label>
                <label>Confirm new password<input
                        required
                        minLength={8}
                        type="password"
                        value={password.confirm}
                        onChange={e => setPassword({ ...password, confirm: e.target.value })}
                    /></label>
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setPasswordOpen(false)}>Cancel</button>
                    <button className="btn btn-primary">Update password</button>
                </div>
            </form>
        </Modal>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
function ArrayEditor({ label, items, onChange, placeholder }) {
    const [value, setValue] = useState('');
    const add = () => {
        const v = value.trim();
        if (!v || items.some(x => x.toLowerCase() === v.toLowerCase()))
            return;
        onChange([...items, v]);
        setValue('');
    };
    return (<div>
        <div className="inline-add">
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                placeholder={placeholder}
            />
            <button type="button" className="btn btn-outline" onClick={add}><Save size={15}/> {label}</button>
        </div>
        <div className="stack-list">
            {items.map((x, i) => (<div key={`${x}-${i}`}>
                <span>
                    {x}
                </span>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}>×</button>
            </div>))}
        </div>
    </div>);
}
