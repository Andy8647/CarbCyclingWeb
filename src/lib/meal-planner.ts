import {
  type CustomFoodMap,
  type DayMealPlan,
  type FoodItem,
  type MacroProfile,
  type MealPortion,
  type MealSlotId,
  MEAL_SLOT_DEFINITIONS,
  MEAL_SLOT_IDS,
  createEmptyDayMealPlan,
} from './persistence-types';
import { createId } from './utils';

/**
 * Built-in food options with approximate nutrition per default serving
 */
export const BUILTIN_FOODS: FoodItem[] = [
  {
    id: 'builtin_chicken_breast',
    name: 'Chicken Breast',
    category: 'Protein',
    defaultServing: '100 g cooked',
    macros: { carbs: 0, protein: 31, fat: 3.6, calories: 165 },
    preparation: 'cooked',
    emoji: '🍗',
  },
  {
    id: 'builtin_salmon',
    name: 'Salmon Fillet',
    category: 'Protein',
    defaultServing: '100 g cooked',
    macros: { carbs: 0, protein: 20, fat: 13, calories: 208 },
    preparation: 'cooked',
    emoji: '🐟',
  },
  {
    id: 'builtin_whey',
    name: 'Whey Protein',
    category: 'Supplement',
    defaultServing: '1 scoop (30 g)',
    macros: { carbs: 3, protein: 24, fat: 1, calories: 120 },
    preparation: 'raw',
    emoji: '🥤',
  },
  {
    id: 'builtin_egg',
    name: 'Whole Eggs',
    category: 'Protein',
    defaultServing: '2 large eggs',
    macros: { carbs: 1.2, protein: 12.6, fat: 10.6, calories: 155 },
    preparation: 'raw',
    emoji: '🥚',
  },
  {
    id: 'builtin_brown_rice',
    name: 'Brown Rice',
    category: 'Carb',
    defaultServing: '1 cup cooked',
    macros: { carbs: 45, protein: 5, fat: 1.8, calories: 218 },
    preparation: 'cooked',
    emoji: '🍚',
  },
  {
    id: 'builtin_sweet_potato',
    name: 'Sweet Potato',
    category: 'Carb',
    defaultServing: '150 g baked',
    macros: { carbs: 34, protein: 2.5, fat: 0.1, calories: 145 },
    preparation: 'cooked',
    emoji: '🍠',
  },
  {
    id: 'builtin_banana',
    name: 'Banana',
    category: 'Carb',
    defaultServing: '1 medium',
    macros: { carbs: 27, protein: 1.3, fat: 0.3, calories: 105 },
    preparation: 'raw',
    emoji: '🍌',
  },
  {
    id: 'builtin_avocado',
    name: 'Avocado',
    category: 'Fat',
    defaultServing: '1/2 medium',
    macros: { carbs: 9, protein: 2, fat: 15, calories: 160 },
    preparation: 'raw',
    emoji: '🥑',
  },
  {
    id: 'builtin_almonds',
    name: 'Almonds',
    category: 'Fat',
    defaultServing: '28 g (handful)',
    macros: { carbs: 6, protein: 6, fat: 14, calories: 164 },
    preparation: 'raw',
    emoji: '🥜',
  },
  {
    id: 'builtin_greek_yogurt',
    name: 'Greek Yogurt',
    category: 'Protein',
    defaultServing: '170 g (1 cup)',
    macros: { carbs: 8, protein: 17, fat: 0, calories: 100 },
    preparation: 'raw',
    emoji: '🥛',
  },
];

/**
 * Create a lookup map for quick access by ID
 */
