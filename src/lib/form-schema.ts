import * as z from 'zod';

export const formSchema = z
  .object({
    weight: z.number().min(30).max(200),
    bodyType: z.enum(['endomorph', 'mesomorph', 'ectomorph']),
    carbCoeff: z.number().min(2.0).max(8.0),
    proteinCoeff: z.number().min(0.8).max(2.5),
    fatCoeff: z.number().min(0.5).max(1.5),
    cycleDays: z.number().min(3).max(7),
    // Day allocation for each day type
    highDays: z.number().min(1).max(7),
    midDays: z.number().min(1).max(7),
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
  .refine(
    (data) => data.highDays + data.midDays + data.lowDays === data.cycleDays,
    {
      message: 'Total days must equal cycle days',
      path: ['highDays'],
    }
  );

export type FormData = z.infer<typeof formSchema>;
