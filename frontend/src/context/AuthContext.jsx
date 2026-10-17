import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
const C = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshMe = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            const next = response.data.data.user;
            setUser(next);
            return next;
        }
        catch (firstError) {
            if (firstError.response?.status !== 401)
                throw firstError;
            await api.post('/auth/refresh');
            const response = await api.get('/auth/me');
            const next = response.data.data.user;
            setUser(next);
            return next;
        }
    }, []);
    useEffect(() => {
        refreshMe().catch(() => setUser(null)).finally(() => setLoading(false));
        const handleExpired = () => setUser(null);
        window.addEventListener('hireflow:auth-expired', handleExpired);
        return () => window.removeEventListener('hireflow:auth-expired', handleExpired);
    }, [refreshMe]);
    const value = useMemo(() => ({
        user,
        loading,
        refreshMe,
        login: async (payload) => {
            const response = await api.post('/auth/login', payload);
            setUser(response.data.data.user);
            return response.data.data.user;
        },
        register: async (payload) => {
            const response = await api.post('/auth/register', payload);
            setUser(response.data.data.user);
            return response.data.data.user;
        },
        logout: async () => {
            await api.post('/auth/logout').catch(() => { });
            setUser(null);
        }
    }), [user, loading, refreshMe]);
    return (<C.Provider value={value}>
        {children}
    </C.Provider>);
}
export const useAuth = () => useContext(C);
