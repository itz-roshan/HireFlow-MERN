import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { api } from '../../api/client';
export default function JobApplicationModal({ job, user, onClose, onSubmitted }) {
    const [form, setForm] = useState({ coverLetter: '', expectedSalary: '', noticePeriod: '' });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const validate = () => {
        const next = {};
        if (form.expectedSalary !== '' && (!Number.isFinite(Number(form.expectedSalary)) || Number(form.expectedSalary) < 0))
            next.expectedSalary = 'Expected salary must be zero or greater.';
        if (form.coverLetter.length > 5000)
            next.coverLetter = 'Cover letter must be 5,000 characters or less.';
        if (form.noticePeriod.length > 100)
            next.noticePeriod = 'Notice period must be 100 characters or less.';
        setErrors(next);
        return next;
    };
    const submit = async (e) => {
        e.preventDefault();
        const next = validate();
        if (Object.keys(next).length)
            return;
        if (!user?.resumeUrl)
            return setErrors({ resume: 'Upload a resume before applying.' });
        setBusy(true);
        try {
            await api.post('/applications', {
                jobId: job._id,
                coverLetter: form.coverLetter.trim() || undefined,
                expectedSalary: form.expectedSalary === '' ? undefined : Number(form.expectedSalary),
                noticePeriod: form.noticePeriod.trim() || undefined
            });
            onSubmitted?.();
            onClose();
        }
        catch (x) {
            const data = x.response?.data;
            setErrors(data?.fieldErrors || { form: data?.message || 'Could not submit application.' });
        }
        finally {
            setBusy(false);
        }
    };
    return (<Modal
        open
        onClose={onClose}
        title="Apply for this role"
        subtitle={`${job.title} · ${job.company?.name || 'Hiring team'}`}
    >
        <form className="form-stack" onSubmit={submit} noValidate>
            {!user?.resumeUrl && <div className="alert warning">Add a resume before applying. <Link to="/profile" className="link-strong">Open your profile</Link></div>}
            {errors.resume && <div className="alert error">
                {errors.resume}
            </div>}
            <label>Cover letter <span className="field-hint">optional</span>
        <textarea
                    rows={7}
                    maxLength={5000}
                    aria-invalid={Boolean(errors.coverLetter)}
                    value={form.coverLetter}
                    onChange={e => {
                        setForm({ ...form, coverLetter: e.target.value });
                        setErrors({ ...errors, coverLetter: '' });
                    }}
                    placeholder="Tell the team why this role interests you…"
                />
        {errors.coverLetter && <span className="field-error">
                    {errors.coverLetter}
                </span>}
      </label>
            <div className="form-grid two">
                <label>Expected salary <span className="field-hint">annual</span>
          <input
                        type="number"
                        min="0"
                        value={form.expectedSalary}
                        aria-invalid={Boolean(errors.expectedSalary)}
                        onChange={e => {
                            setForm({ ...form, expectedSalary: e.target.value });
                            setErrors({ ...errors, expectedSalary: '' });
                        }}
                        placeholder="e.g. 700000"
                    />
          {errors.expectedSalary && <span className="field-error">
                        {errors.expectedSalary}
                    </span>}
        </label>
                <label>Notice period
          <input
                        maxLength={100}
                        aria-invalid={Boolean(errors.noticePeriod)}
                        value={form.noticePeriod}
                        onChange={e => {
                            setForm({ ...form, noticePeriod: e.target.value });
                            setErrors({ ...errors, noticePeriod: '' });
                        }}
                        placeholder="e.g. Immediate"
                    />
          {errors.noticePeriod && <span className="field-error">
                        {errors.noticePeriod}
                    </span>}
        </label>
            </div>
            {errors.form && <div className="alert error" role="alert">
                {errors.form}
            </div>}
            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" disabled={busy || !user?.resumeUrl}>
                    {busy ? 'Submitting…' : 'Submit application'}
                </button>
            </div>
        </form>
    </Modal>);
}
