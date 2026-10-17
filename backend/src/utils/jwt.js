import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
export const ACCESS = 'hireflow_access', REFRESH = 'hireflow_refresh';
export const hashToken = t => crypto.createHash('sha256').update(t).digest('hex');
export const signAccess = p => jwt.sign(p, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export const signRefresh = p => jwt.sign(p, env.refreshSecret, { expiresIn: env.refreshExpiresIn });
export const verifyAccess = t => jwt.verify(t, env.jwtSecret);
export const verifyRefresh = t => jwt.verify(t, env.refreshSecret);
export function setCookies(res, a, r) {
    const common = { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production' };
    res.cookie(ACCESS, a, { ...common, maxAge: 30 * 60 * 1000 });
    res.cookie(REFRESH, r, { ...common, maxAge: 7 * 24 * 60 * 60 * 1000 });
}
export function clearCookies(res) {
    const common = { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production' };
    res.clearCookie(ACCESS, common);
    res.clearCookie(REFRESH, common);
}
