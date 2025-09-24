import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DayMealPlan,
  type FoodItem,
  type MealPortion,
  type MealSlotId,
  MEAL_SLOT_DEFINITIONS,
} from '@/lib/persistence-types';
import { buildFoodLookup, calculateDayTotals } from '@/lib/meal-planner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { deriveVisibleSlots } from '@/lib/meal-slot-utils';
import { SlotSection } from '@/components/core/meal-slot';

interface MealSlotPlannerProps {
  dayNumber: number;
  dayMealPlan: DayMealPlan;
  foodLibrary: FoodItem[];
  onUpdateSlot: (slotId: MealSlotId, portions: MealPortion[]) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  targetMacros: {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  };
}

export function MealSlotPlanner({
  dayNumber,
  dayMealPlan,
  foodLibrary,
  onUpdateSlot,
  onAddCustomFood,
  targetMacros,
}: MealSlotPlannerProps) {
  const { t } = useTranslation();
  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);
  const previousDayRef = useRef(dayNumber);

  const visibleSlots = useMemo(() => {
    if (previousDayRef.current !== dayNumber) {
      previousDayRef.current = dayNumber;
    }
    return deriveVisibleSlots(dayMealPlan);
  }, [dayNumber, dayMealPlan]);

  const availableSlots = useMemo(
    () =>
      MEAL_SLOT_DEFINITIONS.filter((slot) => !visibleSlots.includes(slot.id)),
    [visibleSlots]
  );

  const handleAddSlot = useCallback(() => {
    // This will be handled by the parent through state updates
  }, []);

  const handleRemoveSlot = useCallback(
    (slotId: MealSlotId) => {
      onUpdateSlot(slotId, []);
    },
    [onUpdateSlot]
  );

  const dayTotals = useMemo(
    () => calculateDayTotals(dayMealPlan, foodLookup),
    [dayMealPlan, foodLookup]
  );

  const diff = {
    carbs: Math.round((dayTotals.carbs - targetMacros.carbs) * 10) / 10,
    protein: Math.round((dayTotals.protein - targetMacros.protein) * 10) / 10,
    fat: Math.round((dayTotals.fat - targetMacros.fat) * 10) / 10,
    calories: dayTotals.calories - targetMacros.calories,
  };

  const renderDiff = (value: number, suffix: string) => {
    if (value === 0) return `${value}${suffix}`;
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-lg bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('mealPlanner.daySummary', { day: dayNumber })}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.carbs === 0
                  ? 'border-slate-300'
                  : diff.carbs > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.carbsDiff', {
                value: renderDiff(diff.carbs, 'g'),
              })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.protein === 0
                  ? 'border-slate-300'
                  : diff.protein > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.proteinDiff', {
                value: renderDiff(diff.protein, 'g'),
              })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.fat === 0
                  ? 'border-slate-300'
                  : diff.fat > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.fatDiff', { value: renderDiff(diff.fat, 'g') })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.calories === 0
                  ? 'border-slate-300'
                  : diff.calories > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.calorieDiff', {
                value: renderDiff(diff.calories, 'kcal'),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {availableSlots.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                {t('mealPlanner.addMealSlot')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              {availableSlots.map((slot) => (
                <DropdownMenuItem
                  key={slot.id}
                  onSelect={() => {
                    handleAddSlot();
                  }}
                >
                  {t(slot.translationKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-1 h-4 w-4" />
            {t('mealPlanner.addMealSlot')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleSlots.map((slotId) => (
          <SlotSection
            key={`${dayNumber}-${slotId}`}
            slotId={slotId}
            portions={dayMealPlan[slotId]}
            foodLibrary={foodLibrary}
            onUpdate={(portions) => onUpdateSlot(slotId, portions)}
            onAddCustomFood={onAddCustomFood}
            allowRemove={visibleSlots.length > 1}
            onRemoveSlot={() => handleRemoveSlot(slotId)}
          />
        ))}
      </div>
    </div>
  );
}
