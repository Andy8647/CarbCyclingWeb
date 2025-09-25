import { createContext, useContext, type ReactNode } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import type {
  CycleMealPlan,
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
} from './persistence-types';
import type { FormData } from './form-schema';

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
  setMealPlanForDay: (
    cycleDays: number,
    day: number,
    plan: DayMealPlan
  ) => void;
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
  setMealPlanForDay: (
    cycleDays: number,
    day: number,
    plan: DayMealPlan
  ) => void;
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

// eslint-disable-next-line react-refresh/only-export-components
export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
