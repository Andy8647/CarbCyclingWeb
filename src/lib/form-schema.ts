import * as z from 'zod';

export const formSchema = z
  .object({
    weight: z.number().min(30).max(200),
    bodyType: z.enum(['endomorph', 'mesomorph', 'ectomorph']),
    carbCoeff: z.number().min(2.0).max(8.0),
    proteinCoeff: z.number().min(0.8).max(2.5),
    fatCoeff: z.number().min(0.5).max(1.5),
    cycleDays: z.number().min(3).max(7),
    includeMidCarb: z.boolean().default(true),
    // Day allocation for each day type
    highDays: z.number().min(1).max(7),
    midDays: z.number().min(0).max(7),
    lowDays: z.number().min(1).max(7),
    // Carb distribution percentages for each day type (0-100)
    highCarbPercent: z.number().min(0).max(100),
    midCarbPercent: z.number().min(0).max(100),
    lowCarbPercent: z.number().min(0).max(100),
    // Fat distribution percentages for each day type (0-100)
    highFatPercent: z.number().min(0).max(100),
    midFatPercent: z.number().min(0).max(100),
    lowFatPercent: z.number().min(0).max(100),
  })
  .superRefine((data, ctx) => {
    // Totals must match
    if (data.highDays + data.midDays + data.lowDays !== data.cycleDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['highDays'],
        message: 'Total days must equal cycle days',
      });
    }

    // Enforce active type minimums
    if (data.highDays < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['highDays'],
        message: 'High days must be at least 1',
      });
    }
    if (data.lowDays < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lowDays'],
        message: 'Low days must be at least 1',
      });
    }

    if (data.includeMidCarb) {
      if (data.midDays < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['midDays'],
          message: 'Mid days must be at least 1 when enabled',
        });
      }
    } else {
      if (data.midDays !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['midDays'],
          message: 'Mid days must be 0 when disabled',
        });
      }
    }
  });

export type FormData = z.infer<typeof formSchema>;
