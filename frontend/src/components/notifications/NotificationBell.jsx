import { Bell, Check, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
export default function NotificationBell() {
    const { notifications, unread, markRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const latest = notifications.slice(0, 5);
    useEffect(() => {
        const onPointer = (event) => {
            if (ref.current && !ref.current.contains(event.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        return () => document.removeEventListener('mousedown', onPointer);
    }, []);
    const openNotification = async (item) => {
        try {
            if (!item.read)
                await markRead(item._id);
        }
        finally {
            setOpen(false);
            navigate(item.link || '/notifications');
        }
    };
    return (<div className="notif-wrap" ref={ref}>
        <button
            className={`notification-bell ${open ? 'is-open' : ''}`}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
            <Bell size={19}/>
            {unread > 0 && <span className="notif-count">
                {unread > 9 ? '9+' : unread}
            </span>}
        </button>
        <div
            className={`notif-popover ${open ? 'show' : ''}`}
            role="dialog"
            aria-label="Recent notifications"
        >
            <div className="notif-pop-head">
                <div>
                    <b>Notifications</b>
                    <span>
                        {unread ? `${unread} unread` : 'All caught up'}
                    </span>
                </div>
                <Link to="/notifications" onClick={() => setOpen(false)}>View all <ChevronRight size={14}/></Link>
            </div>
            {latest.length ? latest.map((item) => (<button
                type="button"
                className={`notif-preview ${item.read ? '' : 'unread'}`}
                key={item._id}
                onClick={() => openNotification(item)}
            >
                <span className="notif-dot"/>
                <div>
                    <b>
                        {item.title}
                    </b>
                    <span>
                        {item.message}
                    </span>
                    <small>
                        {new Date(item.createdAt).toLocaleString()}
                    </small>
                </div>
                {!item.read && <Check size={14} className="notif-check"/>}
            </button>)) : <div className="notif-empty">No updates right now.</div>}
            <Link className="notif-footer-link" to="/notifications" onClick={() => setOpen(false)}>Open notification center</Link>
        </div>
    </div>);
}
