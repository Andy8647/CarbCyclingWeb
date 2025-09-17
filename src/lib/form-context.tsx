import { createContext, useContext, type ReactNode } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import type {
  CycleMealPlan,
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
} from './persistence-types';

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
  carbCoeff: z.number().min(2.0).max(8.0),
  proteinCoeff: z.number().min(0.8).max(2.5),
  fatCoeff: z.number().min(0.5).max(1.5),
  cycleDays: z.number().min(3).max(7),
});

export type FormData = z.infer<typeof formSchema>;

interface FormContextType {
  form: UseFormReturn<FormData> | null;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  dayOrder: number[];
  setDayOrder: (order: number[]) => void;
  foodLibrary: FoodItem[];
  customFoods: Record<string, FoodItem>;
  addCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  updateCustomFood: (
    id: string,
    updates: Partial<Omit<FoodItem, 'id' | 'isCustom'>>
  ) => FoodItem | null;
  removeCustomFood: (id: string) => void;
  getMealPlan: (cycleDays: number) => CycleMealPlan;
  setMealPlanForDay: (cycleDays: number, day: number, plan: DayMealPlan) => void;
  setMealPortionsForSlot: (
    cycleDays: number,
    day: number,
    slotId: MealSlotId,
    portions: MealPortion[]
  ) => void;
  resetMealPlan: (cycleDays: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({
  children,
  form,
  unitSystem,
  setUnitSystem,
  dailyWorkouts,
  setDailyWorkout,
  dayOrder,
  setDayOrder,
  foodLibrary,
  customFoods,
  addCustomFood,
  updateCustomFood,
  removeCustomFood,
  getMealPlan,
  setMealPlanForDay,
  setMealPortionsForSlot,
  resetMealPlan,
}: {
  children: ReactNode;
  form: UseFormReturn<FormData>;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  dayOrder: number[];
  setDayOrder: (order: number[]) => void;
  foodLibrary: FoodItem[];
  customFoods: Record<string, FoodItem>;
  addCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  updateCustomFood: (
    id: string,
    updates: Partial<Omit<FoodItem, 'id' | 'isCustom'>>
  ) => FoodItem | null;
  removeCustomFood: (id: string) => void;
  getMealPlan: (cycleDays: number) => CycleMealPlan;
  setMealPlanForDay: (cycleDays: number, day: number, plan: DayMealPlan) => void;
  setMealPortionsForSlot: (
    cycleDays: number,
    day: number,
    slotId: MealSlotId,
    portions: MealPortion[]
  ) => void;
  resetMealPlan: (cycleDays: number) => void;
}) {
  return (
    <FormContext.Provider
      value={{
        form,
        unitSystem,
        setUnitSystem,
        dailyWorkouts,
        setDailyWorkout,
        dayOrder,
        setDayOrder,
        foodLibrary,
        customFoods,
        addCustomFood,
        updateCustomFood,
        removeCustomFood,
        getMealPlan,
        setMealPlanForDay,
        setMealPortionsForSlot,
        resetMealPlan,
      }}
    >
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
