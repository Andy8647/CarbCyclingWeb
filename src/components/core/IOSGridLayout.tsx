import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getWorkoutTypes } from '@/lib/calculator';
import {
  getDayTypeDisplay,
  createDraggableCard,
  createGridDropTarget,
  createCellDropTarget,
  type DragData,
} from '@/lib/grid-layout';
import { normalizeDayMealPlan } from '@/lib/meal-planner';
import { MealSlotPlanner } from './MealSlotPlanner';
import type {
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';

interface DayData {
  day: number;
  type: string;
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
  caloriesDiff: number;
}

interface IOSSquareCardProps {
  day: DayData;
  displayOrder: number;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
}

function IOSSquareCard({
  day,
  displayOrder,
  dailyWorkouts,
  setDailyWorkout,
}: IOSSquareCardProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const macroEmojis = useMemo(
    () =>
      t('results.macroEmojis', {
        returnObjects: true,
      }) as Record<string, string>,
    [t]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return createDraggableCard({
      element,
      dayData: day,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [day]);

  return (
    <div
      ref={ref}
      className="aspect-square bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-grab p-4 flex flex-col"
      data-dragging={isDragging ? 'true' : 'false'}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* 头部：天数和类型 */}
      <div className="flex flex-col items-center mb-3">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
          {t('results.dayNumber', { day: displayOrder })}
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {getDayTypeDisplay(day.type, t)}
        </div>
      </div>

      {/* 训练项目选择 */}
      <div
        className="mb-3 flex-shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">
          🏋️ {t('results.workout')}
        </label>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <Select
            value={dailyWorkouts[day.day] || ''}
            onValueChange={useCallback(
              (value: string) => setDailyWorkout(day.day, value),
              [day.day, setDailyWorkout]
            )}
          >
            <SelectTrigger className="h-7 text-xs w-full border-slate-200 dark:border-slate-700">
              <SelectValue placeholder={t('results.selectWorkout')} />
            </SelectTrigger>
            <SelectContent sideOffset={4}>
              {getWorkoutTypes(t).map((workout) => (
                <SelectItem key={workout.value} value={workout.value}>
                  <span className="flex items-center gap-1">
                    <span>{workout.emoji}</span>
                    <span>{workout.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 营养数据 - 紧凑布局 */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-1">
              <span className="text-xs">{macroEmojis.carbs ?? '🍞'}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {t('results.carbs')}
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {day.carbs}g
            </div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-1">
              <span className="text-xs">{macroEmojis.fat ?? '🥑'}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {t('results.fat')}
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {day.fat}g
            </div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-1">
              <span className="text-xs">{macroEmojis.protein ?? '🥩'}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {t('results.protein')}
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {day.protein}g
            </div>
          </div>
        </div>

        {/* 热量信息 */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-600 space-y-1">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              🔥 {t('results.totalCalories')}
            </div>
            <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">
              {day.calories}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              📈 {t('results.calorieDeficit')}
            </div>
            <div
              className={`font-semibold text-xs ${
                day.caloriesDiff > 0
                  ? 'text-green-600 dark:text-green-400'
                  : day.caloriesDiff < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
              }`}
            >
              {day.caloriesDiff > 0 ? '+' : ''}
              {day.caloriesDiff}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IOSGridLayoutProps {
  orderedDays: DayData[];
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  onDrop: (dragData: DragData, targetIndex: number) => void;
  dayMealPlans: Record<number, DayMealPlan>;
  foodLibrary: FoodItem[];
  onMealSlotChange: (
    dayNumber: number,
    slotId: MealSlotId,
    portions: MealPortion[]
  ) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  showMealSlots: boolean;
}

export function IOSGridLayout({
  orderedDays,
  dailyWorkouts,
  setDailyWorkout,
  onDrop,
  dayMealPlans,
  foodLibrary,
  onMealSlotChange,
  onAddCustomFood,
  showMealSlots,
}: IOSGridLayoutProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 为网格容器添加拖放支持
  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    return createGridDropTarget({
      element,
      onDrop: (dragData, targetIndex) => {
        setDragOverIndex(null);
        onDrop(dragData, targetIndex);
      },
      onDragLeave: () => setDragOverIndex(null),
    });
  }, [onDrop]);

  return (
    <div ref={gridRef} className="grid grid-cols-2 gap-4 p-2 max-w-2xl mx-auto">
      {orderedDays.map((day, index) => {
        const mealPlanForDay = dayMealPlans[day.day] || normalizeDayMealPlan();
        return (
          <DropZoneWrapper
            key={`ios-card-${day.day}`}
            index={index}
            isDraggedOver={dragOverIndex === index}
          >
            <div className="flex flex-col gap-3">
              {showMealSlots && (
                <MealSlotPlanner
                  dayNumber={day.day}
                  dayMealPlan={mealPlanForDay}
                  foodLibrary={foodLibrary}
                  onUpdateSlot={(slotId, portions) =>
                    onMealSlotChange(day.day, slotId, portions)
                  }
                  onAddCustomFood={onAddCustomFood}
                  targetMacros={{
                    carbs: day.carbs,
                    protein: day.protein,
                    fat: day.fat,
                    calories: day.calories,
                  }}
                  className="flex-1"
                />
              )}
              <IOSSquareCard
                day={day}
                displayOrder={index + 1}
                dailyWorkouts={dailyWorkouts}
                setDailyWorkout={setDailyWorkout}
              />
            </div>
          </DropZoneWrapper>
        );
      })}
    </div>
  );
}

interface DropZoneWrapperProps {
  children: React.ReactNode;
  index: number;
  isDraggedOver: boolean;
}

function DropZoneWrapper({
  children,
  index,
  isDraggedOver,
}: DropZoneWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return createCellDropTarget({ element, index });
  }, [index]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-200 ${
        isDraggedOver
          ? 'scale-105 shadow-lg ring-2 ring-blue-400 ring-opacity-50'
          : ''
      }`}
    >
      {children}
    </div>
  );
}
