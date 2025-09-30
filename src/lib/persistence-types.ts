import type { FormData } from './form-schema';

/**
 * Meal planner slot identifiers
 */
export type MealSlotId =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'pre_workout'
  | 'post_workout'
  | 'dinner'
  | 'evening_snack';

/**
 * Nutritional breakdown for a given serving
 */
export interface MacroProfile {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export type ServingUnit = 'per_100g' | 'per_100ml' | 'per_piece';

export const SERVING_UNIT_OPTIONS: ServingUnit[] = [
  'per_100g',
  'per_100ml',
  'per_piece',
];

/**
 * Food category types for food categorization
 */
export type CategoryType =
  | 'protein'
  | 'carb'
  | 'fat'
  | 'vegetable'
  | 'fruit'
  | 'supplement'
  | 'other';

export const CATEGORY_TYPE_OPTIONS: CategoryType[] = [
  'protein',
  'carb',
  'fat',
  'vegetable',
  'fruit',
  'supplement',
  'other',
];

/**
 * Food or ingredient definition used by the meal planner
 */
export interface FoodItem {
  id: string;
  name: string;
  /** Optional translation key for name */
  nameKey?: string;
  category: string;
  /** Optional translation key for category */
  categoryKey?: string;
  defaultServing: string;
  servingUnit?: ServingUnit;
  /** Optional translation key for serving description */
  defaultServingKey?: string;
  macros: MacroProfile;
  preparation?: 'raw' | 'cooked';
  isBuiltin?: boolean;
  isDeleted?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Meal entry referencing a food item with the chosen serving multiplier
 */
export interface MealPortion {
  id: string;
  foodId: string;
  servings: number;
  note?: string;
}

/**
 * Meal plan for a single day keyed by meal slots
 */
export type DayMealPlan = Record<MealSlotId, MealPortion[]>;

/**
 * Stored meal plan for a cycle length
 */
export interface CycleMealPlan {
  dayMeals: Record<number, DayMealPlan>;
  lastUpdated: number;
}

export type CustomFoodMap = Record<string, FoodItem>;
export type MealPlans = Record<number, CycleMealPlan>;

/**
 * User Settings (Header configuration)
 * - Theme preference
 * - Language preference
 * - Unit system preference
 */
export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'zh-CN' | 'en-US';
  unitSystem: 'metric' | 'imperial';
}

/**
 * Training configuration for a specific cycle length
 * Each cycle length (3-7 days) gets its own configuration
 */
export interface CycleTrainingConfig {
  /** Mapping of day index to workout type */
  dailyWorkouts: Record<number, string>;
  /** Order of days for drag & drop sorting */
  dayOrder: number[];
  /** Timestamp when this config was last updated */
  lastUpdated: number;
}

/**
 * All training configurations keyed by cycle length
 * e.g., { 3: {...}, 4: {...}, 5: {...}, 6: {...}, 7: {...} }
 */
export interface TrainingConfigurations {
  [cycleDays: number]: CycleTrainingConfig;
}

/**
 * Complete persistent application state
 */
export interface PersistentAppState {
  /** User form input data */
  formData: Partial<FormData>;
  /** User interface preferences */
  userSettings: UserSettings;
  /** Training configurations for different cycle lengths */
  trainingConfigs: TrainingConfigurations;
  /** User defined foods for the planner */
  customFoods: CustomFoodMap;
  /** Stored meal plans by cycle length */
  mealPlans: MealPlans;
  /** Metadata */
  version: string;
  lastSaved: number;
}

/**
 * Default values for user settings
 */
export const defaultUserSettings: UserSettings = {
  theme: 'system',
  language: 'zh-CN',
  unitSystem: 'metric',
};

/**
 * Default values for cycle training config
 */
export const createDefaultCycleTrainingConfig = (
  cycleDays: number
): CycleTrainingConfig => ({
  dailyWorkouts: {},
  // Day numbers are 1-based to match NutritionPlan.day
  dayOrder: Array.from({ length: cycleDays }, (_, i) => i + 1),
  lastUpdated: Date.now(),
});

/**
 * Meal slot definitions shared by the planner UI
 */
export const MEAL_SLOT_DEFINITIONS: Array<{
  id: MealSlotId;
  icon: string;
  translationKey: string;
}> = [
  {
    id: 'breakfast',
    icon: '🍳',
    translationKey: 'mealPlanner.slots.breakfast',
  },
  {
    id: 'morning_snack',
    icon: '🥜',
    translationKey: 'mealPlanner.slots.morning_snack',
  },
  { id: 'lunch', icon: '🥗', translationKey: 'mealPlanner.slots.lunch' },
  {
    id: 'pre_workout',
    icon: '⚡',
    translationKey: 'mealPlanner.slots.pre_workout',
  },
  {
    id: 'post_workout',
    icon: '💪',
    translationKey: 'mealPlanner.slots.post_workout',
  },
  { id: 'dinner', icon: '🍽️', translationKey: 'mealPlanner.slots.dinner' },
  {
    id: 'evening_snack',
    icon: '🍵',
    translationKey: 'mealPlanner.slots.evening_snack',
  },
];

export const MEAL_SLOT_IDS = MEAL_SLOT_DEFINITIONS.map((slot) => slot.id);

export const createEmptyDayMealPlan = (): DayMealPlan => {
  return MEAL_SLOT_IDS.reduce((acc, slot) => {
    acc[slot] = [];
    return acc;
  }, {} as DayMealPlan);
};

export const createDefaultCycleMealPlan = (
  cycleDays: number
): CycleMealPlan => {
  const dayMeals: Record<number, DayMealPlan> = {};
  for (let day = 1; day <= cycleDays; day += 1) {
    dayMeals[day] = createEmptyDayMealPlan();
  }

  return {
    dayMeals,
    lastUpdated: Date.now(),
  };
};

/**
 * Default values for complete app state
 */
export const defaultPersistentAppState: PersistentAppState = {
  formData: {},
  userSettings: defaultUserSettings,
  trainingConfigs: {},
  customFoods: {},
  mealPlans: {},
  version: '1.0.0',
  lastSaved: Date.now(),
};

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  APP_STATE: 'carb-cycling-app-state',
  USER_SETTINGS: 'carb-cycling-user-settings',
  FORM_DATA: 'carb-cycling-form-data',
  TRAINING_CONFIGS: 'carb-cycling-training-configs',
} as const;
