import { createContext, useContext, type ReactNode } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

export const formSchema = z.object({
  age: z.number().min(18).max(80),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(30).max(200),
  height: z.number().min(120).max(250),
  activityFactor: z.enum([
    'sedentary',
    'light',
    'moderate',
    'active',
    'very_active',
  ]),
  bodyType: z.enum(['endomorph', 'mesomorph', 'ectomorph']),
  proteinLevel: z.enum(['beginner', 'experienced', 'custom']),
  customProtein: z.number().min(0.8).max(2.0).optional(),
  cycleDays: z.number().min(3).max(7),
});

export type FormData = z.infer<typeof formSchema>;

interface FormContextType {
  form: UseFormReturn<FormData> | null;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({
  children,
  form,
  unitSystem,
  setUnitSystem,
}: {
  children: ReactNode;
  form: UseFormReturn<FormData>;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
}) {
  return (
    <FormContext.Provider value={{ form, unitSystem, setUnitSystem }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
