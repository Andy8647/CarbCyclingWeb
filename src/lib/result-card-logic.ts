import { WORKOUT_TYPES } from '@/lib/calculator';
import type { TDEEProfile } from '@/lib/calculator';
import { calculateTDEE } from '@/lib/calculator';

export interface DayData {
  day: number;
  type: string; // 'low' | 'high' | legacy values
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
  // Optional V2 fields
  deltaVsTDEE?: number; // calories - TDEE (negative=deficit, positive=surplus)
  deltaPct?: number; // percentage vs TDEE, rounded integer
}

export interface NutritionPlan {
  dailyPlans: DayData[];
  // Optional V2 metadata
  tdee?: number;
}

export interface DragData {
  type: string;
  day: number;
  dayData: DayData;
}

export const getDayTypeDisplay = (type: string, t: (key: string) => string) => {
  switch (type) {
    case 'high':
      return t('results.dayTypes.high');
    case 'medium':
      return t('results.dayTypes.medium');
    case 'low':
      return t('results.dayTypes.low');
    default:
      return type;
  }
};

export const getWorkoutEmoji = (workoutType: string) => {
  const workout = WORKOUT_TYPES.find((w) => w.value === workoutType);
  return workout?.emoji || '🎯';
};

export const calculateNutritionData = (
  formData: Record<string, unknown> | undefined
): NutritionPlan | null => {
  // Backward-compatible placeholder: compute nothing if form missing
  if (!formData) return null;

  // Legacy: try to read existing daily plans from prior calculator flow, if present in form context output
  // Since we are decoupling here, we attempt to reconstruct minimal dailyPlans from prior fields
  const plans: DayData[] = [];

  const cycleDays = Number(formData.cycleDays ?? 0);
  if (!Number.isFinite(cycleDays) || cycleDays <= 0) return null;

  // Weight and per-day-type coefficients (V2)
  const weight = Number(formData.weight ?? 0);
  // Fallback defaults to avoid empty results if some fields are unset
  const F_LOW = { carb: 1.25, protein: 1.7, fat: 1.1 };
  const F_HIGH = { carb: 4.0, protein: 1.0, fat: 0.7 };

  const lowCarbCoeff =
    Number(formData.lowCarbCoeff ?? F_LOW.carb) || F_LOW.carb;
  const lowProteinCoeff =
    Number(formData.lowProteinCoeff ?? F_LOW.protein) || F_LOW.protein;
  const lowFatCoeff = Number(formData.lowFatCoeff ?? F_LOW.fat) || F_LOW.fat;
  const highCarbCoeff =
    Number(formData.highCarbCoeff ?? F_HIGH.carb) || F_HIGH.carb;
  const highProteinCoeff =
    Number(formData.highProteinCoeff ?? F_HIGH.protein) || F_HIGH.protein;
  const highFatCoeff =
    Number(formData.highFatCoeff ?? F_HIGH.fat) || F_HIGH.fat;

  if (!weight) return null;

  // Build naive plan: use provided high/mid/low counts to set day types
  let highDays = Number(formData.highDays ?? 0);
  let lowDays = Number(formData.lowDays ?? 0);

  // Ensure allocation is valid; if not, infer a default split
  if (highDays + lowDays !== cycleDays || highDays + lowDays === 0) {
    highDays = Math.max(1, Math.round(cycleDays / 4));
    lowDays = Math.max(1, cycleDays - highDays);
  }

  const types: string[] = [];
  for (let i = 0; i < highDays; i++) types.push('high');
  for (let i = 0; i < lowDays; i++) types.push('low');

  // Fallback if counts mismatch
  while (types.length < cycleDays) types.push('low');
  if (types.length > cycleDays) types.length = cycleDays;

  let dayCounter = 1;
  for (const type of types) {
    const c = type === 'high' ? highCarbCoeff : lowCarbCoeff;
    const p = type === 'high' ? highProteinCoeff : lowProteinCoeff;
    const f = type === 'high' ? highFatCoeff : lowFatCoeff;
    const carbs = Math.round(weight * c);
    const protein = Math.round(weight * p);
    const fat = Math.round(weight * f);
    const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
    plans.push({ day: dayCounter++, type, carbs, protein, fat, calories });
  }

  // Optional: compute TDEE if profile exists
  const hasProfile =
    formData.sex &&
    formData.age &&
    formData.heightCm &&
    formData.activityFactor;

  let tdee: number | undefined = undefined;
  if (hasProfile) {
    try {
      const profile = {
        sex: formData.sex as TDEEProfile['sex'],
        age: Number(formData.age),
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weight),
        activityFactor: Number(formData.activityFactor),
      } satisfies TDEEProfile;
      tdee = calculateTDEE(profile);
      plans.forEach((d) => {
        const t = tdee as number;
        d.deltaVsTDEE = Math.round(d.calories - t);
        d.deltaPct = t > 0 ? Math.round(((d.calories - t) / t) * 100) : 0;
      });
    } catch {
      // ignore profile errors silently for now
    }
  }

  return { dailyPlans: plans, tdee };
};

