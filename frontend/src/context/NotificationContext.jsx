import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
const NotificationContext = createContext(null);
export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const load = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setUnread(0);
            return;
        }
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data.notifications || []);
            setUnread(response.data.data.unread || 0);
        }
        catch {
            // Keep the last known notification state during transient network failures.
        }
    }, [user]);
    useEffect(() => {
        load();
        if (!user)
            return undefined;
        const timer = window.setInterval(load, 30000);
        return () => window.clearInterval(timer);
    }, [load, user]);
    useEffect(() => {
        if (!socket)
            return undefined;
        const onNew = (notification) => {
            if (!notification?._id)
                return;
            setNotifications((current) => {
                const alreadyPresent = current.some((item) => item._id === notification._id);
                if (alreadyPresent)
                    return current.map((item) => item._id === notification._id ? notification : item);
                if (!notification.read)
                    setUnread((count) => count + 1);
                return [notification, ...current].slice(0, 100);
            });
        };
        socket.on('notification:new', onNew);
        return () => socket.off('notification:new', onNew);
    }, [socket]);
    const markRead = useCallback(async (id) => {
        if (!id)
            return;
        const current = notifications.find((item) => item._id === id);
        if (current?.read)
            return;
        await api.patch(`/notifications/${id}/read`);
        setNotifications((items) => items.map((item) => item._id === id ? { ...item, read: true } : item));
        setUnread((count) => Math.max(0, count - 1));
    }, [notifications]);
    const markAllRead = useCallback(async () => {
        await api.patch('/notifications/read-all');
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
        setUnread(0);
    }, []);
    const value = useMemo(() => ({ notifications, unread, load, markRead, markAllRead }), [notifications, unread, load, markRead, markAllRead]);
    return (<NotificationContext.Provider value={value}>
        {children}
    </NotificationContext.Provider>);
}
export function useNotificationContext() {
    const value = useContext(NotificationContext);
    if (!value)
        throw new Error('useNotificationContext must be used inside NotificationProvider');
    return value;
}
