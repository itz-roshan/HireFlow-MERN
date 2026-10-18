
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { io } from 'socket.io-client';
import { API_URL, api } from '../api/client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let cancelled = false;
        let instance = null;

        if (!user) {
            setSocket((current) => {
                current?.disconnect();
                return null;
            });
            return undefined;
        }

        async function connectSocket() {
            try {
                // This request goes through the existing /api proxy.
                const response = await api.get('/auth/socket-token');
                const token = response.data?.data?.token;

                if (!token) {
                    throw new Error('Socket token missing from API response');
                }

                if (cancelled) return;

                const url =
                    import.meta.env.VITE_SOCKET_URL ||
                    API_URL.replace(/\/api\/?$/, '');

                instance = io(url, {
                    auth: { token },
                    withCredentials: true,
                    reconnection: true,
                    reconnectionAttempts: 8,
                    reconnectionDelay: 800,
                    transports: ['websocket', 'polling']
                });

                instance.on('connect_error', (error) => {
                    console.error(
                        'HireFlow Socket.IO connection failed:',
                        error.message
                    );
                });

                setSocket(instance);
            } catch (error) {
                console.error(
                    'Could not initialize HireFlow messaging:',
                    error.response?.status,
                    error.response?.data?.message || error.message
                );

                if (!cancelled) {
                    window.dispatchEvent(
                        new Event('hireflow:socket-init-failed')
                    );
                }
            }
        }

        connectSocket();

        return () => {
            cancelled = true;
            instance?.disconnect();
            setSocket((current) =>
                current === instance ? null : current
            );
        };
    }, [user?.id, user?._id]);

    const value = useMemo(() => ({ socket }), [socket]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocketContext() {
    return useContext(SocketContext);
}