export function buildFoodLookup(foods: FoodItem[]): Record<string, FoodItem> {
  return foods.reduce<Record<string, FoodItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

/**
 * Combine built-in foods with custom foods from persistence
 */
export function mergeFoodLibrary(
  customFoods?: CustomFoodMap | null
): FoodItem[] {
  const customList = Object.values(customFoods ?? {}).map((food) => ({
    ...food,
    isCustom: true,
  }));

  const allFoods = [...BUILTIN_FOODS, ...customList];

  return allFoods.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Ensure a day meal plan contains every slot defined in the app
 */
export function normalizeDayMealPlan(plan?: Partial<DayMealPlan>): DayMealPlan {
  const base = createEmptyDayMealPlan();
  if (!plan) return base;

  const normalized: DayMealPlan = { ...base };
  for (const slot of MEAL_SLOT_IDS) {
    normalized[slot] = plan[slot]?.map((portion) => ({ ...portion })) || [];
  }
  return normalized;
}

/**
 * Ensure a cycle meal plan has every day (1..cycleDays) present
 */
export function normalizeCycleMealPlan(
  cycleDays: number,
  cyclePlan: { dayMeals?: Record<number, DayMealPlan> } | undefined
): Record<number, DayMealPlan> {
  const normalized: Record<number, DayMealPlan> = {};
  for (let day = 1; day <= cycleDays; day += 1) {
    normalized[day] = normalizeDayMealPlan(cyclePlan?.dayMeals?.[day]);
  }
  return normalized;
}

/**
 * Create a new meal portion referencing a food item
 */
export function createMealPortion(
  foodId: string,
  servings = 1,
  note?: string
): MealPortion {
  return {
    id: createId('portion'),
    foodId,
    servings,
    note,
  };
}

/**
 * Calculate macros for a portion of a given food
 */
export function calculatePortionMacros(
  food: FoodItem,
  servings: number
): MacroProfile {
  const multiplier = Math.max(servings, 0);
  return {
    carbs: Math.round(food.macros.carbs * multiplier * 10) / 10,
    protein: Math.round(food.macros.protein * multiplier * 10) / 10,
    fat: Math.round(food.macros.fat * multiplier * 10) / 10,
    calories: Math.round(food.macros.calories * multiplier),
  };
}

/**
 * Aggregate macros for a list of meal portions
 */
export function calculateSlotTotals(
  portions: MealPortion[],
  foodLookup: Record<string, FoodItem>
): MacroProfile {
  return portions.reduce<MacroProfile>(
    (totals, portion) => {
      const food = foodLookup[portion.foodId];
      if (!food) return totals;

      const macros = calculatePortionMacros(food, portion.servings);

      return {
        carbs: Math.round((totals.carbs + macros.carbs) * 10) / 10,
        protein: Math.round((totals.protein + macros.protein) * 10) / 10,
        fat: Math.round((totals.fat + macros.fat) * 10) / 10,
        calories: totals.calories + macros.calories,
      };
    },
    { carbs: 0, protein: 0, fat: 0, calories: 0 }
  );
}

/**
 * Calculate totals for an entire day across all slots
 */
export function calculateDayTotals(
  dayPlan: DayMealPlan,
  foodLookup: Record<string, FoodItem>
): MacroProfile {
  return MEAL_SLOT_IDS.reduce<MacroProfile>((totals, slotId) => {
    const slotTotals = calculateSlotTotals(dayPlan[slotId], foodLookup);
    return {
      carbs: Math.round((totals.carbs + slotTotals.carbs) * 10) / 10,
      protein: Math.round((totals.protein + slotTotals.protein) * 10) / 10,
      fat: Math.round((totals.fat + slotTotals.fat) * 10) / 10,
      calories: totals.calories + slotTotals.calories,
    };
  }, { carbs: 0, protein: 0, fat: 0, calories: 0 });
}

export type MealSlotDefinition = (typeof MEAL_SLOT_DEFINITIONS)[number];

export function getMealSlotDefinition(slotId: MealSlotId): MealSlotDefinition {
  return (
    MEAL_SLOT_DEFINITIONS.find((slot) => slot.id === slotId) ||
    MEAL_SLOT_DEFINITIONS[0]
  );
}
