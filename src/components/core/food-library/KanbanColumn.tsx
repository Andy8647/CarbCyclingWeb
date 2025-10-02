import { useState, useRef, useEffect } from 'react';
import {
  monitorForElements,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { FoodCard } from './FoodCard';
import type { LocalizedFood } from '@/lib/hooks/use-food-library-filters';

interface KanbanColumnProps {
  category: string;
  title: string;
  foods: LocalizedFood[];
  onEditFood: (foodId: string) => void;
  onCategoryChange: (foodId: string, newCategory: string) => void;
}

export function KanbanColumn({
  category,
  title,
  foods: initialFoods,
  onEditFood,
  onCategoryChange,
}: KanbanColumnProps) {
  const [foods, setFoods] = useState(initialFoods);
  const [isColumnOver, setIsColumnOver] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setFoods(initialFoods);
  }, [initialFoods]);

  // Make the column itself a drop target for cross-column drops
  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({
        type: 'column',
        category: category,
      }),
      canDrop: ({ source }) => {
        // Accept drops from food cards
        return source.data.type === 'food-card';
      },
      onDragEnter: ({ source }) => {
        // Only highlight if it's from a different category
        if (source.data.category !== category) {
          setIsColumnOver(true);
        }
      },
      onDragLeave: () => setIsColumnOver(false),
      onDrop: () => setIsColumnOver(false),
    });
  }, [category]);

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destinationData = destination.data;

        // Handle cross-column drops (category change)
        if (
          sourceData.category !== category &&
          destinationData.type === 'column' &&
          destinationData.category === category
        ) {
          onCategoryChange(sourceData.foodId as string, category);
          return;
        }

        // Handle reordering within the same column
        if (
          sourceData.category === category &&
          destinationData.category === category &&
          destinationData.type === 'food-card'
        ) {
          const sourceIndex = foods.findIndex(
            (food) => food.food.id === sourceData.foodId
          );
          const destinationIndex = foods.findIndex(
            (food) => food.food.id === destinationData.foodId
          );

          if (sourceIndex === -1 || destinationIndex === -1) return;

          setFoods(
            reorder({
              list: foods,
              startIndex: sourceIndex,
              finishIndex: destinationIndex,
            })
          );
        }
      },
    });
  }, [foods, category, onCategoryChange]);

  return (
    <div
      ref={columnRef}
      className={`flex-1 min-w-64 border-r border-slate-200 dark:border-slate-700 last:border-r-0 transition-colors ${
        isColumnOver
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {/* Column Content */}
      <div className="p-2 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
          {foods.map((localizedFood) => (
            <FoodCard
              key={localizedFood.food.id}
              category={category}
              localizedFood={localizedFood}
              onEditFood={onEditFood}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
