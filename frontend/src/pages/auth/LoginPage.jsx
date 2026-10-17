import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, LockKeyhole, AlertCircle, Sparkles } from 'lucide-react';
export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const first = useRef(null);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [server, setServer] = useState('');
    const [busy, setBusy] = useState(false);
    const validate = () => {
        const next = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            next.email = 'Please enter a valid email address.';
        if (form.password.length < 8)
            next.password = 'Password must be at least 8 characters.';
        setErrors(next);
        return next;
    };
    const submit = async (e) => {
        e.preventDefault();
        setServer('');
        const next = validate();
        if (Object.keys(next).length) {
            requestAnimationFrame(() => first.current?.[Object.keys(next)[0]]?.focus?.());
            return;
        }
        setBusy(true);
        try {
            await login({ email: form.email.trim(), password: form.password });
            nav(loc.state?.from || '/dashboard', { replace: true });
        }
        catch (x) {
            const status = x.response?.status;
            if (!x.response) {
                setServer('Unable to connect to HireFlow server. Make sure the backend is running on port 5000.');
            }
            else if (status === 401) {
                setServer('Email or password is incorrect. Please check your details and try again.');
            }
            else {
                setServer(x.response?.data?.message || 'We could not sign you in. Please try again.');
                if (x.response?.data?.fieldErrors)
                    setErrors(x.response.data.fieldErrors);
            }
        }
        finally {
            setBusy(false);
        }
    };
    const change = (key, value) => {
        setForm(f => ({ ...f, [key]: value }));
        setErrors(e => ({ ...e, [key]: '' }));
        setServer('');
    };
    return (<main className="auth-page">
        <div className="auth-card">
            <div className="auth-brand">
                <span className="brand-mark">H</span>
                <span>Hire<span>Flow</span></span>
            </div>
            <div className="auth-eyebrow"><Sparkles size={14}/> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Welcome back</h1>
            <p>Pick up where your career journey left off.</p>
            <form className="form-stack" onSubmit={submit} noValidate>
                <label>Email
          <span className="field-with-icon">
                        <Mail size={16}/>
                        <input
                            ref={el => {
                                first.current = first.current || {};
                                first.current.email = el;
                            }}
                            aria-invalid={Boolean(errors.email)}
                            type="email"
                            value={form.email}
                            onChange={e => change('email', e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </span>
          {errors.email && <span className="field-error">
                        <AlertCircle size={13}/>
                        {errors.email}
                    </span>}
        </label>
                <label>Password
          <span className="field-with-icon">
                        <LockKeyhole size={16}/>
                        <input
                            ref={el => {
                                first.current = first.current || {};
                                first.current.password = el;
                            }}
                            aria-invalid={Boolean(errors.password)}
                            minLength={8}
                            type="password"
                            value={form.password}
                            onChange={e => change('password', e.target.value)}
                            autoComplete="current-password"
                        />
                    </span>
          {errors.password && <span className="field-error">
                        <AlertCircle size={13}/>
                        {errors.password}
                    </span>}
        </label>
                {server && <div className="alert error" role="alert">
                    {server}
                </div>}
                <button disabled={busy} className="btn btn-primary btn-wide">
                    {busy ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
            <div className="auth-foot auth-forgot">
                <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <p className="auth-switch">New to HireFlow? <Link to="/register">Create your account <span aria-hidden="true">→</span></Link></p>
        </div>
    </main>);
}
