export type Sex = 'male' | 'female';

export interface TDEEProfile {
  sex: Sex;
  age: number; // years
  heightCm: number; // cm
  weightKg: number; // kg
  activityFactor: number; // e.g., 1.2, 1.375, 1.55, 1.725, 1.9
}

export function calculateBMR({
  sex,
  age,
  heightCm,
  weightKg,
}: Pick<TDEEProfile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function calculateTDEE(profile: TDEEProfile): number {
  const bmr = calculateBMR(profile);
  const af = profile.activityFactor;
  return Math.round(bmr * af);
}
