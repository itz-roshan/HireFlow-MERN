import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, me, logout, refresh, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
const r = Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});
r.post('/register', authLimiter, register);
r.post('/login', authLimiter, login);
r.post('/forgot-password', authLimiter, forgotPassword);
r.post('/reset-password', authLimiter, resetPassword);
r.get('/me', requireAuth, me);
r.post('/logout', requireAuth, logout);
r.post('/refresh', refresh);
r.patch('/password', requireAuth, changePassword);
export default r;
