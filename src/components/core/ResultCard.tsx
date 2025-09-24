import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '@/lib/form-context';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { IOSGridLayout } from './IOSGridLayout';
import { useToast } from '@/lib/use-toast';
import { exportNodeToPNG } from '@/lib/export-to-png';
import type {
  DayMealPlan,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';
import { normalizeDayMealPlan } from '@/lib/meal-planner';
import { FoodLibraryPanel } from './FoodLibraryPanel';
import { DayColumn } from '@/components/core/result-card';
import { useScreenSize } from '@/lib/hooks/use-screen-size';
import {
  calculateNutritionData,
  calculateMetabolicInfo,
  reorderDays,
  generateMarkdown,
  generateCSV,
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
    removeCustomFood,
    getMealPlan,
    setMealPortionsForSlot,
    resetMealPlan,
  } = useFormContext();

  const exportRef = useRef<HTMLDivElement>(null);
  const isLargeScreen = useScreenSize();
  const [showFoodLibrary, setShowFoodLibrary] = useState(false);

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

  const nutritionPlan = useMemo(
    () => calculateNutritionData(formData, isValid ?? false),
    [formData, isValid]
  );

  const metabolicData = useMemo(
    () => calculateMetabolicInfo(formData, isValid ?? false),
    [formData, isValid]
  );

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

  const orderedDays = useMemo(
    () => reorderDays(nutritionPlan, dayOrder),
    [nutritionPlan, dayOrder]
  );

  const handleDrop = (dragData: DragData, targetColumnIndex: number) => {
    if (dragData.type !== 'card') return;

    const activeDayNum = dragData.day;
    const currentIndex = dayOrder.indexOf(activeDayNum);

    if (currentIndex !== -1 && currentIndex !== targetColumnIndex) {
      const newDayOrder = [...dayOrder];
      newDayOrder.splice(currentIndex, 1);
      newDayOrder.splice(targetColumnIndex, 0, activeDayNum);
      setDayOrder(newDayOrder);
    }
  };

  const handleGridDrop = (dragData: DragData, targetIndex: number) => {
    if (dragData.type !== 'card') return;

    const activeDayNum = dragData.day;
    const currentIndex = dayOrder.indexOf(activeDayNum);

    if (currentIndex !== -1 && currentIndex !== targetIndex) {
      const newDayOrder = [...dayOrder];
      newDayOrder.splice(currentIndex, 1);
      newDayOrder.splice(targetIndex, 0, activeDayNum);
      setDayOrder(newDayOrder);
    }
  };

  if (!form) return null;

  const handleCopyAsMarkdown = () => {
    if (!nutritionPlan) return;

    const markdownText = generateMarkdown(
      nutritionPlan,
      orderedDays,
      dailyWorkouts,
      metabolicData,
      macroIcons,
      t
    );

    navigator.clipboard
      .writeText(markdownText)
      .then(() => {
        toast({
          variant: 'success',
          title: '📝 ' + t('results.copyAsMarkdown'),
          description: t('results.copySuccess'),
        });
      })
      .catch((err) => {
        console.error(t('results.copyError'), err);
        toast({
          variant: 'destructive',
          title: t('results.copyError'),
          description: 'Failed to copy to clipboard',
        });
      });
  };

  const handleCopyAsCSV = () => {
    if (!nutritionPlan) return;

    const csvText = generateCSV(
      nutritionPlan,
      orderedDays,
      dailyWorkouts,
      metabolicData,
      t
    );

    navigator.clipboard
      .writeText(csvText)
      .then(() => {
        toast({
          variant: 'success',
          title: '📊 ' + t('results.copyAsCSV'),
          description: t('results.copySuccess'),
        });
      })
      .catch((err) => {
        console.error(t('results.copyError'), err);
        toast({
          variant: 'destructive',
          title: t('results.copyError'),
          description: 'Failed to copy to clipboard',
        });
      });
  };

  const handleExportPNG = async () => {
    try {
      if (!nutritionPlan) {
        toast({
          variant: 'destructive',
          title: t('results.exportError'),
          description: 'No results to export',
        });
        return;
      }
      const node = exportRef.current;
      if (!node) return;

      const prevPadding = node.style.padding;
      node.style.padding = '24px';
      try {
        await exportNodeToPNG(node, {
          fileName: 'carb-cycling-plan.png',
          pixelRatio: 3,
          filter: (n) =>
            !(
              n instanceof HTMLElement && n.hasAttribute('data-export-exclude')
            ),
        });
      } finally {
        node.style.padding = prevPadding;
      }

      toast({
        variant: 'success',
        title: '🖼️ ' + t('results.exportPNG'),
        description: t('results.exportSuccess'),
      });
    } catch (err) {
      console.error('Export PNG failed', err);
      toast({
        variant: 'destructive',
        title: t('results.exportError'),
        description: 'Failed to export PNG',
      });
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍽️</span>
          <h2 className="text-lg font-bold text-foreground">
            {t('results.title')}
          </h2>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          data-export-exclude
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant={showFoodLibrary ? 'default' : 'outline'}
              className="rounded-xl"
              onClick={() => setShowFoodLibrary((prev) => !prev)}
            >
              <span>🍱</span>
              <span className="hidden sm:inline ml-1">
                {showFoodLibrary
                  ? t('mealPlanner.hideLibrary')
                  : t('mealPlanner.showLibrary')}
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <span>📋</span>
                  <span className="hidden sm:inline ml-1">
                    {t('results.copyResults')}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyAsMarkdown}>
                  <span className="mr-2">📝</span>
                  {t('results.copyAsMarkdown')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyAsCSV}>
                  <span className="mr-2">📊</span>
                  {t('results.copyAsCSV')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleResetMealPlan}
                  disabled={!cycleDays}
                >
                  <span className="mr-2">♻️</span>
                  {t('mealPlanner.resetPlanAction')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleExportPNG}
            >
              <span>🖼️</span>
              <span className="hidden sm:inline ml-1">
                {t('results.exportPNG')}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div ref={exportRef}>
        {nutritionPlan ? (
          <div className="space-y-4">
            {/* Weekly summary cards */}
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
                    {t('results.weeklyCalories')}:{' '}
                    {nutritionPlan.summary.totalCalories}
                  </div>
                  {metabolicData && (
                    <div className="text-xs sm:text-sm font-semibold">
                      {t('results.dailyTDEE')}: {metabolicData.tdee}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showFoodLibrary && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-4">
                <FoodLibraryPanel
                  foods={foodLibrary}
                  onAddCustomFood={addCustomFood}
                  onRemoveFood={removeCustomFood}
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
                        mealPlan={mealPlanForDay}
                        foodLibrary={foodLibrary}
                        onUpdateMealSlot={handleMealSlotUpdate}
                        onAddCustomFood={addCustomFood}
                        macroIcons={macroIcons}
                      />
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
                foodLibrary={foodLibrary}
                dayMealPlans={dayMealPlans}
                onMealSlotChange={handleMealSlotUpdate}
                onAddCustomFood={addCustomFood}
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
