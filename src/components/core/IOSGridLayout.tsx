import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getWorkoutTypes } from '@/lib/calculator';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type {
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';
import { normalizeDayMealPlan } from '@/lib/meal-planner';
import { MealSlotPlanner } from './MealSlotPlanner';

const getDayTypeDisplay = (type: string, t: (key: string) => string) => {
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
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  mealPlan: DayMealPlan;
  foodLibrary: FoodItem[];
  onUpdateMealSlot: (
    dayNumber: number,
    slotId: MealSlotId,
    portions: MealPortion[]
  ) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
}

function IOSSquareCard({
  day,
  dailyWorkouts,
  setDailyWorkout,
  mealPlan,
  foodLibrary,
  onUpdateMealSlot,
  onAddCustomFood,
}: IOSSquareCardProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showMeals, setShowMeals] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'card',
          day: day.day,
          dayData: day,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })
    );
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
          {t('results.dayNumber', { day: day.day })}
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
            onValueChange={(value) => setDailyWorkout(day.day, value)}
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
              <span className="text-xs">🍚</span>
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
              <span className="text-xs">🥜</span>
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
              <span className="text-xs">🥩</span>
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

      <div className="mt-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowMeals((prev) => !prev)}
        >
          {showMeals
            ? t('mealPlanner.hideMealsForDay')
            : t('mealPlanner.showMealsForDay')}
        </Button>
        {showMeals && (
          <MealSlotPlanner
            dayNumber={day.day}
            dayMealPlan={mealPlan}
            foodLibrary={foodLibrary}
            onUpdateSlot={(slotId, portions) =>
              onUpdateMealSlot(day.day, slotId, portions)
            }
            onAddCustomFood={onAddCustomFood}
            targetMacros={{
              carbs: day.carbs,
              protein: day.protein,
              fat: day.fat,
              calories: day.calories,
            }}
          />
        )}
      </div>
    </div>
  );
}

interface DragData {
  type: string;
  day: number;
  dayData: DayData;
}

interface IOSGridLayoutProps {
  orderedDays: DayData[];
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  onDrop: (dragData: DragData, targetIndex: number) => void;
  foodLibrary: FoodItem[];
  dayMealPlans: Record<number, DayMealPlan>;
  onMealSlotChange: (
    dayNumber: number,
    slotId: MealSlotId,
    portions: MealPortion[]
  ) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
}

export function IOSGridLayout({
  orderedDays,
  dailyWorkouts,
  setDailyWorkout,
  onDrop,
  foodLibrary,
  dayMealPlans,
  onMealSlotChange,
  onAddCustomFood,
}: IOSGridLayoutProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 为网格容器添加拖放支持
  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === 'card',
      onDragEnter: () => {},
      onDragLeave: () => setDragOverIndex(null),
      onDrop: ({ source, location }) => {
        setDragOverIndex(null);

        // 获取拖放的目标位置
        const dropTargets = location.current.dropTargets;
        if (dropTargets.length > 0) {
          const targetIndex = dropTargets[0].data.gridIndex as number;
          if (typeof targetIndex === 'number') {
            onDrop(source.data as unknown as DragData, targetIndex);
          }
        }
      },
    });
  }, [onDrop]);

  return (
    <div ref={gridRef} className="grid grid-cols-2 gap-4 p-2 max-w-2xl mx-auto">
      {orderedDays.map((day, index) => {
        const mealPlanForDay =
          dayMealPlans[day.day] || normalizeDayMealPlan();

        return (
          <DropZoneWrapper
            key={`ios-card-${day.day}`}
            index={index}
            isDraggedOver={dragOverIndex === index}
          >
            <IOSSquareCard
              day={day}
              dailyWorkouts={dailyWorkouts}
              setDailyWorkout={setDailyWorkout}
              mealPlan={mealPlanForDay}
              foodLibrary={foodLibrary}
              onUpdateMealSlot={onMealSlotChange}
              onAddCustomFood={onAddCustomFood}
            />
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

    return dropTargetForElements({
      element,
      getData: () => ({ gridIndex: index }),
      canDrop: ({ source }) => source.data.type === 'card',
      onDragEnter: () => {},
      onDragLeave: () => {},
    });
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
