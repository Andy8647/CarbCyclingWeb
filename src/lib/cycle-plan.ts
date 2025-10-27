import type { TDEEProfile } from './tdee';
import { calculateTDEE } from './tdee';

export type DayType = 'low' | 'high';

export interface MacroCoefficients {
  carbsGPerKg: number;
  proteinGPerKg: number;
  fatGPerKg: number;
}

export interface CycleMacroConfig {
  low: MacroCoefficients;
  high: MacroCoefficients;
}

export interface CycleConfig {
  cycleDays: number;
  pattern: DayType[]; // e.g., ['low','low','low','high'] length equals cycleDays
}

export interface PlanDay {
  index: number; // 1-based
  type: DayType;
  carbsG: number;
  proteinG: number;
  fatG: number;
  calories: number; // kcal
  deltaVsTDEE: number; // calories - TDEE (negative=deficit, positive=surplus)
  deltaPct: number; // percentage vs TDEE (rounded integer)
}

export interface CyclePlan {
  days: PlanDay[];
  tdee: number;
}

export function gramsFromCoeff(
  weightKg: number,
  coeff: MacroCoefficients
): Pick<PlanDay, 'carbsG' | 'proteinG' | 'fatG'> {
  return {
    carbsG: Math.round(weightKg * coeff.carbsGPerKg),
    proteinG: Math.round(weightKg * coeff.proteinGPerKg),
    fatG: Math.round(weightKg * coeff.fatGPerKg),
  };
}

export function caloriesFromMacros(g: {
  carbsG: number;
  proteinG: number;
  fatG: number;
}): number {
  return Math.round(g.carbsG * 4 + g.proteinG * 4 + g.fatG * 9);
}

export function generateCyclePlan(
  profile: TDEEProfile,
  cycleConfig: CycleConfig,
  coeffs: CycleMacroConfig
): CyclePlan {
  const tdee = calculateTDEE(profile);

  const days: PlanDay[] = cycleConfig.pattern.map((type, idx) => {
    const g = gramsFromCoeff(profile.weightKg, coeffs[type]);
    const calories = caloriesFromMacros(g);
    const deltaVsTDEE = calories - tdee;
    const deltaPct =
      tdee > 0 ? Math.round(((calories - tdee) / tdee) * 100) : 0;

    return {
      index: idx + 1,
      type,
      ...g,
      calories,
      deltaVsTDEE,
      deltaPct,
    };
  });

  return { days, tdee };
}
