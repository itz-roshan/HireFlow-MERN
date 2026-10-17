import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api/client';
import { CheckCircle2 } from 'lucide-react';
export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const [f, setF] = useState({ newPassword: '', confirm: '' });
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (f.newPassword.length < 8 || !/[A-Z]/.test(f.newPassword) || !/[0-9]/.test(f.newPassword))
            return setError('Use at least 8 characters, one uppercase letter and one number.');
        if (f.newPassword !== f.confirm)
            return setError('Passwords do not match.');
        setBusy(true);
        try {
            const r = await api.post('/auth/reset-password', { token, newPassword: f.newPassword });
            setMessage(r.data.message || 'Password reset successfully.');
        }
        catch (x) {
            setError(x.response?.data?.message || 'Could not reset password.');
        }
        finally {
            setBusy(false);
        }
    };
    return (<main className="auth-page">
        <div className="auth-card">
            <div className="auth-brand">
                <span className="brand-mark">H</span>
                <span>Hire<span>Flow</span>
    </span>
            </div>
            <h1>Choose a new password</h1>
            <p>Use a password you do not reuse elsewhere.</p>
            {!token ? <div className="alert error">Reset token is missing. Start again from Forgot password.</div> : <form className="form-stack" onSubmit={submit}>
                <label>New password<input
                        required
                        type="password"
                        minLength="8"
                        value={f.newPassword}
                        onChange={e => setF({ ...f, newPassword: e.target.value })}
                    /></label>
                <label>Confirm password<input
                        required
                        type="password"
                        minLength="8"
                        value={f.confirm}
                        onChange={e => setF({ ...f, confirm: e.target.value })}
                    /></label>
                {message && <div className="alert success"><CheckCircle2 size={16}/> {message}</div>}
                {error && <div className="alert error">
                    {error}
                </div>}
                <button className="btn btn-primary btn-wide" disabled={busy}>
                    {busy ? 'Updating…' : 'Reset password'}
                </button>
            </form>}
            <p className="auth-foot">
                <Link to="/login">Go to sign in</Link>
            </p>
        </div>
    </main>);
}
