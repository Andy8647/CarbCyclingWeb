// Old V1 plan function and related types removed

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

// New exports (V2) - TDEE and cycle plan generator
export { calculateTDEE } from './tdee';
export { generateCyclePlan } from './cycle-plan';
export type { TDEEProfile } from './tdee';
export type {
  DayType as V2DayType,
  MacroCoefficients as V2MacroCoefficients,
  CycleMacroConfig as V2CycleMacroConfig,
  CycleConfig as V2CycleConfig,
  PlanDay as V2PlanDay,
  CyclePlan as V2CyclePlan,
} from './cycle-plan';
