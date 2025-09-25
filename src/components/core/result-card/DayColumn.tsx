import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DraggableCard } from './DraggableCard';
import type { DragData, DayData } from '@/lib/result-card-logic';

interface DayColumnProps {
  columnIndex: number;
  day: DayData;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  onDrop: (dragData: DragData, columnIndex: number) => void;
  macroIcons: Record<'carbs' | 'protein' | 'fat', string>;
  children?: ReactNode;
  onHeightChange?: (dayId: number, height: number) => void;
  syncedHeight?: number;
  measuredHeight?: number;
}

export function DayColumn({
  columnIndex,
  day,
  dailyWorkouts,
  setDailyWorkout,
  onDrop,
  macroIcons,
  children,
  onHeightChange,
  syncedHeight,
  measuredHeight,
}: DayColumnProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

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

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !onHeightChange) return;

    const updateHeight = () => {
      const measuredHeight = element.getBoundingClientRect().height;

      onHeightChange(day.day, measuredHeight);
    };

    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [day.day, onHeightChange]);

  const extraSpace =
    typeof syncedHeight === 'number' && typeof measuredHeight === 'number'
      ? Math.max(syncedHeight - measuredHeight, 0)
      : 0;

  return (
    <div
      ref={ref}
      className={`flex-1 min-w-[120px] max-w-[280px] ${
        isDraggedOver ? 'bg-blue-50/30 dark:bg-blue-900/20 rounded-lg' : ''
      } flex flex-col`}
    >
      <div ref={contentRef} className="flex flex-col h-full">
        {/* Fixed column header - not draggable */}
        <div className="mb-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <h3 className="font-semibold text-sm">
            {t('results.dayNumber').replace(
              '{{day}}',
              (columnIndex + 1).toString()
            )}
          </h3>
        </div>

        <div className="flex flex-1 flex-col">
          {children ? (
            <div className="mb-3 flex-1 flex flex-col">{children}</div>
          ) : (
            <div className="mb-3 flex-1" />
          )}

          {/* Card container area */}
          <div
            className={`min-h-[300px] rounded-xl border-2 border-dashed ${
              isDraggedOver
                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 border-solid'
                : 'border-slate-300/50 dark:border-slate-600/50'
            } mt-auto`}
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
        </div>
      </div>

      {extraSpace > 0 && (
        <div
          aria-hidden
          className="flex-shrink-0"
          style={{ height: extraSpace }}
        />
      )}
    </div>
  );
}
