import { z } from 'zod';
const salary = z.number().int().nonnegative().optional();
export const jobSchema = z.object({
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(40),
    responsibilities: z.string().max(5000).optional(),
    requirements: z.string().max(5000).optional(),
    location: z.string().trim().min(2).max(120),
    workMode: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    experience: z.string().max(80).optional(),
    minSalary: salary,
    maxSalary: salary,
    skills: z.array(z.string().trim().min(1).max(40)).min(1).max(15),
    category: z.string().trim().min(2).max(80),
    benefits: z.array(z.string().trim().min(1).max(100)).max(12).optional(),
    deadline: z.string().datetime().optional(),
    published: z.boolean().optional()
}).refine((value) => value.maxSalary == null || value.minSalary == null || value.maxSalary >= value.minSalary, {
    path: ['maxSalary'], message: 'Maximum salary must be greater than or equal to minimum salary'
}).refine((value) => !value.deadline || new Date(value.deadline) > new Date(), {
    path: ['deadline'], message: 'Deadline must be in the future'
});
export const statusSchema = z.object({
    status: z.enum(['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']),
    note: z.string().max(1000).optional()
});
