import { useMemo, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '@/lib/form-context';
import { GlassCard } from '@/components/ui/glass-card';
import { IOSGridLayout } from './IOSGridLayout';
import { useToast } from '@/lib/use-toast';
import { useExportActions } from '@/lib/hooks/use-export-actions';
import type {
  DayMealPlan,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';
import { normalizeDayMealPlan } from '@/lib/meal-planner';
import { FoodLibraryPanel } from './FoodLibraryPanel';
import {
  DayColumn,
  MacroSummaryCards,
  ResultsHeader,
} from '@/components/core/result-card';
import { MealSlotPlanner } from './MealSlotPlanner';
import { useScreenSize } from '@/lib/hooks/use-screen-size';
import {
  calculateNutritionData,
  calculateMetabolicInfo,
  reorderDays,
  type DragData,
} from '@/lib/result-card-logic';

export function ResultCard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    form,
    dailyWorkouts,
    setDailyWorkout,
    dayOrder,
    setDayOrder,
    foodLibrary,
    addCustomFood,
    updateFood,
    removeFood,
    getMealPlan,
    setMealPortionsForSlot,
    resetMealPlan,
  } = useFormContext();

  const isLargeScreen = useScreenSize();
  const [showFoodLibrary, setShowFoodLibrary] = useState(false);
  const [showMealSlots, setShowMealSlots] = useState(false);
  const [columnHeights, setColumnHeights] = useState<Record<number, number>>(
    {}
  );

  const resultsMacroEmojis = t('results.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;
  const macroIcons = {
    carbs: resultsMacroEmojis?.carbs ?? '🍞',
    protein: resultsMacroEmojis?.protein ?? '🥩',
    fat: resultsMacroEmojis?.fat ?? '🥑',
  };

  const formData = form?.watch();
  const isValid = form?.formState.isValid;
  const cycleDays = formData?.cycleDays ?? 0;

  // 当循环天数变化时，清理旧的列高度信息
  useEffect(() => {
    setColumnHeights({});
  }, [cycleDays]);

  const mealPlan = useMemo(() => {
    if (!cycleDays) return null;
    return getMealPlan(cycleDays);
  }, [getMealPlan, cycleDays]);

  const dayMealPlans = useMemo(() => {
    if (!mealPlan) return {} as Record<number, DayMealPlan>;
    const plans: Record<number, DayMealPlan> = {};
    for (const [key, plan] of Object.entries(mealPlan.dayMeals)) {
      const dayNumber = Number(key);
      plans[dayNumber] = normalizeDayMealPlan(plan);
    }
    return plans;
  }, [mealPlan]);

  const nutritionPlan = useMemo(
    () => calculateNutritionData(formData, isValid ?? false),
    [formData, isValid]
  );

  const metabolicData = useMemo(
    () => calculateMetabolicInfo(formData, isValid ?? false),
    [formData, isValid]
  );

  const orderedDays = useMemo(
    () => reorderDays(nutritionPlan, dayOrder),
    [nutritionPlan, dayOrder]
  );

  const { exportRef, handleCopyAsMarkdown, handleCopyAsCSV, handleExportPNG } =
    useExportActions({
      nutritionPlan,
      orderedDays,
      dailyWorkouts,
      metabolicData,
      macroIcons,
    });

  const handleMealSlotUpdate = useCallback(
    (dayNumber: number, slotId: MealSlotId, portions: MealPortion[]) => {
      if (!cycleDays) return;
      setMealPortionsForSlot(cycleDays, dayNumber, slotId, portions);
    },
    [cycleDays, setMealPortionsForSlot]
  );

  const handleResetMealPlan = useCallback(() => {
    if (!cycleDays) return;
    resetMealPlan(cycleDays);
    toast({
      variant: 'success',
      title: t('mealPlanner.resetSuccess'),
    });
  }, [cycleDays, resetMealPlan, toast, t]);

  // Initialize dayOrder when nutritionPlan changes
  useEffect(() => {
    if (nutritionPlan && nutritionPlan.dailyPlans.length > 0) {
      if (
        dayOrder.length === 0 ||
        dayOrder.length !== nutritionPlan.dailyPlans.length
      ) {
        const expectedDays = nutritionPlan.dailyPlans.map((day) => day.day);
        const hasValidOrder =
          dayOrder.length === expectedDays.length &&
          dayOrder.every((day) => expectedDays.includes(day));

        if (!hasValidOrder) {
          setDayOrder(expectedDays);
        }
      }
    }
  }, [nutritionPlan, dayOrder, setDayOrder]);

  const handleColumnHeightChange = useCallback(
    (dayId: number, height: number) => {
      setColumnHeights((previous) => {
        const roundedHeight = Math.round(height);
        if (previous[dayId] === roundedHeight) {
          return previous;
        }

        return {
          ...previous,
          [dayId]: roundedHeight,
        };
      });
    },
    []
  );

  const maxColumnHeight = useMemo(() => {
    return orderedDays.reduce((maxHeight, day) => {
      if (!day) return maxHeight;

      const height = columnHeights[day.day];
      if (height === undefined) {
        return maxHeight;
      }

      return height > maxHeight ? height : maxHeight;
    }, 0);
  }, [columnHeights, orderedDays]);

  const handleDrop = useCallback(
    (dragData: DragData, targetColumnIndex: number) => {
      if (dragData.type !== 'card') return;

      const activeDayNum = dragData.day;
      const currentIndex = dayOrder.indexOf(activeDayNum);

      if (currentIndex !== -1 && currentIndex !== targetColumnIndex) {
        const newDayOrder = [...dayOrder];
        newDayOrder.splice(currentIndex, 1);
        newDayOrder.splice(targetColumnIndex, 0, activeDayNum);
        setDayOrder(newDayOrder);
      }
    },
    [dayOrder, setDayOrder]
  );

  const handleGridDrop = useCallback(
    (dragData: DragData, targetIndex: number) => {
      if (dragData.type !== 'card') return;

      const activeDayNum = dragData.day;
      const currentIndex = dayOrder.indexOf(activeDayNum);

      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        const newDayOrder = [...dayOrder];
        newDayOrder.splice(currentIndex, 1);
        newDayOrder.splice(targetIndex, 0, activeDayNum);
        setDayOrder(newDayOrder);
      }
    },
    [dayOrder, setDayOrder]
  );

  if (!form) return null;

  return (
    <GlassCard>
      <ResultsHeader
        showMealSlots={showMealSlots}
        setShowMealSlots={setShowMealSlots}
        showFoodLibrary={showFoodLibrary}
        setShowFoodLibrary={setShowFoodLibrary}
        onCopyAsMarkdown={handleCopyAsMarkdown}
        onCopyAsCSV={handleCopyAsCSV}
        onExportPNG={handleExportPNG}
        onResetMealPlan={handleResetMealPlan}
        cycleDays={cycleDays}
      />

      <div ref={exportRef}>
        {nutritionPlan ? (
          <div className="space-y-4">
            <MacroSummaryCards
              nutritionPlan={nutritionPlan}
              metabolicData={metabolicData}
              macroIcons={macroIcons}
            />

            {showFoodLibrary && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-4">
                <FoodLibraryPanel
                  foods={foodLibrary}
                  onAddCustomFood={addCustomFood}
                  onUpdateFood={(id, food) => {
                    updateFood(id, {
                      ...food,
                    });
                  }}
                  onRemoveFood={removeFood}
                />
              </div>
            )}

            {/* Layout conditional rendering based on screen size */}
            {isLargeScreen ? (
              /* Kanban Board layout for large screens */
              <div className="w-full">
                <div
                  className="flex gap-3 pb-4 mx-auto justify-around"
                  style={{
                    width: orderedDays.length <= 7 ? '100%' : 'max-content',
                    maxWidth: '100%',
                    overflowX: orderedDays.length > 7 ? 'auto' : 'visible',
                  }}
                >
                  {orderedDays.map((dayData, index) => {
                    if (!dayData) return null;

                    const mealPlanForDay =
                      dayMealPlans[dayData.day] || normalizeDayMealPlan();

                    return (
                      <DayColumn
                        key={`column-${dayData.day}`}
                        columnIndex={index}
                        day={dayData}
                        dailyWorkouts={dailyWorkouts}
                        setDailyWorkout={setDailyWorkout}
                        onDrop={handleDrop}
                        macroIcons={macroIcons}
                        onHeightChange={handleColumnHeightChange}
                        syncedHeight={
                          maxColumnHeight > 0 ? maxColumnHeight : undefined
                        }
                        measuredHeight={columnHeights[dayData.day]}
                      >
                        {showMealSlots && (
                          <MealSlotPlanner
                            dayNumber={dayData.day}
                            dayMealPlan={mealPlanForDay}
                            foodLibrary={foodLibrary}
                            onUpdateSlot={(slotId, portions) =>
                              handleMealSlotUpdate(
                                dayData.day,
                                slotId,
                                portions
                              )
                            }
                            onAddCustomFood={addCustomFood}
                            targetMacros={{
                              carbs: dayData.carbs,
                              protein: dayData.protein,
                              fat: dayData.fat,
                              calories: dayData.calories,
                            }}
                            className="flex-1"
                          />
                        )}
                      </DayColumn>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* iOS Grid Layout for small/medium screens */
              <IOSGridLayout
                orderedDays={orderedDays}
                dailyWorkouts={dailyWorkouts}
                setDailyWorkout={setDailyWorkout}
                onDrop={handleGridDrop}
                dayMealPlans={dayMealPlans}
                foodLibrary={foodLibrary}
                onMealSlotChange={handleMealSlotUpdate}
                onAddCustomFood={addCustomFood}
                showMealSlots={showMealSlots}
              />
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-4xl">📝</div>
            <div className="text-base font-medium">
              {t('results.fillFormFirst')}
            </div>
            <div className="text-sm text-slate-500">
              {t('results.fillFormDescription')}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
