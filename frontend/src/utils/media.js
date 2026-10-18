
const MEDIA_BASE = (
  import.meta.env.VITE_MEDIA_URL ||
  'https://hireflow-mern.onrender.com'
).replace(/\/+$/, '');

export const API_ORIGIN = MEDIA_BASE;

export function mediaUrl(value) {
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${MEDIA_BASE}${path}`;
}
