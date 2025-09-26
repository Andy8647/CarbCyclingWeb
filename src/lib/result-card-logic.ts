import type { UserInput } from '@/lib/calculator';
import {
  calculateNutritionPlan,
  calculateMetabolicData,
  WORKOUT_TYPES,
} from '@/lib/calculator';

export type NutritionPlan = ReturnType<typeof calculateNutritionPlan>;
export type MetabolicData = ReturnType<typeof calculateMetabolicData>;

export interface DayData {
  day: number;
  type: string;
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
  caloriesDiff: number;
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
  formData: Record<string, unknown> | undefined,
  isValid: boolean
) => {
  if (
    !isValid ||
    !formData ||
    !formData?.weight ||
    !formData?.bodyType ||
    !formData?.age ||
    !formData?.gender ||
    !formData?.height ||
    !formData?.activityFactor ||
    !formData?.carbCoeff ||
    !formData?.proteinCoeff ||
    !formData?.fatCoeff ||
    !formData?.cycleDays
  ) {
    return null;
  }

  const input: UserInput = {
    age: formData.age as number,
    gender: formData.gender as UserInput['gender'],
    weight: formData.weight as number,
    height: formData.height as number,
    activityFactor: formData.activityFactor as UserInput['activityFactor'],
    bodyType: formData.bodyType as UserInput['bodyType'],
    carbCoeff: formData.carbCoeff as number,
    proteinCoeff: formData.proteinCoeff as number,
    fatCoeff: formData.fatCoeff as number,
    cycleDays: formData.cycleDays as number,
  };

  return calculateNutritionPlan(input);
};

export const calculateMetabolicInfo = (
  formData: Record<string, unknown> | undefined,
  isValid: boolean
) => {
  if (
    !isValid ||
    !formData ||
    !formData?.weight ||
    !formData?.height ||
    !formData?.age ||
    !formData?.gender ||
    !formData?.activityFactor
  ) {
    return null;
  }

  const input: UserInput = {
    age: formData.age as number,
    gender: formData.gender as UserInput['gender'],
    weight: formData.weight as number,
    height: formData.height as number,
    activityFactor: formData.activityFactor as UserInput['activityFactor'],
    bodyType: formData.bodyType as UserInput['bodyType'],
    carbCoeff: formData.carbCoeff as number,
    proteinCoeff: formData.proteinCoeff as number,
    fatCoeff: formData.fatCoeff as number,
    cycleDays: formData.cycleDays as number,
  };

  return calculateMetabolicData(input);
};

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
  metabolicData: ReturnType<typeof calculateMetabolicData> | null,
  macroIcons: Record<string, string>,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const { summary } = nutritionPlan;

  let markdownText = `# ${t('results.carbCyclingPlan')}\n\n`;
  markdownText += `## ${t('results.weeklySummary')}\n`;
  markdownText += `- ${macroIcons.protein} ${t('results.dailyProtein')}: ${summary.dailyProtein}g\n`;
  markdownText += `- ${macroIcons.carbs} ${t('results.weeklyCarbs')}: ${summary.totalCarbs}g\n`;
  markdownText += `- ${macroIcons.fat} ${t('results.weeklyFat')}: ${summary.totalFat}g\n`;
  markdownText += `- 🔥 ${t('results.weeklyCalories')}: ${summary.totalCalories}kcal\n`;
  if (metabolicData) {
    markdownText += `- ⚡ ${t('results.dailyTDEE')}: ${metabolicData.tdee}kcal\n`;
  }
  markdownText += `\n## ${t('results.dailyDetails')}\n\n`;
  markdownText += `| ${t('results.day')} | ${t('results.dayType')} | ${t('results.workout')} | ${t('results.carbs')}(g) | ${t('results.fat')}(g) | ${t('results.protein')}(g) | ${t('results.totalCaloriesFull')}(kcal) | ${t('results.calorieDeficitFull')}(kcal) |\n`;
  markdownText += `|------|------|---------|---------|---------|---------|-------------|-------------|\n`;

  orderedDays.forEach((day, index) => {
    const caloriesDiffStr =
      day.caloriesDiff > 0 ? `+${day.caloriesDiff}` : `${day.caloriesDiff}`;
    const workout = dailyWorkouts[day.day] || '-';
    const workoutEmoji = getWorkoutEmoji(workout);
    const workoutDisplay =
      workout === '-' ? '-' : `${workoutEmoji} ${t(`workouts.${workout}`)}`;

    markdownText += `| ${t('results.dayNumber').replace('{{day}}', (index + 1).toString())} | ${getDayTypeDisplay(day.type, t)} | ${workoutDisplay} | ${day.carbs} | ${day.fat} | ${day.protein} | ${day.calories} | ${caloriesDiffStr} |\n`;
  });

  return markdownText;
};

export const generateCSV = (
  nutritionPlan: ReturnType<typeof calculateNutritionPlan>,
  orderedDays: DayData[],
  dailyWorkouts: Record<number, string>,
  metabolicData: ReturnType<typeof calculateMetabolicData> | null,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const { summary } = nutritionPlan;

  let csvText = `${t('results.day')},${t('results.dayType')},${t('results.workout')},${t('results.carbs')}(g),${t('results.fat')}(g),${t('results.protein')}(g),${t('results.totalCaloriesFull')}(kcal),${t('results.calorieDeficitFull')}(kcal)\n`;

  orderedDays.forEach((day, index) => {
    const caloriesDiffStr =
      day.caloriesDiff > 0 ? `+${day.caloriesDiff}` : `${day.caloriesDiff}`;
    const dayNumber = t('results.dayNumber').replace(
      '{{day}}',
      (index + 1).toString()
    );
    const dayTypeText = getDayTypeDisplay(day.type, t)
      .replace(/🔥|⚖️|🌿/g, '')
      .trim();

    const workout = dailyWorkouts[day.day] || '-';
    const workoutText = workout === '-' ? '-' : t(`workouts.${workout}`);

    csvText += `"${dayNumber}","${dayTypeText}","${workoutText}",${day.carbs},${day.fat},${day.protein},${day.calories},"${caloriesDiffStr}"\n`;
  });

  csvText += `\n${t('results.weeklySummary')}\n`;
  csvText += `${t('results.dailyProtein')},${summary.dailyProtein}g\n`;
  csvText += `${t('results.weeklyCarbs')},${summary.totalCarbs}g\n`;
  csvText += `${t('results.weeklyFat')},${summary.totalFat}g\n`;
  csvText += `${t('results.weeklyCalories')},${summary.totalCalories}kcal\n`;
  if (metabolicData) {
    csvText += `${t('results.dailyTDEE')},${metabolicData.tdee}kcal\n`;
  }

  return csvText;
};
