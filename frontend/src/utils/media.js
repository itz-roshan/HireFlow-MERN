import { API_URL } from '../api/client';
export const API_ORIGIN = API_URL.replace(/\/api(?:\/?)$/, '');
export function mediaUrl(value) {
    if (!value)
        return '';
    if (/^https?:\/\//i.test(value))
        return value;
    return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
}
