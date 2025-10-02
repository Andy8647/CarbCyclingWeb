import type { UseFormReturn } from 'react-hook-form';
import type { FormData } from '@/lib/form-schema';

export interface BasicInfoSectionProps {
  form: UseFormReturn<FormData>;
  unitSystem: 'metric' | 'imperial';
  watchedValues: FormData;
}

export interface NutritionSectionProps {
  form: UseFormReturn<FormData>;
  watchedValues: FormData;
}

export interface ActivitySectionProps {
  form: UseFormReturn<FormData>;
  watchedValues: FormData;
}
