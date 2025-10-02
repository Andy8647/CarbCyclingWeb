import * as z from 'zod';

export const formSchema = z.object({
  age: z.number().min(18).max(80),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(30).max(200),
  height: z.number().min(120).max(250),
  bodyType: z.enum(['endomorph', 'mesomorph', 'ectomorph']),
  carbCoeff: z.number().min(2.0).max(8.0),
  proteinCoeff: z.number().min(0.8).max(2.5),
  fatCoeff: z.number().min(0.5).max(1.5),
  cycleDays: z.number().min(3).max(7),
  // Carb distribution percentages for each day type (0-100)
  highCarbPercent: z.number().min(0).max(100),
  midCarbPercent: z.number().min(0).max(100),
  lowCarbPercent: z.number().min(0).max(100),
  // Fat distribution percentages for each day type (0-100)
  highFatPercent: z.number().min(0).max(100),
  midFatPercent: z.number().min(0).max(100),
  lowFatPercent: z.number().min(0).max(100),
});

export type FormData = z.infer<typeof formSchema>;
