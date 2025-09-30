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

export function PortionCard({
  portion,
  food,
  onRemove,
  onPortionInputChange,
}: PortionCardProps) {
  const { t } = useTranslation();

  const macros = food
    ? calculatePortionMacros(food, portion.servings)
    : { carbs: 0, protein: 0, fat: 0, calories: 0 };

  const displayName = food
    ? food.nameKey
      ? t(food.nameKey)
      : food.name
    : t('mealPlanner.unknownFood');

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
  const inputValue = convertServingsToInput(
    portion.servings,
    food?.servingUnit
  );

  const macroEmojis = t('mealPlanner.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

  const collapsedMacroBadges = [
    {
      icon: macroEmojis?.carbs ?? '🍚',
      value: formatBadgeValue(macros.carbs),
    },
    {
      icon: macroEmojis?.protein ?? '🥩',
      value: formatBadgeValue(macros.protein),
    },
    {
      icon: macroEmojis?.fat ?? '🥜',
      value: formatBadgeValue(macros.fat),
    },
  ];

  return (
    <div className="px-3 py-2">
      <div className="flex flex-col items-start text-left flex-1 min-w-0">
        <div className="flex items-center justify-between w-full gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {displayName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-500 hover:text-red-600 dark:text-slate-300"
            onClick={onRemove}
            aria-label={t('mealPlanner.removeFood')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center justify-between w-full gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <div className="flex items-center gap-1">
            {collapsedMacroBadges.map((badge) => (
              <span
                key={badge.icon}
                className="inline-flex items-center gap-0.5"
              >
                <span>{badge.icon}</span>
                <span>{badge.value}</span>
              </span>
            ))}
          </div>
          <NumberInput
            step={inputStep}
            min={0}
            value={Number.isFinite(inputValue) ? inputValue : ''}
            onChange={onPortionInputChange}
            unit={inputSuffix}
            className="h-6 w-12 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
