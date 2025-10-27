import * as z from 'zod';

export const formSchema = z
  .object({
    weight: z.number().min(30).max(200),
    // Per-day-type coefficients (g/kg)
    lowCarbCoeff: z.number().min(0.5).max(8.0),
    lowProteinCoeff: z.number().min(0.8).max(2.5),
    lowFatCoeff: z.number().min(0.3).max(2.0),
    highCarbCoeff: z.number().min(0.5).max(8.0),
    highProteinCoeff: z.number().min(0.5).max(2.5),
    highFatCoeff: z.number().min(0.3).max(2.0),
    cycleDays: z.number().min(3).max(7),
    // Day allocation (high/low only)
    highDays: z.number().min(1).max(7),
    lowDays: z.number().min(1).max(7),
    // Optional profile fields for TDEE (UI may add later)
    sex: z.enum(['male', 'female']).optional(),
    age: z.number().min(12).max(100).optional(),
    heightCm: z.number().min(100).max(250).optional(),
    activityFactor: z.number().min(1.0).max(3.0).optional(),
  })
  .superRefine((data, ctx) => {
    // Totals must match
    if (data.highDays + data.lowDays !== data.cycleDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['highDays'],
        message: 'Total days must equal cycle days',
      });
    }

    // Enforce minimums
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
  });

export type FormData = z.infer<typeof formSchema>;
