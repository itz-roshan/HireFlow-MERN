import { verifyAccess, ACCESS } from '../utils/jwt.js';
import User from '../models/User.js';
import { fail } from '../utils/api.js';
export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.[ACCESS];
        if (!token)
            return fail(res, 'Authentication required', 401);
        const payload = verifyAccess(token);
        const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
        if (!user || user.status !== 'ACTIVE' || (payload.sv ?? 0) !== (user.sessionVersion ?? 0))
            return fail(res, 'Account session is no longer valid', 401);
        req.user = user;
        next();
    }
    catch {
        return fail(res, 'Session expired. Please login again.', 401);
    }
}
export async function optionalAuth(req, res, next) {
    try {
        const token = req.cookies?.[ACCESS];
        if (!token)
            return next();
        const payload = verifyAccess(token);
        const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
        if (user?.status === 'ACTIVE' && (payload.sv ?? 0) === (user.sessionVersion ?? 0))
            req.user = user;
    }
    catch {
        // Public endpoints remain public when an optional session is expired.
    }
    next();
}
export const requireRole = (...roles) => (req, res, next) => roles.includes(req.user?.role)
    ? next()
    : fail(res, 'You do not have permission for this action', 403);
