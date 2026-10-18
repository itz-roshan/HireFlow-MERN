import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { registerSchema, loginSchema, passwordSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js';
import { signAccess, signRefresh, verifyRefresh, hashToken, setCookies, clearCookies, REFRESH } from '../utils/jwt.js';
import crypto from 'crypto';
import { ok, fail } from '../utils/api.js';
import { env } from '../config/env.js';
const pub = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    phone: user.phone,
    location: user.location,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
    education: user.education,
    experience: user.experience,
    social: user.social,
    resumeUrl: user.resumeUrl
});
async function issue(res, user) {
    const payload = { sub: String(user._id), role: user.role, name: user.name, sv: user.sessionVersion || 0 };
    const access = signAccess(payload);
    const refresh = signRefresh(payload);
    user.refreshTokenHash = hashToken(refresh);
    user.lastLoginAt = new Date();
    await user.save();
    setCookies(res, access, refresh);
    return pub(user);
}
export async function register(req, res) {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();
    if (await User.exists({ email }))
        return fail(res, 'Email is already registered', 409);
    const user = await User.create({
        name: data.name,
        email,
        passwordHash: await bcrypt.hash(data.password, 12),
        role: data.role
    });
    
    if (data.role === 'RECRUITER' && data.companyName) {
        await Company.create({
            name: data.companyName,
            slug: `${data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(user._id).slice(-6)}`,
            owner: user._id
        });
    }
    return ok(res, { user: await issue(res, user) }, 'Account created', 201);
}
export async function socketToken(req, res) {
    const user = req.user;

    const token = signAccess({
        sub: String(user._id),
        role: user.role,
        name: user.name,
        sv: user.sessionVersion || 0,
        purpose: 'socket'
    });

    return ok(res, { token }, 'Socket token created');
}
export async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash +refreshTokenHash');
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash)))
        return fail(res, 'Invalid email or password', 401);
    if (user.status !== 'ACTIVE')
        return fail(res, 'Your account is blocked', 403);
    return ok(res, { user: await issue(res, user) }, 'Login successful');
}
export async function me(req, res) {
    return ok(res, { user: pub(req.user) });
}
export async function logout(req, res) {
    const user = await User.findById(req.user._id).select('+refreshTokenHash');
    if (user) {
        user.refreshTokenHash = undefined;
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        await user.save();
    }
    clearCookies(res);
    return ok(res, null, 'Logged out');
}
export async function refresh(req, res) {
    try {
        const token = req.cookies?.[REFRESH];
        if (!token)
            return fail(res, 'Refresh session missing', 401);
        const payload = verifyRefresh(token);
        const user = await User.findById(payload.sub).select('+refreshTokenHash');
        if (!user || user.status !== 'ACTIVE' || user.refreshTokenHash !== hashToken(token))
            return fail(res, 'Refresh session is invalid', 401);
        return ok(res, { user: await issue(res, user) }, 'Session refreshed');
    }
    catch {
        return fail(res, 'Refresh session expired', 401);
    }
}
export async function forgotPassword(req, res) {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase(), status: 'ACTIVE' }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = hashToken(token);
        user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        if (env.nodeEnv === 'development')
            console.log(`[HireFlow dev] Password reset token for ${user.email}: ${token}`);
    }
    return ok(res, null, 'If that email is registered, reset instructions have been created.');
}
export async function resetPassword(req, res) {
    const data = resetPasswordSchema.parse(req.body);
    const user = await User.findOne({
        passwordResetTokenHash: hashToken(data.token),
        passwordResetExpiresAt: { $gt: new Date() },
        status: 'ACTIVE'
    }).select('+passwordHash +refreshTokenHash +passwordResetTokenHash +passwordResetExpiresAt');
    if (!user)
        return fail(res, 'Reset token is invalid or expired', 400);
    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    return ok(res, null, 'Password reset successfully. Please sign in.');
}
export async function changePassword(req, res) {
    const data = passwordSchema.parse(req.body);
    const user = await User.findById(req.user._id).select('+passwordHash +refreshTokenHash');
    if (!user || !(await bcrypt.compare(data.currentPassword, user.passwordHash)))
        return fail(res, 'Current password is incorrect', 400);
    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    user.refreshTokenHash = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    clearCookies(res);
    return ok(res, null, 'Password changed. Please sign in again.');
}
