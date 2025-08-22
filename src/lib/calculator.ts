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
  proteinLevel: ProteinLevel;
  customProtein?: number; // g/kg, only if proteinLevel is 'custom'
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

// Nutrition coefficients from PRD
const NUTRITION_COEFFICIENTS: Record<BodyType, { carbs: number; fat: number }> =
  {
    endomorph: { carbs: 2.0, fat: 1.0 },
    mesomorph: { carbs: 2.5, fat: 0.9 },
    ectomorph: { carbs: 3.0, fat: 1.1 },
  };

// Protein coefficients
const PROTEIN_COEFFICIENTS: Record<ProteinLevel, number> = {
  beginner: 0.8,
  experienced: 1.5,
  custom: 0, // Will be overridden by customProtein
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

export function calculateNutritionPlan(input: UserInput): NutritionPlan {
  // Get coefficients for body type
  const coefficients = NUTRITION_COEFFICIENTS[input.bodyType];

  // Calculate protein coefficient
  const proteinCoeff =
    input.proteinLevel === 'custom'
      ? input.customProtein || 0.8
      : PROTEIN_COEFFICIENTS[input.proteinLevel];

  // Calculate daily base amounts
  const dailyBaseCarbs = input.weight * coefficients.carbs;
  const dailyBaseFat = input.weight * coefficients.fat;
  const dailyProtein = input.weight * proteinCoeff;

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
