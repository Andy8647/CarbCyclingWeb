import type { UseFormReturn } from 'react-hook-form';

export interface FormData {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyType: 'endomorph' | 'mesomorph' | 'ectomorph';
  carbCoeff: number;
  proteinCoeff: number;
  fatCoeff: number;
  cycleDays: number;
  activityFactor: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

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
