
import { API_URL } from '../api/client';

const configuredApiOrigin = /^https?:\/\//i.test(API_URL)
  ? API_URL.replace(/\/api\/?$/, '')
  : '';

export const API_ORIGIN = (
  configuredApiOrigin ||
  import.meta.env.VITE_MEDIA_URL ||
  'https://hireflow-mern.onrender.com'
).replace(/\/$/, '');

export function mediaUrl(value) {
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${API_ORIGIN}${path}`;
}
