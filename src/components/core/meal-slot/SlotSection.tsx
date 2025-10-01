import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import {
  ChevronDown,
  ChevronRight,
  MinusCircle,
  Plus,
  Trash2,
} from 'lucide-react';
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
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from '@/lib/utils';

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
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  const { quickForm, resetQuickForm, handleQuickFormFieldChange } =
    useQuickForm();

  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);

  const {
    handleAddPortion: addPortion,
    handlePortionInputChange,
    handleRemovePortion,
    handleQuickAddFood,
  } = useSlotManagement({ portions, onUpdate, foodLookup });

  const localizedFoodLibrary = useMemo<LocalizedFoodOption[]>(() => {
    const mapped = foodLibrary.map((food) => ({
      food,
      name: food.name,
      serving: food.defaultServing,
      unitLabel: food.servingUnit
        ? t(`mealPlanner.servingUnits.${food.servingUnit}`)
        : '',
    }));

    return mapped.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [foodLibrary, t]);

  const selectedFood = selectedFoodId ? foodLookup[selectedFoodId] : undefined;

  const macroLabels = t('mealPlanner.macroLabels', {
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
      icon: macroLabels?.carbs ?? 'C',
      value: formatBadgeValue(totals.carbs),
    },
    {
      icon: macroLabels?.protein ?? 'P',
      value: formatBadgeValue(totals.protein),
    },
    {
      icon: macroLabels?.fat ?? 'F',
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

  useEffect(() => {
    const element = slotRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === 'food-card',
      onDragEnter: ({ source }) => {
        if (source.data.type !== 'food-card') return;
        setIsDragOver(true);
      },
      onDragLeave: () => {
        setIsDragOver(false);
      },
      onDrop: ({ source }) => {
        setIsDragOver(false);
        const data = source.data as { type?: string; foodId?: string };
        if (data.type !== 'food-card' || !data.foodId) {
          return;
        }

        const droppedFood = foodLookup[data.foodId];
        if (!droppedFood) {
          return;
        }

        const defaultServings = getDefaultInputValue(droppedFood.servingUnit);
        addPortion(data.foodId, defaultServings);
        setIsCollapsed(false);
        setIsAdding(false);
        setShowQuickAdd(false);
      },
    });
  }, [foodLookup, addPortion]);

  return (
    <div
      ref={slotRef}
      className={cn(
        'h-fit flex flex-col border-b border-slate-200 dark:border-slate-700 transition-all',
        isDragOver &&
          'ring-2 ring-blue-300 dark:ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-blue-50/40 dark:bg-blue-900/20'
      )}
    >
      {/* Header with meal title and controls */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed
                ? t('mealPlanner.expandSlot')
                : t('mealPlanner.collapseSlot')
            }
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
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
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Macro summary badges - always visible */}
      <div className="px-3 py-1">
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

      {/* Content area - only show when not collapsed */}
      {!isCollapsed && (
        <div className="p-1 flex-1">
          {portions.length === 0 && !isAdding && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center py-4">
              <MinusCircle className="h-3.5 w-3.5" />
              <span>{t('mealPlanner.emptySlotHint')}</span>
            </div>
          )}

          {portions.length > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {portions.map((portion) => (
                <PortionCard
                  key={portion.id}
                  portion={portion}
                  food={foodLookup[portion.foodId]}
                  onRemove={() => handleRemovePortion(portion.id)}
                  onPortionInputChange={(value) =>
                    handlePortionInputChange(portion.id, value)
                  }
                />
              ))}
            </div>
          )}

          {isAdding && (
            <div
              className={`p-3 space-y-2 ${portions.length > 0 ? 'mt-3' : ''}`}
            >
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
