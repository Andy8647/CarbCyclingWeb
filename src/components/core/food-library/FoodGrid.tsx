import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { FoodGridProps } from './types';

export function FoodGrid({ filteredFoods, onRemoveFood }: FoodGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredFoods.map(
        ({ food, name, category, serving, unitLabel, preparationLabel }) => (
          <div
            key={food.id}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{food.emoji || '🍽️'}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {name}
                  </span>
                  {food.isCustom && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {t('mealPlanner.customBadge')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {unitLabel || serving ? (
                    <>
                      {unitLabel}
                      {unitLabel && serving && (
                        <span className="text-slate-400 dark:text-slate-500">
                          {' '}
                          · {serving}
                        </span>
                      )}
                      {!unitLabel && serving}
                    </>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {category}
                </div>
                {food.preparation && preparationLabel && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {preparationLabel}
                  </div>
                )}
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <div>
                  {t('mealPlanner.carbsShort', { value: food.macros.carbs })}
                </div>
                <div>
                  {t('mealPlanner.proteinShort', {
                    value: food.macros.protein,
                  })}
                </div>
                <div>
                  {t('mealPlanner.fatShort', { value: food.macros.fat })}
                </div>
                <div>
                  {t('mealPlanner.caloriesShort', {
                    value: food.macros.calories,
                  })}
                </div>
              </div>
            </div>

            {food.isCustom && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFood(food.id)}
                >
                  {t('mealPlanner.removeCustomFood')}
                </Button>
              </div>
            )}
          </div>
        )
      )}
      {filteredFoods.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('mealPlanner.noFoodsFound')}
        </div>
      )}
    </div>
  );
}
