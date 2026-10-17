import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/client';
import { useAuth } from './AuthContext';
const SocketContext = createContext(null);
export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        if (!user) {
            setSocket((current) => {
                current?.disconnect();
                return null;
            });
            return undefined;
        }
        const url = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, '');
        const instance = io(url, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 8,
            reconnectionDelay: 800,
            transports: ['websocket', 'polling']
        });
        setSocket(instance);
        return () => {
            instance.disconnect();
            setSocket((current) => current === instance ? null : current);
        };
    }, [user?.id, user?._id]);
    const value = useMemo(() => ({ socket }), [socket]);
    return (<SocketContext.Provider value={value}>
        {children}
    </SocketContext.Provider>);
}
export function useSocketContext() {
    return useContext(SocketContext);
}
