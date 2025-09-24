import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  CycleMealPlan,
  CycleTrainingConfig,
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
  PersistentAppState,
  UserSettings,
} from './persistence-types';
import {
  defaultPersistentAppState,
  defaultUserSettings,
  createDefaultCycleTrainingConfig,
  createDefaultCycleMealPlan,
  STORAGE_KEYS,
} from './persistence-types';
import {
  mergeFoodLibrary,
  normalizeCycleMealPlan,
  normalizeDayMealPlan,
} from './meal-planner';
import { createId } from './utils';
import type { FormData } from './form-context';

/**
 * Main hook for managing all app persistence
 * Provides a clean interface for components to save/load data
 */
export function useAppPersistence() {
  // Main app state storage
  const [appState, setAppState, removeAppState] =
    useLocalStorage<PersistentAppState>(
      STORAGE_KEYS.APP_STATE,
      defaultPersistentAppState
    );

  // Helper function to update app state
  const updateAppState = useCallback(
    (updates: Partial<PersistentAppState>) => {
      setAppState((prevState) => ({
        ...prevState,
        ...updates,
        lastSaved: Date.now(),
      }));
    },
    [setAppState]
  );

  // Form Data persistence
  const saveFormData = useCallback(
    (formData: Partial<FormData>) => {
      updateAppState({
        formData: {
          ...appState.formData,
          ...formData,
        },
      });
    },
    [appState.formData, updateAppState]
  );

  const getFormData = useCallback((): Partial<FormData> => {
    return appState.formData;
  }, [appState.formData]);

  // User Settings persistence
  const saveUserSettings = useCallback(
    (settings: Partial<UserSettings>) => {
      updateAppState({
        userSettings: {
          ...appState.userSettings,
          ...settings,
        },
      });
    },
    [appState.userSettings, updateAppState]
  );

  const getUserSettings = useCallback((): UserSettings => {
    return { ...defaultUserSettings, ...appState.userSettings };
  }, [appState.userSettings]);

  // Training Configuration persistence
  const saveTrainingConfig = useCallback(
    (cycleDays: number, config: Partial<CycleTrainingConfig>) => {
      const currentConfig =
        appState.trainingConfigs[cycleDays] ||
        createDefaultCycleTrainingConfig(cycleDays);

      updateAppState({
        trainingConfigs: {
          ...appState.trainingConfigs,
          [cycleDays]: {
            ...currentConfig,
            ...config,
            lastUpdated: Date.now(),
          },
        },
      });
    },
    [appState.trainingConfigs, updateAppState]
  );

  const getTrainingConfig = useCallback(
    (cycleDays: number): CycleTrainingConfig => {
      const stored =
        appState.trainingConfigs[cycleDays] ||
        createDefaultCycleTrainingConfig(cycleDays);

      // Normalize to 1-based day numbers and valid range
      const expectedDays = Array.from({ length: cycleDays }, (_, i) => i + 1);

      // Normalize dayOrder
      let normalizedDayOrder = stored.dayOrder;
      const hasValidOrder =
        Array.isArray(normalizedDayOrder) &&
        normalizedDayOrder.length === expectedDays.length &&
        normalizedDayOrder.every((d) => expectedDays.includes(d));
      if (!hasValidOrder) {
        normalizedDayOrder = expectedDays;
      }

      // Normalize dailyWorkouts (migrate 0-based keys -> 1-based)
      const workoutKeys = Object.keys(stored.dailyWorkouts || {});
      const hasZeroKey = workoutKeys.some((k) => parseInt(k, 10) === 0);
      let normalizedDailyWorkouts = stored.dailyWorkouts || {};
      if (hasZeroKey) {
        normalizedDailyWorkouts = {};
        for (const k of workoutKeys) {
          const idx = parseInt(k, 10);
          if (Number.isFinite(idx)) {
            const newKey = idx + 1; // shift to 1-based
            if (expectedDays.includes(newKey)) {
              normalizedDailyWorkouts[newKey] = stored.dailyWorkouts[idx];
            }
          }
        }
      }

      const normalized: CycleTrainingConfig = {
        ...stored,
        dayOrder: normalizedDayOrder,
        dailyWorkouts: normalizedDailyWorkouts,
      };

      return normalized;
    },
    [appState.trainingConfigs]
  );

  const saveTrainingWorkouts = useCallback(
    (cycleDays: number, dailyWorkouts: Record<number, string>) => {
      saveTrainingConfig(cycleDays, { dailyWorkouts });
    },
    [saveTrainingConfig]
  );

  const saveTrainingOrder = useCallback(
    (cycleDays: number, dayOrder: number[]) => {
      saveTrainingConfig(cycleDays, { dayOrder });
    },
    [saveTrainingConfig]
  );

  // Food library persistence
  const getCustomFoods = useCallback((): Record<string, FoodItem> => {
    return appState.customFoods || {};
  }, [appState.customFoods]);

  const addCustomFood = useCallback(
    (
      food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
    ): FoodItem => {
      const timestamp = Date.now();
      const id = createId('food');
      const newFood: FoodItem = {
        ...food,
        id,
        isCustom: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const currentFoods = appState.customFoods || {};

      updateAppState({
        customFoods: {
          ...currentFoods,
          [id]: newFood,
        },
      });

      return newFood;
    },
    [appState.customFoods, updateAppState]
  );

  const updateCustomFood = useCallback(
    (
      id: string,
      updates: Partial<Omit<FoodItem, 'id' | 'isCustom'>>
    ): FoodItem | null => {
      const currentFoods = appState.customFoods || {};
      const existing = currentFoods[id];
      if (!existing) return null;

      const updated: FoodItem = {
        ...existing,
        ...updates,
        isCustom: true,
        updatedAt: Date.now(),
      };

      updateAppState({
        customFoods: {
          ...currentFoods,
          [id]: updated,
        },
      });

      return updated;
    },
    [appState.customFoods, updateAppState]
  );

  const removeCustomFood = useCallback(
    (id: string) => {
      const currentFoods = appState.customFoods || {};
      if (!currentFoods[id]) return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = currentFoods;

      // Also remove any meal portions referencing the deleted food
      const updatedMealPlans: Record<number, CycleMealPlan> = {};
      const storedMealPlans = appState.mealPlans || {};
      for (const [cycleKey, plan] of Object.entries(storedMealPlans)) {
        const cycleDays = Number(cycleKey);
        const normalizedDayMeals = normalizeCycleMealPlan(cycleDays, plan);

        let hasChanges = false;
        const cleanedDayMeals: Record<number, DayMealPlan> = {};

        for (const [dayKey, dayPlan] of Object.entries(normalizedDayMeals)) {
          const planDay = Number(dayKey);
          const cleanedDayPlan = normalizeDayMealPlan(dayPlan);

          for (const slot of Object.keys(cleanedDayPlan) as MealSlotId[]) {
            const filteredPortions = cleanedDayPlan[slot].filter(
              (portion) => portion.foodId !== id
            );
            if (filteredPortions.length !== cleanedDayPlan[slot].length) {
              hasChanges = true;
            }
            cleanedDayPlan[slot] = filteredPortions;
          }

          cleanedDayMeals[planDay] = cleanedDayPlan;
        }

        if (hasChanges) {
          updatedMealPlans[cycleDays] = {
            dayMeals: cleanedDayMeals,
            lastUpdated: Date.now(),
          };
        }
      }

      updateAppState({
        customFoods: rest,
        mealPlans: {
          ...storedMealPlans,
          ...updatedMealPlans,
        },
      });
    },
    [appState.customFoods, appState.mealPlans, updateAppState]
  );

  const getFoodLibrary = useCallback((): FoodItem[] => {
    return mergeFoodLibrary(appState.customFoods || {});
  }, [appState.customFoods]);

  // Meal plan persistence
  const getMealPlan = useCallback(
    (cycleDays: number): CycleMealPlan => {
      const storedPlan = appState.mealPlans?.[cycleDays];

      if (!storedPlan) {
        return createDefaultCycleMealPlan(cycleDays);
      }

      return {
        dayMeals: normalizeCycleMealPlan(cycleDays, storedPlan),
        lastUpdated: storedPlan.lastUpdated,
      };
    },
    [appState.mealPlans]
  );

  const setMealPlanForDay = useCallback(
    (cycleDays: number, day: number, dayPlan: DayMealPlan) => {
      const current =
        appState.mealPlans?.[cycleDays] ||
        createDefaultCycleMealPlan(cycleDays);

      const normalizedDayMeals = normalizeCycleMealPlan(cycleDays, current);
      normalizedDayMeals[day] = normalizeDayMealPlan(dayPlan);

      updateAppState({
        mealPlans: {
          ...(appState.mealPlans || {}),
          [cycleDays]: {
            dayMeals: normalizedDayMeals,
            lastUpdated: Date.now(),
          },
        },
      });
    },
    [appState.mealPlans, updateAppState]
  );

  const setMealPortionsForSlot = useCallback(
    (
      cycleDays: number,
      day: number,
      slotId: MealSlotId,
      portions: MealPortion[]
    ) => {
      const current =
        appState.mealPlans?.[cycleDays] ||
        createDefaultCycleMealPlan(cycleDays);
      const normalizedDayMeals = normalizeCycleMealPlan(cycleDays, current);
      const normalizedDayPlan = normalizeDayMealPlan(normalizedDayMeals[day]);
      normalizedDayPlan[slotId] = portions;
      normalizedDayMeals[day] = normalizedDayPlan;

      updateAppState({
        mealPlans: {
          ...(appState.mealPlans || {}),
          [cycleDays]: {
            dayMeals: normalizedDayMeals,
            lastUpdated: Date.now(),
          },
        },
      });
    },
    [appState.mealPlans, updateAppState]
  );

  const resetMealPlan = useCallback(
    (cycleDays: number) => {
      updateAppState({
        mealPlans: {
          ...(appState.mealPlans || {}),
          [cycleDays]: createDefaultCycleMealPlan(cycleDays),
        },
      });
    },
    [appState.mealPlans, updateAppState]
  );

  // Utility functions
  const clearAllData = useCallback(() => {
    removeAppState();
  }, [removeAppState]);

  const exportData = useCallback(() => {
    return JSON.stringify(appState, null, 2);
  }, [appState]);

  const importData = useCallback(
    (jsonData: string) => {
      try {
        const importedState = JSON.parse(jsonData) as PersistentAppState;

        // Validate the imported data structure
        if (typeof importedState === 'object' && importedState !== null) {
          setAppState({
            ...defaultPersistentAppState,
            ...importedState,
            lastSaved: Date.now(),
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    [setAppState]
  );

  const getDataSize = useCallback(() => {
    const dataString = JSON.stringify(appState);
    return new Blob([dataString]).size;
  }, [appState]);

  return {
    // State
    appState,

    // Form data methods
    saveFormData,
    getFormData,

    // User settings methods
    saveUserSettings,
    getUserSettings,

    // Training configuration methods
    saveTrainingConfig,
    getTrainingConfig,
    saveTrainingWorkouts,
    saveTrainingOrder,

    // Food library methods
    getFoodLibrary,
    getCustomFoods,
    addCustomFood,
    updateCustomFood,
    removeCustomFood,

    // Meal plan methods
    getMealPlan,
    setMealPlanForDay,
    setMealPortionsForSlot,
    resetMealPlan,

    // Utility methods
    clearAllData,
    exportData,
    importData,
    getDataSize,

    // Direct state update for advanced use cases
    updateAppState,
  };
}
