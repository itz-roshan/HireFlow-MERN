import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Toast from '../../components/common/Toast';
import { useState } from 'react';
export default function NotificationsPage() {
    const { notifications, unread, load } = useNotifications();
    const [toast, setToast] = useState('');
    const read = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            load();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update notification');
        }
    };
    const all = async () => {
        try {
            await api.patch('/notifications/read-all');
            load();
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Unable to update notifications');
        }
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">UPDATES</div>
                <h1>Notifications</h1>
                <p>
                    {unread ? `${unread} unread update${unread === 1 ? '' : 's'} waiting for you.` : 'Everything is up to date.'}
                </p>
            </div>
            <button className="btn btn-outline" onClick={all} disabled={!unread}><Check size={16}/> Mark all read</button>
        </div>
        <section className="panel">
            {notifications.length ? <div className="notification-list">
                {notifications.map(n => (<div className={`notification ${n.read ? '' : 'unread'}`} key={n._id}>
                    <div className="notification-icon">
                        <Bell size={18}/>
                    </div>
                    <div className="notification-content">
                        <b>
                            {n.title}
                        </b>
                        <p>
                            {n.message}
                        </p>
                        <span>
                            {new Date(n.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="notification-actions">
                        {n.link && <Link className="icon-btn" to={n.link} title="Open">
                            <ExternalLink size={15}/>
                        </Link>}
                        {!n.read && <button className="btn btn-ghost btn-sm" onClick={() => read(n._id)}>Mark read</button>}
                    </div>
                </div>))}
            </div> : <EmptyState title="All quiet" message="New activity will show up here."/>}
        </section>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
