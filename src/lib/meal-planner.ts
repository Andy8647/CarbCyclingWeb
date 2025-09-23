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
    nameKey: 'mealPlanner.foods.chickenBreast.name',
    category: 'Protein',
    categoryKey: 'mealPlanner.categories.protein',
    defaultServing: '100 g cooked',
    defaultServingKey: 'mealPlanner.foods.chickenBreast.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 0, protein: 31, fat: 3.6, calories: 165 },
    preparation: 'cooked',
    emoji: '🍗',
  },
  {
    id: 'builtin_salmon',
    name: 'Salmon Fillet',
    nameKey: 'mealPlanner.foods.salmon.name',
    category: 'Protein',
    categoryKey: 'mealPlanner.categories.protein',
    defaultServing: '100 g cooked',
    defaultServingKey: 'mealPlanner.foods.salmon.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 0, protein: 20, fat: 13, calories: 208 },
    preparation: 'cooked',
    emoji: '🐟',
  },
  {
    id: 'builtin_whey',
    name: 'Whey Protein',
    nameKey: 'mealPlanner.foods.whey.name',
    category: 'Supplement',
    categoryKey: 'mealPlanner.categories.supplement',
    defaultServing: '1 scoop (30 g)',
    defaultServingKey: 'mealPlanner.foods.whey.serving',
    servingUnit: 'per_piece',
    macros: { carbs: 3, protein: 24, fat: 1, calories: 120 },
    preparation: 'raw',
    emoji: '🥤',
  },
  {
    id: 'builtin_egg',
    name: 'Whole Eggs',
    nameKey: 'mealPlanner.foods.egg.name',
    category: 'Protein',
    categoryKey: 'mealPlanner.categories.protein',
    defaultServing: '1 large egg',
    defaultServingKey: 'mealPlanner.foods.egg.serving',
    servingUnit: 'per_piece',
    macros: { carbs: 0.6, protein: 6.3, fat: 5.3, calories: 78 },
    preparation: 'raw',
    emoji: '🥚',
  },
  {
    id: 'builtin_brown_rice',
    name: 'Brown Rice',
    nameKey: 'mealPlanner.foods.brownRice.name',
    category: 'Carb',
    categoryKey: 'mealPlanner.categories.carb',
    defaultServing: '100 g cooked',
    defaultServingKey: 'mealPlanner.foods.brownRice.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 23, protein: 2.7, fat: 1, calories: 112 },
    preparation: 'cooked',
    emoji: '🍚',
  },
  {
    id: 'builtin_sweet_potato',
    name: 'Sweet Potato',
    nameKey: 'mealPlanner.foods.sweetPotato.name',
    category: 'Carb',
    categoryKey: 'mealPlanner.categories.carb',
    defaultServing: '100 g baked',
    defaultServingKey: 'mealPlanner.foods.sweetPotato.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 20, protein: 1.6, fat: 0.1, calories: 90 },
    preparation: 'cooked',
    emoji: '🍠',
  },
  {
    id: 'builtin_banana',
    name: 'Banana',
    nameKey: 'mealPlanner.foods.banana.name',
    category: 'Carb',
    categoryKey: 'mealPlanner.categories.carb',
    defaultServing: '1 medium',
    defaultServingKey: 'mealPlanner.foods.banana.serving',
    servingUnit: 'per_piece',
    macros: { carbs: 27, protein: 1.3, fat: 0.3, calories: 105 },
    preparation: 'raw',
    emoji: '🍌',
  },
  {
    id: 'builtin_avocado',
    name: 'Avocado',
    nameKey: 'mealPlanner.foods.avocado.name',
    category: 'Fat',
    categoryKey: 'mealPlanner.categories.fat',
    defaultServing: '1/2 medium',
    defaultServingKey: 'mealPlanner.foods.avocado.serving',
    servingUnit: 'per_half_piece',
    macros: { carbs: 9, protein: 2, fat: 15, calories: 160 },
    preparation: 'raw',
    emoji: '🥑',
  },
  {
    id: 'builtin_almonds',
    name: 'Almonds',
    nameKey: 'mealPlanner.foods.almonds.name',
    category: 'Fat',
    categoryKey: 'mealPlanner.categories.fat',
    defaultServing: '100 g',
    defaultServingKey: 'mealPlanner.foods.almonds.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 22, protein: 21, fat: 49, calories: 579 },
    preparation: 'raw',
    emoji: '🥜',
  },
  {
    id: 'builtin_greek_yogurt',
    name: 'Greek Yogurt',
    nameKey: 'mealPlanner.foods.greekYogurt.name',
    category: 'Protein',
    categoryKey: 'mealPlanner.categories.protein',
    defaultServing: '100 g',
    defaultServingKey: 'mealPlanner.foods.greekYogurt.serving',
    servingUnit: 'per_100g',
    macros: { carbs: 5, protein: 10, fat: 0, calories: 59 },
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
  return MEAL_SLOT_IDS.reduce<MacroProfile>(
    (totals, slotId) => {
      const slotTotals = calculateSlotTotals(dayPlan[slotId], foodLookup);
      return {
        carbs: Math.round((totals.carbs + slotTotals.carbs) * 10) / 10,
        protein: Math.round((totals.protein + slotTotals.protein) * 10) / 10,
        fat: Math.round((totals.fat + slotTotals.fat) * 10) / 10,
        calories: totals.calories + slotTotals.calories,
      };
    },
    { carbs: 0, protein: 0, fat: 0, calories: 0 }
  );
}

export type MealSlotDefinition = (typeof MEAL_SLOT_DEFINITIONS)[number];

export function getMealSlotDefinition(slotId: MealSlotId): MealSlotDefinition {
  return (
    MEAL_SLOT_DEFINITIONS.find((slot) => slot.id === slotId) ||
    MEAL_SLOT_DEFINITIONS[0]
  );
}
