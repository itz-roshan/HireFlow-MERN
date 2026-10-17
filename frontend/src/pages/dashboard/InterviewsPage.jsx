import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { CalendarDays, Video } from 'lucide-react';
import StatusBadge from '../../components/applications/StatusBadge';
import { useAuth } from '../../context/AuthContext';
export default function InterviewsPage() {
    const { user } = useAuth();
    const { data, reload } = useFetch(() => api.get('/interviews'), []);
    const [toast, setToast] = useState('');
    const update = async (id, status) => {
        try {
            await api.patch(`/interviews/${id}/status`, { status });
            setToast('Interview updated.');
            reload();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update interview');
        }
    };
    const interviews = data?.interviews || [];
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">INTERVIEWS</div>
                <h1>Upcoming conversations</h1>
                <p>Stay ready for the next step, and keep every update visible.</p>
            </div>
        </div>
        {interviews.length ? <div className="grid-2">
            {interviews.map(i => {
                const candidateActions = ['SCHEDULED', 'CONFIRMED'].includes(i.status) ? ['CONFIRMED', 'CANCELLED'] : [];
                const recruiterActions = i.status === 'SCHEDULED' ? ['CONFIRMED', 'CANCELLED'] : i.status === 'CONFIRMED' ? ['COMPLETED', 'CANCELLED'] : [];
                const actions = user.role === 'JOB_SEEKER' ? candidateActions : recruiterActions;
                return (<article key={i._id} className="panel interview-card">
                <div className="interview-date">
                    <CalendarDays size={22}/>
                    <b>
                        {new Date(i.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </b>
                </div>
                <div>
                    <h3>
                        {i.application?.job?.title || 'Interview'}
                    </h3>
                    <p>{i.type} · {new Date(i.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {i.duration} min</p>
                    {i.meetingLink && <a className="btn btn-outline btn-sm" href={i.meetingLink} target="_blank" rel="noreferrer"><Video size={15}/> Join</a>}
                </div>
                <div className="interview-actions">
                    <StatusBadge status={i.status}/>
                    {actions.length ? <select value="" onChange={e => update(i._id, e.target.value)}>
                        <option value="">Update…</option>
                        {actions.map(s => (<option key={s}>
                            {s}
                        </option>))}
                    </select> : null}
                </div>
            </article>);
            })}
        </div> : <section className="panel">
            <EmptyState
                title="No interviews scheduled"
                message="When a recruiter schedules a conversation, it will appear here."
            />
        </section>}
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
