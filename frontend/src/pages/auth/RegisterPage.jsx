import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Building2, UserRound, Check } from 'lucide-react';
const initial = { name: '', email: '', password: '', confirm: '', role: 'JOB_SEEKER', companyName: '' };
const rules = {
    name: (v) => v.trim().length >= 2 ? '' : 'Full name must be at least 2 characters.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.',
    password: (v) => v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) ? '' : 'Use at least 8 characters, one uppercase letter and one number.',
    confirm: (v, f) => v === f.password ? '' : 'Passwords do not match.'
};
export default function RegisterPage() {
    const { register } = useAuth(), nav = useNavigate();
    const firstInvalid = useRef(null);
    const [f, setF] = useState(initial), [errors, setErrors] = useState({}), [server, setServer] = useState(''), [busy, setBusy] = useState(false);
    const validateField = (key, value = f[key]) => {
        const fn = rules[key];
        return fn ? fn(value, f) : '';
    };
    const onChange = (key, value) => {
        setF(x => ({ ...x, [key]: value }));
        if (rules[key])
            setErrors(x => ({ ...x, [key]: rules[key](value, f) }));
    };
    const submit = async (e) => {
        e.preventDefault();
        setServer('');
        const next = {};
        for (const k of ['name', 'email', 'password', 'confirm']) {
            const m = validateField(k);
            if (m)
                next[k] = m;
        }
        if (f.role === 'RECRUITER' && f.companyName.trim().length < 2)
            next.companyName = 'Company name must be at least 2 characters.';
        setErrors(next);
        if (Object.keys(next).length) {
            const key = Object.keys(next)[0];
            requestAnimationFrame(() => firstInvalid.current?.[key]?.focus?.());
            return;
        }
        setBusy(true);
        try {
            const payload = {
                name: f.name.trim(),
                email: f.email.trim(),
                password: f.password,
                role: f.role
            };
            if (f.role === 'RECRUITER') {
                payload.companyName = f.companyName.trim();
            }
            await register(payload);
            nav('/dashboard');
        }
        catch (x) {
            const data = x.response?.data;
            setServer(data?.message || 'We could not create your account. Please try again.');
            if (data?.fieldErrors)
                setErrors(data.fieldErrors);
        }
        finally {
            setBusy(false);
        }
    };
    return (<main className="auth-page">
        <div className="auth-card wide">
            <div className="auth-brand">
                <span className="brand-mark">H</span>
                <span>Hire<span>Flow</span>
    </span>
            </div>
            <div className="auth-eyebrow"><CheckCircle2 size={14}/> A BETTER WAY TO HIRE &amp;
GET HIRED</div>
            <h1>Start with the right context</h1>
            <p>Create a profile that feels like a person, not a form.</p>
            <div className="role-picker" aria-label="Choose account type">
                <button
                    type="button"
                    className={f.role === 'JOB_SEEKER' ? 'selected' : ''}
                    onClick={() => setF({ ...f, role: 'JOB_SEEKER' })}
                >
                    <UserRound size={20}/>
                    <span>
                        <b>I’m looking for work</b>
                        <small>Discover roles and track applications.</small>
                    </span>
                    {f.role === 'JOB_SEEKER' && <Check size={18} className="role-check"/>}
                </button>
                <button
                    type="button"
                    className={f.role === 'RECRUITER' ? 'selected' : ''}
                    onClick={() => setF({ ...f, role: 'RECRUITER' })}
                >
                    <Building2 size={20}/>
                    <span>
                        <b>I’m hiring talent</b>
                        <small>Build a team and manage applicants.</small>
                    </span>
                    {f.role === 'RECRUITER' && <Check size={18} className="role-check"/>}
                </button>
            </div>
            <div className="requirements-box">
                <b>What you’ll need</b>
                <span><CheckCircle2 size={15}/>A valid email address</span>
                <span><CheckCircle2 size={15}/>Password: 8+ chars, uppercase + number</span>
                <span><CheckCircle2 size={15}/>Keep your profile details up to date</span>
            </div>
            <form className="form-stack" onSubmit={submit} noValidate>
                <label>Full name *<input
                        ref={el => {
                            firstInvalid.current = firstInvalid.current || {};
                            firstInvalid.current.name = el;
                        }}
                        aria-invalid={Boolean(errors.name)}
                        value={f.name}
                        onBlur={() => onChange('name', f.name)}
                        onChange={e => onChange('name', e.target.value)}
                        placeholder="Your name"
                    />{errors.name && <span className="field-error">
                        {errors.name}
                    </span>}</label>
                <label>Email *<input
                        ref={el => {
                            firstInvalid.current = firstInvalid.current || {};
                            firstInvalid.current.email = el;
                        }}
                        aria-invalid={Boolean(errors.email)}
                        type="email"
                        value={f.email}
                        onBlur={() => onChange('email', f.email)}
                        onChange={e => onChange('email', e.target.value)}
                        placeholder="you@example.com"
                    />{errors.email && <span className="field-error">
                        {errors.email}
                    </span>}</label>
                {f.role === 'RECRUITER' && <label>Company name *<input aria-invalid={Boolean(errors.companyName)} value={f.companyName} onChange={e => {
                            setF({ ...f, companyName: e.target.value });
                            setErrors(x => ({ ...x, companyName: '' }));
                        }} placeholder="Acme Technologies"/>{errors.companyName && <span className="field-error">
                        {errors.companyName}
                    </span>}</label>}
                <label>Password *<input
                        ref={el => {
                            firstInvalid.current = firstInvalid.current || {};
                            firstInvalid.current.password = el;
                        }}
                        aria-invalid={Boolean(errors.password)}
                        type="password"
                        value={f.password}
                        onBlur={() => onChange('password', f.password)}
                        onChange={e => onChange('password', e.target.value)}
                        placeholder="8+ characters"
                    />{errors.password && <span className="field-error">
                        {errors.password}
                    </span>}</label>
                <label>Confirm password *<input
                        ref={el => {
                            firstInvalid.current = firstInvalid.current || {};
                            firstInvalid.current.confirm = el;
                        }}
                        aria-invalid={Boolean(errors.confirm)}
                        type="password"
                        value={f.confirm}
                        onBlur={() => onChange('confirm', f.confirm)}
                        onChange={e => onChange('confirm', e.target.value)}
                    />{errors.confirm && <span className="field-error">
                        {errors.confirm}
                    </span>}</label>
                {server && <div className="alert error" role="alert">
                    {server}
                </div>}
                <button disabled={busy} className="btn btn-primary btn-wide">
                    {busy ? 'Creating account…' : 'Create account'}
                </button>
            </form>
            <p className="auth-switch">Already have an account? <Link to="/login">Sign in <span aria-hidden="true">→</span>
    </Link>
    </p>
        </div>
    </main>);
}
