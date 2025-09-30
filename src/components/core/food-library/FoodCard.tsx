import { useRef, useEffect, useState } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Edit3, GripVertical } from 'lucide-react';
import type { LocalizedFood } from '@/lib/hooks/use-food-library-filters';

interface FoodCardProps {
  category: string;
  localizedFood: LocalizedFood;
  onEditFood: (foodId: string) => void;
}

export function FoodCard({
  category,
  localizedFood,
  onEditFood,
}: FoodCardProps) {
  const { t } = useTranslation();
  const { food, name } = localizedFood;
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: 'food-card',
        foodId: food.id,
        category: category,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [food.id, category]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({
        type: 'food-card',
        foodId: food.id,
        category: category,
      }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [food.id, category]);

  return (
    <div
      ref={cardRef}
      className={`group rounded border cursor-grab active:cursor-grabbing transition-all flex ${
        isDragging
          ? 'opacity-50 border-blue-400 dark:border-blue-500 shadow-md'
          : isOver
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm'
      }`}
    >
      {/* Drag handle - left side, full height */}
      <div className="flex items-center justify-center w-6 border-r border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" />
      </div>

      {/* Card content */}
      <div className="flex-1 p-2">
        {/* Compact header */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEditFood(food.id);
              }}
            >
              <Edit3 className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>

        {/* Compact nutrition info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {t('mealPlanner.macroEmojis.carbs')}
              {food.macros.carbs}
            </span>
            <span>
              {t('mealPlanner.macroEmojis.protein')}
              {food.macros.protein}
            </span>
            <span>
              {t('mealPlanner.macroEmojis.fat')}
              {food.macros.fat}
            </span>
          </div>
          <span>
            {t('mealPlanner.caloriesShort', { value: food.macros.calories })}
          </span>
        </div>
      </div>
    </div>
  );
}
