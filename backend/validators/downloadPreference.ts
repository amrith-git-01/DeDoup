import { z } from 'zod';

export const updateDownloadPreferencesSchemaZod = z.object({
    trackingEnabled: z.boolean().optional(),
    removeDuplicates: z.boolean().optional(),
    domainBlocklist: z.array(z.string().min(1).max(253)).optional(),
    pausedUntil: z.union([z.string(), z.date()]).nullable().optional(),
    pauseForSeconds: z.number().min(0).optional(),
});
export type UpdateDownloadPreferencesInput = z.infer<typeof updateDownloadPreferencesSchemaZod>;