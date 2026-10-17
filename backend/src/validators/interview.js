import { z } from 'zod';
export const interviewSchema = z.object({
    applicationId: z.string().min(10),
    date: z.string().datetime(),
    duration: z.number().int().min(15).max(240).default(45),
    type: z.enum(['ONLINE', 'PHONE', 'ONSITE']),
    meetingLink: z.string().url().optional().or(z.literal('')),
    notes: z.string().max(1500).optional()
}).refine(v => v.type !== 'ONLINE' || v.meetingLink, 'For online interviews, add a meeting link.');
