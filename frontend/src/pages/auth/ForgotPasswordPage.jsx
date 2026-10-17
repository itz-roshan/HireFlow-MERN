import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api/client';
import { CheckCircle2, Mail } from 'lucide-react';
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        setMessage('');
        try {
            const r = await api.post('/auth/forgot-password', { email });
            setMessage(r.data.message || 'If the email is registered, reset instructions have been created.');
        }
        catch (x) {
            setError(x.response?.data?.message || 'Could not create reset request.');
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
            <h1>Reset your password</h1>
            <p>Enter your account email and we’ll start the reset process.</p>
            <form className="form-stack" onSubmit={submit}>
                <label>Email<input
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    /></label>
                {message && <div className="alert success"><CheckCircle2 size={16}/> {message}</div>}
                {error && <div className="alert error">
                    {error}
                </div>}
                <button className="btn btn-primary btn-wide" disabled={busy}>
                    <Mail size={16}/>
                    {busy ? 'Sending…' : 'Create reset request'}
                </button>
            </form>
            <p className="auth-foot">
                <Link to="/login">Back to sign in</Link>
            </p>
        </div>
    </main>);
}
