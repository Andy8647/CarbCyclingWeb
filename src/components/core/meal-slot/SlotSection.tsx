import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { ChevronDown, ChevronUp, MinusCircle, Plus, X } from 'lucide-react';
import { useSlotManagement } from '@/lib/hooks/use-slot-management';
import { useQuickForm } from '@/lib/hooks/use-quick-form';
import {
  buildFoodLookup,
  calculateSlotTotals,
  getMealSlotDefinition,
  formatBadgeValue,
  getDefaultInputValue,
  getInputStep,
} from '@/lib/meal-planner';
import { CreateOrUpdateFoodModal } from '@/components/core/food-library';
import { PortionCard } from './PortionCard';
import { FoodSelect, type LocalizedFoodOption } from './FoodSelect';
import type { SlotSectionProps } from './types';

export function SlotSection({
  slotId,
  portions,
  foodLibrary,
  onUpdate,
  onAddCustomFood,
  allowRemove,
  onRemoveSlot,
}: SlotSectionProps) {
  const { t } = useTranslation();
  const slotDefinition = getMealSlotDefinition(slotId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);

  const { quickForm, resetQuickForm, handleQuickFormFieldChange } =
    useQuickForm();

  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);

  const {
    expandedPortions,
    setExpandedPortions,
    toggleExpandedPortion,
    handleAddPortion: addPortion,
    handlePortionInputChange,
    handleRemovePortion,
    handleQuickAddFood,
  } = useSlotManagement({ portions, onUpdate, foodLookup });

  const localizedFoodLibrary = useMemo<LocalizedFoodOption[]>(() => {
    const mapped = foodLibrary.map((food) => ({
      food,
      name: food.nameKey ? t(food.nameKey) : food.name,
      serving: food.defaultServingKey
        ? t(food.defaultServingKey)
        : food.defaultServing,
      unitLabel: food.servingUnit
        ? t(`mealPlanner.servingUnits.${food.servingUnit}`)
        : '',
    }));

    return mapped.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [foodLibrary, t]);

  const selectedFood = selectedFoodId ? foodLookup[selectedFoodId] : undefined;

  const macroEmojis = t('mealPlanner.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

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

  useEffect(() => {
    setExpandedPortions((prev) => {
      const next: Record<string, boolean> = {};
      portions.forEach((portion) => {
        next[portion.id] = prev[portion.id] ?? false;
      });
      return next;
    });
  }, [portions, setExpandedPortions]);

  useEffect(() => {
    if (pendingFoodId && foodLookup[pendingFoodId]) {
      const newFood = foodLookup[pendingFoodId];
      setSelectedFoodId(pendingFoodId);
      setServings(newFood ? getDefaultInputValue(newFood.servingUnit) : 1);
      setPendingFoodId(null);
    }
  }, [pendingFoodId, foodLookup]);

  useEffect(() => {
    if (selectedFoodId) {
      const food = foodLookup[selectedFoodId];
      if (food) {
        setServings(getDefaultInputValue(food.servingUnit));
      }
    }
  }, [selectedFoodId, foodLookup]);

  useEffect(() => {
    if (!isAdding && showQuickAdd) {
      setShowQuickAdd(false);
      resetQuickForm();
    }
  }, [isAdding, showQuickAdd, resetQuickForm]);

  const totals = useMemo(
    () => calculateSlotTotals(portions, foodLookup),
    [portions, foodLookup]
  );

  const headerMacroBadges = [
    {
      icon: macroEmojis?.carbs ?? '🍚',
      value: formatBadgeValue(totals.carbs),
    },
    {
      icon: macroEmojis?.protein ?? '🍖',
      value: formatBadgeValue(totals.protein),
    },
    {
      icon: macroEmojis?.fat ?? '🥜',
      value: formatBadgeValue(totals.fat),
    },
  ];

  const handleAddInputChange = (value: string) => {
    if (value === '') {
      setServings(0);
      return;
    }
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;
    setServings(parsed);
  };

  const handleAddPortion = () => {
    const newPortion = addPortion(selectedFoodId, servings);
    if (newPortion) {
      const food = foodLookup[selectedFoodId];
      setShowQuickAdd(false);
      setServings(getDefaultInputValue(food?.servingUnit));
      setIsAdding(false);
    }
  };

  const handleToggleAdding = () => {
    setIsCollapsed(false);
    setIsAdding((prev) => {
      const next = !prev;
      if (!prev) {
        const defaultValue = selectedFood
          ? getDefaultInputValue(selectedFood.servingUnit)
          : 1;
        setServings(defaultValue);
        setShowQuickAdd(false);
      }
      if (prev) {
        setShowQuickAdd(false);
      }
      return next;
    });
  };

  const handleQuickAddCancel = () => {
    setShowQuickAdd(false);
    resetQuickForm();
  };

  const handleQuickAddSubmit = () => {
    const newFood = handleQuickAddFood(quickForm, onAddCustomFood);
    if (newFood) {
      setPendingFoodId(newFood.id);
      setShowQuickAdd(false);
      resetQuickForm();
    }
  };

  getInputLabel(selectedFood?.servingUnit);
  const addInputSuffix = getInputSuffix(selectedFood?.servingUnit);
  const addInputStep = getInputStep(selectedFood?.servingUnit);
  const addInputValue = Number.isFinite(servings) ? servings : '';

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60">
      <div className="flex items-center justify-between px-3 py-1">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {slotDefinition.icon}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t(slotDefinition.translationKey)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setIsCollapsed((prev) => {
                const next = !prev;
                if (next) {
                  setIsAdding(false);
                  setShowQuickAdd(false);
                }
                return next;
              });
            }}
            aria-label={
              isCollapsed
                ? t('mealPlanner.showMealSlots')
                : t('mealPlanner.hideMealSlots')
            }
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleToggleAdding}
            aria-label={t('mealPlanner.addFoodToSlot')}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {allowRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRemoveSlot}
              aria-label={t('mealPlanner.removeSlot', {
                slot: t(slotDefinition.translationKey),
              })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && portions.length > 0 && (
        <div className="px-3 pb-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {headerMacroBadges.map((badge) => (
              <span
                key={`${slotId}-${badge.icon}`}
                className="inline-flex items-center gap-1"
              >
                <span>{badge.icon}</span>
                <span>{badge.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="px-3 py-2 space-y-2">
          {portions.length === 0 && !isAdding && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MinusCircle className="h-3.5 w-3.5" />
              <span>{t('mealPlanner.emptySlotHint')}</span>
            </div>
          )}

          {portions.map((portion) => (
            <PortionCard
              key={portion.id}
              portion={portion}
              food={foodLookup[portion.foodId]}
              isExpanded={expandedPortions[portion.id] ?? false}
              onToggleExpanded={() => toggleExpandedPortion(portion.id)}
              onRemove={() => handleRemovePortion(portion.id)}
              onPortionInputChange={(value) =>
                handlePortionInputChange(portion.id, value)
              }
            />
          ))}

          {isAdding && (
            <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-2 space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t('mealPlanner.chooseFood')}
              </label>
              <div className="flex flex-col gap-2">
                <FoodSelect
                  selectedFoodId={selectedFoodId}
                  foodLookup={foodLookup}
                  options={localizedFoodLibrary}
                  placeholder={t('mealPlanner.searchPlaceholder')}
                  quickAddLabel={t('mealPlanner.quickAddLabel')}
                  onValueChange={(value) => {
                    setIsCollapsed(false);
                    if (value === '__add_new_food__') {
                      resetQuickForm();
                      setShowQuickAdd(true);
                      setSelectedFoodId('');
                      setServings(1);
                      return;
                    }
                    setShowQuickAdd(false);
                    setSelectedFoodId(value);
                    const targetFood = foodLookup[value];
                    setServings(getDefaultInputValue(targetFood?.servingUnit));
                  }}
                />

                <NumberInput
                  min={0}
                  step={addInputStep}
                  value={addInputValue}
                  onChange={handleAddInputChange}
                  unit={addInputSuffix}
                  className="h-8 w-full text-xs"
                />

                <Button
                  size="sm"
                  onClick={handleAddPortion}
                  disabled={!selectedFoodId}
                  className="w-full"
                >
                  {t('mealPlanner.addFood')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateOrUpdateFoodModal
        open={showQuickAdd}
        mode="create"
        formState={quickForm}
        onClose={handleQuickAddCancel}
        onSubmit={handleQuickAddSubmit}
        onFieldChange={handleQuickFormFieldChange}
      />
    </div>
  );
}
