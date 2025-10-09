import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { getWorkoutTypes } from '@/lib/calculator';
import { getDayTypeDisplay } from '@/lib/result-card-logic';
import type { DayData } from '@/lib/result-card-logic';

interface DraggableCardProps {
  day: DayData;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  macroEmojis: Record<string, string>;
}

export function DraggableCard({
  day,
  dailyWorkouts,
  setDailyWorkout,
  macroEmojis,
}: DraggableCardProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      className="p-3 bg-white dark:bg-card cursor-grab h-full"
      data-dragging={isDragging ? 'true' : 'false'}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Day type label */}
      <div className="flex justify-center mb-3">
        <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
          {getDayTypeDisplay(day.type, t)}
        </div>
      </div>

      {/* Workout selection */}
      <div
        className="mb-3"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block whitespace-nowrap">
          🏋️ {t('results.workout')}
        </label>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <Select
            value={dailyWorkouts[day.day] || ''}
            onValueChange={(value) => setDailyWorkout(day.day, value)}
          >
            <SelectTrigger className="h-8 text-xs w-full">
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

      {/* Nutrition data */}
      <div className="space-y-2.5">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
          📊 {t('results.nutritionBreakdown')}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">{macroEmojis.carbs ?? 'C'}</span>
              <span className="text-xs">{t('results.carbs')}</span>
            </div>
            <div className="font-semibold text-xs">{day.carbs}g</div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">{macroEmojis.fat ?? 'F'}</span>
              <span className="text-xs">{t('results.fat')}</span>
            </div>
            <div className="font-semibold text-xs">{day.fat}g</div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">{macroEmojis.protein ?? 'P'}</span>
              <span className="text-xs">{t('results.protein')}</span>
            </div>
            <div className="font-semibold text-xs">{day.protein}g</div>
          </div>
        </div>

        {/* Calorie information */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500 whitespace-nowrap">
              🔥 {t('results.totalCalories')}
            </div>
            <div className="font-semibold text-xs">{day.calories}kCal</div>
          </div>
        </div>
      </div>
    </div>
  );
}
