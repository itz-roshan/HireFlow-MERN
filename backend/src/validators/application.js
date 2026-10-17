import { z } from 'zod';
export const applicationSchema = z.object({
    jobId: z.string().min(10),
    coverLetter: z.string().max(5000).optional(),
    expectedSalary: z.number().int().nonnegative().max(1000000000).optional(),
    noticePeriod: z.string().max(100).optional()
});
