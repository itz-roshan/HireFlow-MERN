import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import Modal from '../ui/Modal';
import { api } from '../../api/client';
import Toast from '../common/Toast';
export default function InterviewScheduler({ application, onDone }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        date: '',
        duration: 45,
        type: 'ONLINE',
        meetingLink: '',
        notes: ''
    });
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        if (!form.date)
            return;
        setBusy(true);
        try {
            await api.post('/interviews', {
                applicationId: application._id,
                date: new Date(form.date).toISOString(),
                duration: Number(form.duration),
                type: form.type,
                meetingLink: form.meetingLink || undefined,
                notes: form.notes || undefined
            });
            setToast('Interview scheduled and candidate notified.');
            setOpen(false);
            onDone?.();
        }
        catch (x) {
            setToast(x.response?.data?.message || 'Could not schedule interview.');
        }
        finally {
            setBusy(false);
        }
    };
    return (<>
        <button className="icon-btn" title="Schedule interview" onClick={() => setOpen(true)}>
            <CalendarClock size={16}/>
        </button>
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            title={`Schedule interview`}
            subtitle={`${application.applicant.name} · ${application.job.title}`}
        >
            <form className="form-stack" onSubmit={submit}>
                <label>Date & time<input
                        required
                        type="datetime-local"
                        value={form.date}
                        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                    /></label>
                <div className="form-grid two">
                    <label>Duration<select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="90">90 min</option>
                        </select>
    </label>
                    <label>Type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option>ONLINE</option>
                            <option>PHONE</option>
                            <option>ONSITE</option>
                        </select>
    </label>
                </div>
                <label>Meeting link<input
                        type="url"
                        value={form.meetingLink}
                        onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                        placeholder="https://meet.google.com/..."
                    /></label>
                <label>Notes<textarea
                        rows="4"
                        maxLength="1500"
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        placeholder="Anything the candidate should know?"
                    /></label>
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? 'Scheduling…' : 'Schedule interview'}
                    </button>
                </div>
            </form>
            <Toast message={toast} onClose={() => setToast('')}/>
        </Modal>
    </>);
}
