export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type DayType = 'high' | 'medium' | 'low';
export type ProteinLevel = 'beginner' | 'experienced' | 'custom';
export type Gender = 'male' | 'female';
export type ActivityFactor =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface UserInput {
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  activityFactor: ActivityFactor;
  bodyType: BodyType;
  carbCoeff: number; // g/kg
  proteinCoeff: number; // g/kg
  fatCoeff: number; // g/kg
  cycleDays: number; // 3-7 days
}

export interface MetabolicData {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
}

export interface DayPlan {
  day: number;
  type: DayType;
  carbs: number; // grams
  fat: number; // grams
  protein: number; // grams
  calories: number; // kcal
  caloriesDiff: number; // calories - tdee
  workout?: string; // workout type
}

export interface WeeklySummary {
  totalCarbs: number;
  totalFat: number;
  dailyProtein: number;
  totalCalories: number;
}

export interface NutritionPlan {
  summary: WeeklySummary;
  dailyPlans: DayPlan[];
}

// Activity factor multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityFactor, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Cycle distribution percentages
const CYCLE_DISTRIBUTION = {
  high: { carbs: 0.5, fat: 0.15 },
  medium: { carbs: 0.35, fat: 0.35 },
  low: { carbs: 0.15, fat: 0.5 },
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

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: Gender
): number {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}

// Calculate TDEE from BMR and activity factor
export function calculateTDEE(bmr: number, activityFactor: ActivityFactor): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityFactor];
}

// Calculate metabolic data
export function calculateMetabolicData(input: UserInput): MetabolicData {
  const bmr = calculateBMR(input.weight, input.height, input.age, input.gender);
  const tdee = calculateTDEE(bmr, input.activityFactor);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

export function calculateNutritionPlan(input: UserInput): NutritionPlan {
  // Calculate TDEE for calorie difference
  const metabolicData = calculateMetabolicData(input);
  const tdee = metabolicData.tdee;

  // Calculate daily base amounts using user's coefficients
  const dailyBaseCarbs = input.weight * input.carbCoeff;
  const dailyBaseFat = input.weight * input.fatCoeff;
  const dailyProtein = input.weight * input.proteinCoeff;

  // Calculate weekly totals (for carbs and fat only)
  const weeklyCarbs = dailyBaseCarbs * input.cycleDays;
  const weeklyFat = dailyBaseFat * input.cycleDays;

  // Get day allocation for the cycle length
  const allocation = DAY_ALLOCATION[input.cycleDays];

  // Calculate amounts per day type
  const highCarbsPerDay =
    (weeklyCarbs * CYCLE_DISTRIBUTION.high.carbs) / allocation.high;
  const mediumCarbsPerDay =
    (weeklyCarbs * CYCLE_DISTRIBUTION.medium.carbs) / allocation.medium;
  const lowCarbsPerDay =
    (weeklyCarbs * CYCLE_DISTRIBUTION.low.carbs) / allocation.low;

  const highFatPerDay =
    (weeklyFat * CYCLE_DISTRIBUTION.high.fat) / allocation.high;
  const mediumFatPerDay =
    (weeklyFat * CYCLE_DISTRIBUTION.medium.fat) / allocation.medium;
  const lowFatPerDay =
    (weeklyFat * CYCLE_DISTRIBUTION.low.fat) / allocation.low;

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
    const caloriesDiff = calories - tdee;

    dailyPlans.push({
      day: dayCounter++,
      type: 'high',
      carbs,
      fat,
      protein,
      calories,
      caloriesDiff,
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
    const caloriesDiff = calories - tdee;

    dailyPlans.push({
      day: dayCounter++,
      type: 'medium',
      carbs,
      fat,
      protein,
      calories,
      caloriesDiff,
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
    const caloriesDiff = calories - tdee;

    dailyPlans.push({
      day: dayCounter++,
      type: 'low',
      carbs,
      fat,
      protein,
      calories,
      caloriesDiff,
    });
  }

  // Calculate summary
  const totalCarbs = Math.round(weeklyCarbs);
  const totalFat = Math.round(weeklyFat);
  const totalCalories = dailyPlans.reduce((sum, day) => sum + day.calories, 0);

  return {
    summary: {
      totalCarbs,
      totalFat,
      dailyProtein: Math.round(dailyProtein),
      totalCalories,
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
  { value: 'chest', label: '胸部', emoji: '💪' },
  { value: 'back', label: '背部', emoji: '🏋️' },
  { value: 'legs', label: '腿部', emoji: '🦵' },
  { value: 'shoulders', label: '肩部', emoji: '🙌' },
  { value: 'arms', label: '手臂', emoji: '💪' },
  { value: 'abs', label: '腹部', emoji: '🔥' },
  { value: 'full_body', label: '全身', emoji: '🏃' },
  { value: 'cardio', label: '有氧', emoji: '❤️' },
  { value: 'rest', label: '休息', emoji: '😴' },
];

export function getWorkoutDisplay(workoutType?: string): string {
  if (!workoutType) return '🎯 选择训练';
  const workout = WORKOUT_TYPES.find(w => w.value === workoutType);
  return workout ? `${workout.emoji} ${workout.label}` : workoutType;
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
