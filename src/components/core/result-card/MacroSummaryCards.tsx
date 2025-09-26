import { useTranslation } from 'react-i18next';
import type { NutritionPlan, MetabolicData } from '@/lib/result-card-logic';

interface MacroSummaryCardsProps {
  nutritionPlan: NutritionPlan;
  metabolicData: MetabolicData | null;
  macroIcons: Record<string, string>;
}

export function MacroSummaryCards({
  nutritionPlan,
  metabolicData,
  macroIcons,
}: MacroSummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 sm:p-3">
        <div className="text-xs text-slate-500 flex items-center gap-1 mb-1 whitespace-nowrap">
          <span className="text-sm">{macroIcons.protein}</span>
          <span>{t('results.dailyProtein')}</span>
        </div>
        <div className="text-sm sm:text-lg font-semibold">
          {nutritionPlan.summary.dailyProtein} g
        </div>
      </div>

      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 sm:p-3">
        <div className="text-xs text-slate-500 flex items-center gap-1 mb-1 whitespace-nowrap">
          <span className="text-sm">{macroIcons.carbs}</span>
          <span>{t('results.weeklyCarbs')}</span>
        </div>
        <div className="text-sm sm:text-lg font-semibold">
          {nutritionPlan.summary.totalCarbs} g
        </div>
      </div>

      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 sm:p-3">
        <div className="text-xs text-slate-500 flex items-center gap-1 mb-1 whitespace-nowrap">
          <span className="text-sm">{macroIcons.fat}</span>
          <span>{t('results.weeklyFat')}</span>
        </div>
        <div className="text-sm sm:text-lg font-semibold">
          {nutritionPlan.summary.totalFat} g
        </div>
      </div>

      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 sm:p-3">
        <div className="text-xs text-slate-500 flex items-center gap-1 mb-1 whitespace-nowrap">
          <span className="text-sm">🔥</span>
          <span>{t('results.calorieInfo')}</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-semibold">
            {t('results.weeklyCalories')}: {nutritionPlan.summary.totalCalories}
          </div>
          {metabolicData && (
            <div className="text-xs sm:text-sm font-semibold">
              {t('results.dailyTDEE')}: {metabolicData.tdee}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
