export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type DayType = 'high' | 'medium' | 'low';
export type ProteinLevel = 'beginner' | 'experienced' | 'custom';
export type Gender = 'male' | 'female';

export interface UserInput {
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  bodyType: BodyType;
  carbCoeff: number; // g/kg
  proteinCoeff: number; // g/kg
  fatCoeff: number; // g/kg
  cycleDays: number; // 3-7 days
  // Carb/Fat distribution percentages (0-100)
  highCarbPercent: number;
  midCarbPercent: number;
  lowCarbPercent: number;
  highFatPercent: number;
  midFatPercent: number;
  lowFatPercent: number;
}

export interface DayPlan {
  day: number;
  type: DayType;
  carbs: number; // grams
  fat: number; // grams
  protein: number; // grams
  calories: number; // kCal
  workout?: string; // workout type
}

export interface WeeklySummary {
  totalCarbs: number;
  totalFat: number;
  dailyProtein: number;
}

export interface NutritionPlan {
  summary: WeeklySummary;
  dailyPlans: DayPlan[];
}

// Default cycle distribution percentages (can be overridden by user)
export const DEFAULT_DISTRIBUTION = {
  high: { carbs: 50, fat: 15 },
  medium: { carbs: 35, fat: 35 },
  low: { carbs: 15, fat: 50 },
};

// Day allocation based on cycle length
const DAY_ALLOCATION: Record<
  number,
  { high: number; medium: number; low: number }
> = {
  3: { high: 1, medium: 1, low: 1 },
  4: { high: 1, medium: 2, low: 1 },
  5: { high: 1, medium: 2, low: 2 },
  6: { high: 2, medium: 2, low: 2 },
  7: { high: 2, medium: 3, low: 2 },
};

// Calories per gram
const CALORIES_PER_GRAM = {
  carbs: 4,
  fat: 9,
  protein: 4,
};

export function calculateNutritionPlan(input: UserInput): NutritionPlan {
  // Calculate daily base amounts using user's coefficients
  const dailyBaseCarbs = input.weight * input.carbCoeff;
  const dailyBaseFat = input.weight * input.fatCoeff;
  const dailyProtein = input.weight * input.proteinCoeff;

  // Calculate weekly totals (for carbs and fat only)
  const weeklyCarbs = dailyBaseCarbs * input.cycleDays;
  const weeklyFat = dailyBaseFat * input.cycleDays;

  // Get day allocation for the cycle length
  const allocation = DAY_ALLOCATION[input.cycleDays];

  // Convert user percentages to decimals
  const highCarbRatio = input.highCarbPercent / 100;
  const midCarbRatio = input.midCarbPercent / 100;
  const lowCarbRatio = input.lowCarbPercent / 100;
  const highFatRatio = input.highFatPercent / 100;
  const midFatRatio = input.midFatPercent / 100;
  const lowFatRatio = input.lowFatPercent / 100;

  // Calculate amounts per day type using user's distribution
  const highCarbsPerDay = (weeklyCarbs * highCarbRatio) / allocation.high;
  const mediumCarbsPerDay = (weeklyCarbs * midCarbRatio) / allocation.medium;
  const lowCarbsPerDay = (weeklyCarbs * lowCarbRatio) / allocation.low;

  const highFatPerDay = (weeklyFat * highFatRatio) / allocation.high;
  const mediumFatPerDay = (weeklyFat * midFatRatio) / allocation.medium;
  const lowFatPerDay = (weeklyFat * lowFatRatio) / allocation.low;

  // Create daily plans
  const dailyPlans: DayPlan[] = [];
  let dayCounter = 1;

  // Add high carb days
  for (let i = 0; i < allocation.high; i++) {
    const carbs = Math.round(highCarbsPerDay);
    const fat = Math.round(highFatPerDay);
    const protein = Math.round(dailyProtein);
    const calories = Math.round(
      carbs * CALORIES_PER_GRAM.carbs +
        fat * CALORIES_PER_GRAM.fat +
        protein * CALORIES_PER_GRAM.protein
    );

    dailyPlans.push({
      day: dayCounter++,
      type: 'high',
      carbs,
      fat,
      protein,
      calories,
    });
  }

  // Add medium carb days
  for (let i = 0; i < allocation.medium; i++) {
    const carbs = Math.round(mediumCarbsPerDay);
    const fat = Math.round(mediumFatPerDay);
    const protein = Math.round(dailyProtein);
    const calories = Math.round(
      carbs * CALORIES_PER_GRAM.carbs +
        fat * CALORIES_PER_GRAM.fat +
        protein * CALORIES_PER_GRAM.protein
    );

    dailyPlans.push({
      day: dayCounter++,
      type: 'medium',
      carbs,
      fat,
      protein,
      calories,
    });
  }

  // Add low carb days
  for (let i = 0; i < allocation.low; i++) {
    const carbs = Math.round(lowCarbsPerDay);
    const fat = Math.round(lowFatPerDay);
    const protein = Math.round(dailyProtein);
    const calories = Math.round(
      carbs * CALORIES_PER_GRAM.carbs +
        fat * CALORIES_PER_GRAM.fat +
        protein * CALORIES_PER_GRAM.protein
    );

    dailyPlans.push({
      day: dayCounter++,
      type: 'low',
      carbs,
      fat,
      protein,
      calories,
    });
  }

  // Calculate summary
  const totalCarbs = Math.round(weeklyCarbs);
  const totalFat = Math.round(weeklyFat);
  return {
    summary: {
      totalCarbs,
      totalFat,
      dailyProtein: Math.round(dailyProtein),
    },
    dailyPlans,
  };
}

// Utility function for unit conversion
export function convertWeight(
  weight: number,
  fromUnit: 'kg' | 'lb',
  toUnit: 'kg' | 'lb'
): number {
  if (fromUnit === toUnit) return weight;

  if (fromUnit === 'lb' && toUnit === 'kg') {
    return weight / 2.20462;
  } else if (fromUnit === 'kg' && toUnit === 'lb') {
    return weight * 2.20462;
  }

  return weight;
}

// Workout types with emojis
export const WORKOUT_TYPES = [
  { value: 'chest', emoji: '💪' },
  { value: 'back', emoji: '🏋️' },
  { value: 'legs', emoji: '🦵' },
  { value: 'shoulders', emoji: '🙌' },
  { value: 'arms', emoji: '💪' },
  { value: 'abs', emoji: '🔥' },
  { value: 'full_body', emoji: '🏃' },
  { value: 'cardio', emoji: '❤️' },
  { value: 'rest', emoji: '😴' },
];

export function getWorkoutTypes(t: (key: string) => string) {
  return WORKOUT_TYPES.map((workout) => ({
    ...workout,
    label: t(`workouts.${workout.value}`),
  }));
}

export function getWorkoutDisplay(
  workoutType?: string,
  t?: (key: string) => string
): string {
  if (!workoutType)
    return t ? `🎯 ${t('results.selectWorkout')}` : '🎯 选择训练';
  const workout = WORKOUT_TYPES.find((w) => w.value === workoutType);
  if (workout && t) {
    return `${workout.emoji} ${t(`workouts.${workout.value}`)}`;
  }
  return workout ? `${workout.emoji} ${workout.value}` : workoutType;
}

// Validation helpers
export function validateWeight(weight: number, unit: 'kg' | 'lb'): boolean {
  if (unit === 'kg') {
    return weight >= 30 && weight <= 200;
  } else {
    return weight >= 66 && weight <= 440;
  }
}

export function validateProteinCoeff(coeff: number): boolean {
  return coeff >= 0.8 && coeff <= 2.0;
}
