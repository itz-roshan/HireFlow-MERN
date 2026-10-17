import { z } from 'zod';
const url = z.string().url('Enter a valid URL').refine(v => v === '' || /^https?:\/\//i.test(v), 'Use an http(s) URL').or(z.literal(''));
const phone = z.string().trim().regex(/^[+0-9()\-\s]{7,25}$/, 'Enter a valid phone number').optional().or(z.literal(''));
export const profileSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone,
    location: z.string().trim().max(100).optional(),
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(2000).optional(),
    skills: z.array(z.string().trim().min(1)).max(30).optional(),
    education: z.array(z.string().trim().min(1)).max(15).optional(),
    experience: z.array(z.string().trim().min(1)).max(15).optional(),
    social: z.object({
        linkedin: url,
        github: url,
        portfolio: url
    }).partial().optional()
});
