import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const displayServing = food
    ? food.defaultServingKey
      ? t(food.defaultServingKey)
      : food.defaultServing
    : '';

  const preparationLabel = food?.preparation
    ? food.preparation === 'raw'
      ? t('mealPlanner.preparationRaw')
      : t('mealPlanner.preparationCooked')
    : '';

  const unitLabel = food?.servingUnit
    ? t(`mealPlanner.servingUnits.${food.servingUnit}`)
    : '';

  const servingLine = unitLabel
    ? displayServing
      ? `${unitLabel} · ${displayServing}`
      : unitLabel
    : displayServing;

  const getInputLabel = (unit?: string) => {
    switch (unit) {
      case 'per_100g':
        return t('mealPlanner.servingInputLabel.per_100g');
      case 'per_100ml':
        return t('mealPlanner.servingInputLabel.per_100ml');
      case 'per_piece':
        return t('mealPlanner.servingInputLabel.per_piece');
      case 'per_half_piece':
        return t('mealPlanner.servingInputLabel.per_half_piece');
      default:
        return t('mealPlanner.servingInputLabel.default');
    }
  };

  const getInputSuffix = (unit?: string) => {
    switch (unit) {
      case 'per_100g':
        return t('mealPlanner.servingInputSuffix.per_100g');
      case 'per_100ml':
        return t('mealPlanner.servingInputSuffix.per_100ml');
      default:
        return '';
    }
  };

  const inputLabel = getInputLabel(food?.servingUnit);
  const inputSuffix = getInputSuffix(food?.servingUnit);
  const inputStep = getInputStep(food?.servingUnit);
  const inputValue = convertServingsToInput(
    portion.servings,
    food?.servingUnit
  );

  const macroEmojis = t('mealPlanner.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

  const macroBadges = [
    { icon: food?.emoji || '🍽️', value: servingLine || '' },
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
    { icon: '🔥', value: Math.round(macros.calories) },
  ];

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {displayName}
          </span>
          {servingLine && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {servingLine}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden
        />
      </button>

      {isExpanded && (
        <div className="relative border-t border-slate-200 px-3 py-3 dark:border-slate-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 text-slate-500 hover:text-slate-700 dark:text-slate-300"
            onClick={onRemove}
            aria-label={t('mealPlanner.removeFood')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {preparationLabel && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {preparationLabel}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            {macroBadges.map((badge) => (
              <span key={badge.icon} className="inline-flex items-center gap-1">
                <span>{badge.icon}</span>
                {badge.value !== '' && (
                  <span>
                    {typeof badge.value === 'number'
                      ? badge.value
                      : badge.value}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-start gap-2 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                {inputLabel}
              </label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  step={inputStep}
                  min="0"
                  value={Number.isFinite(inputValue) ? inputValue : ''}
                  onChange={(event) => onPortionInputChange(event.target.value)}
                  className="h-8 w-20 text-xs"
                />
                {inputSuffix && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {inputSuffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
