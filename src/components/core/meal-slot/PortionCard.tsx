import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Trash2 } from 'lucide-react';
import {
  calculatePortionMacros,
  convertServingsToInput,
  formatBadgeValue,
  getInputStep,
} from '@/lib/meal-planner';
import type { PortionCardProps } from './types';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export function PortionCard({
  portion,
  food,
  onRemove,
  onPortionInputChange,
  slotId,
  dayNumber,
}: PortionCardProps) {
  const { t } = useTranslation();
  const portionRef = useRef<HTMLDivElement>(null);

  const macros = food
    ? calculatePortionMacros(food, portion.servings)
    : { carbs: 0, protein: 0, fat: 0, calories: 0 };

  const displayName = food ? food.name : t('mealPlanner.unknownFood');

  const getInputSuffix = (unit?: string) => {
    switch (unit) {
      case 'per_100g':
        return 'g';
      case 'per_100ml':
        return 'ml';
      case 'per_piece':
      default:
        return '份';
    }
  };

  const inputSuffix = getInputSuffix(food?.servingUnit);
  const inputStep = getInputStep(food?.servingUnit);
  const computedInputValue = convertServingsToInput(
    portion.servings,
    food?.servingUnit
  );
  const inputValue = Number.isFinite(computedInputValue)
    ? String(computedInputValue)
    : '';

  const macroLabels = t('mealPlanner.macroLabels', {
    returnObjects: true,
  }) as Record<string, string>;

  const collapsedMacroBadges = [
    {
      icon: macroLabels?.carbs ?? 'C',
      value: formatBadgeValue(macros.carbs),
    },
    {
      icon: macroLabels?.protein ?? 'P',
      value: formatBadgeValue(macros.protein),
    },
    {
      icon: macroLabels?.fat ?? 'F',
      value: formatBadgeValue(macros.fat),
    },
  ];

  // Make portion draggable
  useEffect(() => {
    const element = portionRef.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: 'portion',
        portionId: portion.id,
        foodId: portion.foodId,
        servings: portion.servings,
        sourceSlotId: slotId,
        sourceDayNumber: dayNumber,
      }),
    });
  }, [portion.id, portion.foodId, portion.servings, slotId, dayNumber]);

  return (
    <div
      ref={portionRef}
      className="px-2 py-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex w-full items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate block">
            {displayName}
          </span>
        </div>
        <div className="w-[68px] flex-shrink-0">
          <NumberInput
            step={inputStep}
            min={0}
            value={inputValue}
            onChange={onPortionInputChange}
            unit={inputSuffix}
            className="h-full text-xs"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0 text-slate-500 hover:text-red-600 dark:text-slate-300"
          onClick={onRemove}
          aria-label={t('mealPlanner.removeFood')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        {collapsedMacroBadges.map((badge) => (
          <span key={badge.icon} className="inline-flex items-center gap-0.5">
            <span>{badge.icon}</span>
            <span>{badge.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
