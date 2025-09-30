import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DayMealPlan,
  type FoodItem,
  type MealPortion,
  type MealSlotId,
  MEAL_SLOT_DEFINITIONS,
} from '@/lib/persistence-types';
import {
  buildFoodLookup,
  calculateDayTotals,
  deriveVisibleSlots,
} from '@/lib/meal-planner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
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
  className?: string;
}

export function MealSlotPlanner({
  dayNumber,
  dayMealPlan,
  foodLibrary,
  onUpdateSlot,
  onAddCustomFood,
  targetMacros,
  className,
}: MealSlotPlannerProps) {
  const { t } = useTranslation();
  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);
  const visibleSlots = useMemo(
    () => deriveVisibleSlots(dayMealPlan),
    [dayMealPlan]
  );

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

  const diff = useMemo(
    () => ({
      carbs: Math.round(dayTotals.carbs - targetMacros.carbs),
      protein: Math.round(dayTotals.protein - targetMacros.protein),
      fat: Math.round(dayTotals.fat - targetMacros.fat),
    }),
    [dayTotals, targetMacros]
  );

  const macroEmojis = useMemo(
    () =>
      t('mealPlanner.macroEmojis', {
        returnObjects: true,
      }) as Record<'carbs' | 'protein' | 'fat', string>,
    [t]
  );

  const getDiffTextClass = useCallback((value: number) => {
    if (value === 0) return 'text-slate-500 dark:text-slate-400';
    return value > 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  }, []);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Day Summary Header */}
      <div className="rounded-t-lg bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span>{macroEmojis.carbs ?? 'C'}</span>
              <span className={getDiffTextClass(diff.carbs)}>
                {diff.carbs >= 0 ? `+${diff.carbs}` : diff.carbs}g
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>{macroEmojis.protein ?? 'P'}</span>
              <span className={getDiffTextClass(diff.protein)}>
                {diff.protein >= 0 ? `+${diff.protein}` : diff.protein}g
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>{macroEmojis.fat ?? 'F'}</span>
              <span className={getDiffTextClass(diff.fat)}>
                {diff.fat >= 0 ? `+${diff.fat}` : diff.fat}g
              </span>
            </span>
          </div>
          <div className="flex-shrink-0">
            {availableSlots.length > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <DropdownMenuContent align="end" sideOffset={8}>
                      {availableSlots.map((slot) => (
                        <DropdownMenuItem
                          key={slot.id}
                          onSelect={handleAddSlot}
                        >
                          {t(slot.translationKey)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent>
                    <p>{t('mealPlanner.addMealSlot')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('mealPlanner.addMealSlot')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout Meal Slots */}
      <div className="flex-1 grid grid-cols-1 content-start bg-white dark:bg-slate-900 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-700 overflow-hidden">
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
