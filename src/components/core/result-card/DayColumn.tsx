import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DraggableCard } from './DraggableCard';
import { MealSlotPlanner } from '../MealSlotPlanner';
import type { DragData, DayData } from '@/lib/result-card-logic';
import type {
  DayMealPlan,
  FoodItem,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';

interface DayColumnProps {
  columnIndex: number;
  day: DayData;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  onDrop: (dragData: DragData, columnIndex: number) => void;
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
  macroIcons: Record<'carbs' | 'protein' | 'fat', string>;
}

export function DayColumn({
  columnIndex,
  day,
  dailyWorkouts,
  setDailyWorkout,
  onDrop,
  mealPlan,
  foodLibrary,
  onUpdateMealSlot,
  onAddCustomFood,
  macroIcons,
}: DayColumnProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [showMealSlots, setShowMealSlots] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ columnIndex }),
      canDrop: ({ source }) => source.data.type === 'card',
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        onDrop(source.data as unknown as DragData, columnIndex);
      },
    });
  }, [columnIndex, onDrop]);

  return (
    <div
      ref={ref}
      className={`flex-1 min-w-[120px] max-w-[280px] ${
        isDraggedOver ? 'bg-blue-50/30 dark:bg-blue-900/20 rounded-lg' : ''
      }`}
    >
      {/* Fixed column header - not draggable */}
      <div className="mb-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {t('results.dayNumber').replace(
              '{{day}}',
              (columnIndex + 1).toString()
            )}
          </h3>
          {day && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowMealSlots(!showMealSlots)}
            >
              {showMealSlots ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  {t('mealPlanner.hideMealSlots')}
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  {t('mealPlanner.showMealSlots')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Card container area */}
      <div
        className={`min-h-[300px] rounded-xl border-2 border-dashed ${
          isDraggedOver
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 border-solid'
            : 'border-slate-300/50 dark:border-slate-600/50'
        }`}
      >
        {day && (
          <DraggableCard
            day={day}
            dailyWorkouts={dailyWorkouts}
            setDailyWorkout={setDailyWorkout}
            macroEmojis={macroIcons}
          />
        )}
        {!day && (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm">{t('results.dropCardHere')}</div>
            </div>
          </div>
        )}
      </div>

      {day && showMealSlots && (
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
  );
}