// Removed calculateMetabolicInfo since we no longer calculate TDEE

export const reorderDays = (
  nutritionPlan: NutritionPlan | null,
  dayOrder: number[]
) => {
  if (!nutritionPlan || dayOrder.length === 0)
    return nutritionPlan?.dailyPlans || [];

  return dayOrder
    .map((dayNum) => nutritionPlan.dailyPlans.find((day) => day.day === dayNum))
    .filter(Boolean) as typeof nutritionPlan.dailyPlans;
};

export const generateMarkdown = (
  _nutritionPlan: NutritionPlan,
  orderedDays: DayData[],
  dailyWorkouts: Record<number, string>,
  _macroIcons: Record<string, string>,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  let markdownText = `# ${t('results.carbCyclingPlan')}\n\n`;
  markdownText += `## ${t('results.dailyDetails')}\n\n`;

  const hasDelta = orderedDays.some((d) => typeof d.deltaPct === 'number');

  if (hasDelta) {
    markdownText += `| ${t('results.day')} | ${t('results.dayType')} | ${t('results.workout')} | ${t('results.carbs')}(g) | ${t('results.fat')}(g) | ${t('results.protein')}(g) | ${t('results.totalCaloriesFull')}(kCal) | Δ% |\n`;
    markdownText += `|------|------|---------|---------|---------|---------|-------------|----|\n`;
  } else {
    markdownText += `| ${t('results.day')} | ${t('results.dayType')} | ${t('results.workout')} | ${t('results.carbs')}(g) | ${t('results.fat')}(g) | ${t('results.protein')}(g) | ${t('results.totalCaloriesFull')}(kCal) |\n`;
    markdownText += `|------|------|---------|---------|---------|---------|-------------|\n`;
  }

  orderedDays.forEach((day, index) => {
    const workout = dailyWorkouts[day.day] || '-';
    const workoutEmoji = getWorkoutEmoji(workout);
    const workoutDisplay =
      workout === '-' ? '-' : `${workoutEmoji} ${t(`workouts.${workout}`)}`;

    if (hasDelta) {
      const deltaPct =
        typeof day.deltaPct === 'number'
          ? String(Math.round(day.deltaPct))
          : '-';
      markdownText += `| ${t('results.dayNumber').replace('{{day}}', (index + 1).toString())} | ${getDayTypeDisplay(day.type, t)} | ${workoutDisplay} | ${Math.round(day.carbs)} | ${Math.round(day.fat)} | ${Math.round(day.protein)} | ${Math.round(day.calories)} | ${deltaPct}% |\n`;
    } else {
      markdownText += `| ${t('results.dayNumber').replace('{{day}}', (index + 1).toString())} | ${getDayTypeDisplay(day.type, t)} | ${workoutDisplay} | ${Math.round(day.carbs)} | ${Math.round(day.fat)} | ${Math.round(day.protein)} | ${Math.round(day.calories)} |\n`;
    }
  });

  return markdownText;
};

export const generateCSV = (
  _nutritionPlan: NutritionPlan,
  orderedDays: DayData[],
  dailyWorkouts: Record<number, string>,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const hasDelta = orderedDays.some((d) => typeof d.deltaPct === 'number');

  const header = hasDelta
    ? [
        t('results.day'),
        t('results.dayType'),
        t('results.workout'),
        `${t('results.carbs')}(g)`,
        `${t('results.fat')}(g)`,
        `${t('results.protein')}(g)`,
        `${t('results.totalCaloriesFull')}(kCal)`,
        'Δ%',
      ]
    : [
        t('results.day'),
        t('results.dayType'),
        t('results.workout'),
        `${t('results.carbs')}(g)`,
        `${t('results.fat')}(g)`,
        `${t('results.protein')}(g)`,
        `${t('results.totalCaloriesFull')}(kCal)`,
      ];
  let csvText = `${header.join(',')}\n`;

  orderedDays.forEach((day, index) => {
    const dayNumber = t('results.dayNumber').replace(
      '{{day}}',
      (index + 1).toString()
    );
    const dayTypeText = getDayTypeDisplay(day.type, t)
      .replace(/🔥|⚖️|🌿/g, '')
      .trim();

    const workout = dailyWorkouts[day.day] || '-';
    const workoutText = workout === '-' ? '-' : t(`workouts.${workout}`);

    if (hasDelta) {
      const deltaPct =
        typeof day.deltaPct === 'number'
          ? String(Math.round(day.deltaPct))
          : '-';
      csvText += `"${dayNumber}","${dayTypeText}","${workoutText}",${Math.round(day.carbs)},${Math.round(day.fat)},${Math.round(day.protein)},${Math.round(day.calories)},${deltaPct}%\n`;
    } else {
      csvText += `"${dayNumber}","${dayTypeText}","${workoutText}",${Math.round(day.carbs)},${Math.round(day.fat)},${Math.round(day.protein)},${Math.round(day.calories)}\n`;
    }
  });
  return csvText;
};
