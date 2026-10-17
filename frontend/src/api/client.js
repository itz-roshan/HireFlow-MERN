import axios from 'axios';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
});
let refreshing = null;
api.interceptors.response.use((response) => response, async (error) => {
    const original = error.config;
    const url = String(original?.url || '');
    const authEndpoint = /^\/auth\/(login|register|refresh|me|logout|password)/.test(url);
    if (error.response?.status === 401 && original && !original._retry && !authEndpoint) {
        original._retry = true;
        refreshing ??= api.post('/auth/refresh').finally(() => {
            refreshing = null;
        });
        try {
            await refreshing;
            return api(original);
        }
        catch {
            window.dispatchEvent(new CustomEvent('hireflow:auth-expired'));
            // Preserve the original 401 so the page/auth guard can handle it.
        }
    }
    return Promise.reject(error);
});
