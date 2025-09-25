import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Trash2, ChevronDown } from 'lucide-react';
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
  isExpanded,
  onToggleExpanded,
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
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
      <button
        type="button"
        className="flex w-full items-center px-3 py-2"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col items-start text-left flex-1 min-w-0">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {displayName}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform flex-shrink-0 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
              aria-hidden
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
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
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 px-1 py-3 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <NumberInput
              step={inputStep}
              min={0}
              value={Number.isFinite(inputValue) ? inputValue : ''}
              onChange={onPortionInputChange}
              unit={inputSuffix}
              className="h-8 w-20 text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-slate-700 dark:text-slate-300"
              onClick={onRemove}
              aria-label={t('mealPlanner.removeFood')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
