import type { UserInput } from '@/lib/calculator';
import { calculateNutritionPlan, WORKOUT_TYPES } from '@/lib/calculator';

export type NutritionPlan = ReturnType<typeof calculateNutritionPlan>;

export interface DayData {
  day: number;
  type: string;
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
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
) => {
  // Do not gate on form isValid; compute when required fields are present
  if (!formData) return null;

  const includeMid = (formData.includeMidCarb as boolean) ?? true;

  const requiredKeys: Array<keyof UserInput> = [
    'weight',
    'bodyType',
    'carbCoeff',
    'proteinCoeff',
    'fatCoeff',
    'cycleDays',
    'highDays',
    'lowDays',
    'highCarbPercent',
    'lowCarbPercent',
    'highFatPercent',
    'lowFatPercent',
  ];
  if (includeMid) {
    requiredKeys.push('midDays', 'midCarbPercent', 'midFatPercent');
  }

  for (const key of requiredKeys) {
    if (
      formData[key as string] === undefined ||
      formData[key as string] === null
    ) {
      return null;
    }
  }

  const input: UserInput = {
    weight: formData.weight as number,
    bodyType: formData.bodyType as UserInput['bodyType'],
    carbCoeff: formData.carbCoeff as number,
    proteinCoeff: formData.proteinCoeff as number,
    fatCoeff: formData.fatCoeff as number,
    cycleDays: formData.cycleDays as number,
    highDays: formData.highDays as number,
    midDays: (formData.midDays as number) ?? 0,
    lowDays: formData.lowDays as number,
    highCarbPercent: formData.highCarbPercent as number,
    midCarbPercent: (formData.midCarbPercent as number) ?? 0,
    lowCarbPercent: formData.lowCarbPercent as number,
    highFatPercent: formData.highFatPercent as number,
    midFatPercent: (formData.midFatPercent as number) ?? 0,
    lowFatPercent: formData.lowFatPercent as number,
  };

  return calculateNutritionPlan(input);
};

// Removed calculateMetabolicInfo since we no longer calculate TDEE

export const reorderDays = (
  nutritionPlan: ReturnType<typeof calculateNutritionPlan> | null,
  dayOrder: number[]
) => {
  if (!nutritionPlan || dayOrder.length === 0)
    return nutritionPlan?.dailyPlans || [];

  return dayOrder
    .map((dayNum) => nutritionPlan.dailyPlans.find((day) => day.day === dayNum))
    .filter(Boolean) as typeof nutritionPlan.dailyPlans;
};

export const generateMarkdown = (
  nutritionPlan: ReturnType<typeof calculateNutritionPlan>,
  orderedDays: DayData[],
  dailyWorkouts: Record<number, string>,
  macroIcons: Record<string, string>,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const { summary } = nutritionPlan;

  let markdownText = `# ${t('results.carbCyclingPlan')}\n\n`;
  markdownText += `## ${t('results.weeklySummary')}\n`;
  markdownText += `- ${macroIcons.protein} ${t('results.dailyProtein')}: ${summary.dailyProtein}g\n`;
  markdownText += `- ${macroIcons.carbs} ${t('results.weeklyCarbs')}: ${summary.totalCarbs}g\n`;
  markdownText += `- ${macroIcons.fat} ${t('results.weeklyFat')}: ${summary.totalFat}g\n`;
  markdownText += `\n## ${t('results.dailyDetails')}\n\n`;
  markdownText += `| ${t('results.day')} | ${t('results.dayType')} | ${t('results.workout')} | ${t('results.carbs')}(g) | ${t('results.fat')}(g) | ${t('results.protein')}(g) | ${t('results.totalCaloriesFull')}(kCal) |\n`;
  markdownText += `|------|------|---------|---------|---------|---------|-------------|\n`;

  orderedDays.forEach((day, index) => {
    const workout = dailyWorkouts[day.day] || '-';
    const workoutEmoji = getWorkoutEmoji(workout);
    const workoutDisplay =
      workout === '-' ? '-' : `${workoutEmoji} ${t(`workouts.${workout}`)}`;

    markdownText += `| ${t('results.dayNumber').replace('{{day}}', (index + 1).toString())} | ${getDayTypeDisplay(day.type, t)} | ${workoutDisplay} | ${day.carbs} | ${day.fat} | ${day.protein} | ${day.calories} |\n`;
  });

  return markdownText;
};

export const generateCSV = (
  nutritionPlan: ReturnType<typeof calculateNutritionPlan>,
  orderedDays: DayData[],
  dailyWorkouts: Record<number, string>,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const { summary } = nutritionPlan;

  const header = [
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

    csvText += `"${dayNumber}","${dayTypeText}","${workoutText}",${day.carbs},${day.fat},${day.protein},${day.calories}\n`;
  });

  csvText += `\n${t('results.weeklySummary')}\n`;
  csvText += `${t('results.dailyProtein')},${summary.dailyProtein}g\n`;
  csvText += `${t('results.weeklyCarbs')},${summary.totalCarbs}g\n`;
  csvText += `${t('results.weeklyFat')},${summary.totalFat}g\n`;
  return csvText;
};
