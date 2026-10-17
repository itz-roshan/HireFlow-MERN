import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatarUploader from '../../components/profile/ProfileAvatarUploader';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/common/Toast';
import { LockKeyhole, Save, ShieldCheck } from 'lucide-react';
export default function AccountPage() {
    const { user, refreshMe } = useAuth();
    const [form, setForm] = useState({ name: '', phone: '', location: '', headline: '', bio: '' });
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [toast, setToast] = useState('');
    useEffect(() => {
        api.get('/profile').then((response) => {
            const u = response.data.data.user;
            setForm({
                name: u.name || '',
                phone: u.phone || '',
                location: u.location || '',
                headline: u.headline || '',
                bio: u.bio || ''
            });
        }).catch((e) => setToast(e.response?.data?.message || 'Could not load account')).finally(() => setLoading(false));
    }, []);
    const save = async () => {
        const name = form.name.trim();
        if (name.length < 2) {
            setToast('Name must be at least 2 characters.');
            return;
        }
        setSaving(true);
        setToast('');
        try {
            const response = await api.patch('/profile', {
                name,
                phone: form.phone.trim(),
                location: form.location.trim(),
                headline: form.headline.trim(),
                bio: form.bio.trim(),
                skills: Array.isArray(user?.skills) ? user.skills : [],
                education: Array.isArray(user?.education) ? user.education : [],
                experience: Array.isArray(user?.experience) ? user.experience : [],
                social: user?.social || undefined
            });
            // Use the actual updated data returned by the backend.
            const updatedUser = response.data?.data?.user;
            if (updatedUser) {
                setForm({
                    name: updatedUser.name || '',
                    phone: updatedUser.phone || '',
                    location: updatedUser.location || '',
                    headline: updatedUser.headline || '',
                    bio: updatedUser.bio || ''
                });
            }
            // Show success immediately after the profile PATCH succeeds.
            setToast(response.data?.message || 'Profile changes saved successfully.');
            // Refresh auth state without making a successful save look like a failure.
            try {
                await refreshMe();
            }
            catch {
                // The profile was already saved successfully.
            }
        }
        catch (error) {
            const fieldErrors = error.response?.data?.fieldErrors;
            if (fieldErrors) {
                const firstError = Object.values(fieldErrors)[0];
                setToast(firstError || 'Please correct the highlighted fields.');
            }
            else {
                setToast(error.response?.data?.message ||
                    'Could not save your changes. Please try again.');
            }
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
            await api.post('/profile/avatar', (() => {
                const fd = new FormData();
                fd.append('avatar', file);
                return fd;
            })());
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
    const changePassword = async (event) => {
        event.preventDefault();
        if (password.newPassword.length < 8)
            return setToast('New password must be at least 8 characters.');
        if (password.newPassword !== password.confirm)
            return setToast('Passwords do not match.');
        try {
            await api.patch('/auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
            setPasswordOpen(false);
            setPassword({ currentPassword: '', newPassword: '', confirm: '' });
            setToast('Password changed. Please sign in again.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 900);
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Could not change password');
        }
    };
    if (loading)
        return (<DashboardLayout>
            <div className="page-loader">
                <span>Loading account…</span>
            </div>
        </DashboardLayout>);
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ACCOUNT</div>
                <h1>Your professional identity</h1>
                <p>Keep your personal details current so every conversation starts with the right context.</p>
            </div>
            <div className="profile-actions">
                <button className="btn btn-outline" onClick={() => setPasswordOpen(true)}><LockKeyhole size={16}/> Change password</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    <Save size={16}/>
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </div>
        <section className="profile-overview panel">
            <ProfileAvatarUploader user={user} onUpload={uploadAvatar} busy={avatarBusy}/>
            <div className="profile-overview-copy">
                <div className="eyebrow"><ShieldCheck size={14}/> {user.role.replace('_', ' ')}</div>
                <h2>
                    {form.name || user.name}
                </h2>
                <p>
                    {form.headline || 'Add a professional headline.'}
                </p>
                <div className="profile-progress">
                    <div>
                        <span>Profile basics</span>
                        <b>{[form.name, form.location, form.headline, form.bio, user.avatar].filter(Boolean).length * 20}%</b>
                    </div>
                    <div className="progress">
                        <i style={{ width: `${[form.name, form.location, form.headline, form.bio, user.avatar].filter(Boolean).length * 20}%` }}/>
                    </div>
                </div>
            </div>
        </section>
        <section className="panel form-grid">
            <label>Full name *<input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={80}
                /></label>
            <label>Phone<input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    maxLength={25}
                /></label>
            <label>Location<input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    maxLength={100}
                /></label>
            <label>Headline<input
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    maxLength={120}
                    placeholder="Talent Partner · Recruitment · People Ops"
                /></label>
            <label className="span-2">About<textarea
                    rows="7"
                    maxLength={2000}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="What do you work on? What kind of teams do you enjoy?"
                /></label>
        </section>
        <Modal
            open={passwordOpen}
            onClose={() => setPasswordOpen(false)}
            title="Change password"
            subtitle="Choose a strong password you do not reuse elsewhere."
        >
            <form className="form-stack" onSubmit={changePassword}>
                <label>Current password<input
                        required
                        type="password"
                        value={password.currentPassword}
                        onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                    /></label>
                <label>New password<input
                        required
                        minLength={8}
                        type="password"
                        value={password.newPassword}
                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                    /></label>
                <label>Confirm password<input
                        required
                        minLength={8}
                        type="password"
                        value={password.confirm}
                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
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
