import { z } from 'zod';

const strongPassword = z
    .string()
    .min(8, 'Password must contain at least 8 characters.')
    .max(72, 'Password must not exceed 72 characters.')
    .regex(/[A-Z]/, 'Password needs at least one uppercase letter.')
    .regex(/[0-9]/, 'Password needs at least one number.');

const optionalCompanyNameSchema = z.preprocess(
    (value) => {
        if (typeof value === 'string' && value.trim() === '') {
            return undefined;
        }

        return value;
    },
    z
        .string()
        .trim()
        .min(2, 'Company name must be at least 2 characters.')
        .max(120, 'Company name must not exceed 120 characters.')
        .optional()
);

export const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Full name must be at least 2 characters.')
            .max(80, 'Full name must not exceed 80 characters.'),
        email: z.string().trim().email('Please enter a valid email address.'),
        password: strongPassword,
        role: z.enum(['JOB_SEEKER', 'RECRUITER']).default('JOB_SEEKER'),
        companyName: optionalCompanyNameSchema
    })
    .superRefine((data, context) => {
        if (data.role === 'RECRUITER' && !data.companyName) {
            context.addIssue({
                code: 'custom',
                path: ['companyName'],
                message: 'Company name must be at least 2 characters.'
            });
        }
    });

export const loginSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required.')
});

export const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required.'),
        newPassword: strongPassword
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        path: ['newPassword'],
        message: 'New password must be different.'
    });

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address.')
});

export const resetPasswordSchema = z.object({
    token: z.string().min(20).max(300),
    newPassword: strongPassword
});
