import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MinusCircle, Plus, X } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import {
  buildFoodLookup,
  calculateSlotTotals,
  createMealPortion,
  getMealSlotDefinition,
} from '@/lib/meal-planner';
import {
  convertInputToServings,
  formatBadgeValue,
  getDefaultInputValue,
  getInputStep,
  roundToTwo,
} from '@/lib/meal-slot-utils';
import { PortionCard } from './PortionCard';
import { QuickAddModal } from './QuickAddModal';
import type { SlotSectionProps, QuickAddFormState } from './types';

const QUICK_FORM_DEFAULTS: QuickAddFormState = {
  name: '',
  category: '',
  defaultServing: '',
  servingUnit: 'per_100g',
  carbs: '',
  protein: '',
  fat: '',
  preparation: 'raw',
  emoji: '',
};

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
  const { toast } = useToast();
  const slotDefinition = getMealSlotDefinition(slotId);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);
  const [quickForm, setQuickForm] =
    useState<QuickAddFormState>(QUICK_FORM_DEFAULTS);
  const [expandedPortions, setExpandedPortions] = useState<
    Record<string, boolean>
  >({});

  const resetQuickForm = useCallback(
    () => setQuickForm({ ...QUICK_FORM_DEFAULTS }),
    []
  );

  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);

  const localizedFoodLibrary = useMemo(() => {
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

  const toggleExpandedPortion = useCallback((portionId: string) => {
    setExpandedPortions((prev) => ({
      ...prev,
      [portionId]: !prev[portionId],
    }));
  }, []);

  useEffect(() => {
    setExpandedPortions((prev) => {
      const next: Record<string, boolean> = {};
      portions.forEach((portion) => {
        next[portion.id] = prev[portion.id] ?? false;
      });
      return next;
    });
  }, [portions]);

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
    if (!selectedFoodId) return;
    const food = foodLookup[selectedFoodId];
    if (!food) return;
    const normalizedInput = Math.max(Number(servings) || 0, 0);
    if (!normalizedInput) return;

    const normalizedServings = convertInputToServings(
      normalizedInput,
      food.servingUnit
    );
    if (normalizedServings <= 0) return;

    const newPortion = createMealPortion(
      selectedFoodId,
      roundToTwo(normalizedServings)
    );
    onUpdate([...portions, newPortion]);
    setShowQuickAdd(false);
    setServings(getDefaultInputValue(food.servingUnit));
    setIsAdding(false);
    setExpandedPortions((prev) => ({ ...prev, [newPortion.id]: true }));
  };

  const handlePortionInputChange = (portionId: string, value: string) => {
    const food =
      foodLookup[portions.find((p) => p.id === portionId)?.foodId ?? ''];

    if (value === '') return;
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;

    const normalized = convertInputToServings(parsed, food?.servingUnit);

    if (normalized <= 0) {
      onUpdate(portions.filter((portion) => portion.id !== portionId));
      setExpandedPortions((prev) => {
        if (!prev[portionId]) return prev;
        const next = { ...prev };
        delete next[portionId];
        return next;
      });
      return;
    }

    onUpdate(
      portions.map((portion) =>
        portion.id === portionId
          ? {
              ...portion,
              servings: roundToTwo(normalized),
            }
          : portion
      )
    );
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
    const carbs = parseFloat(quickForm.carbs);
    const protein = parseFloat(quickForm.protein);
    const fat = parseFloat(quickForm.fat);

    if (
      !quickForm.name.trim() ||
      !quickForm.defaultServing.trim() ||
      Number.isNaN(carbs) ||
      Number.isNaN(protein) ||
      Number.isNaN(fat)
    ) {
      toast({
        variant: 'destructive',
        title: t('mealPlanner.addFoodErrorTitle'),
        description: t('mealPlanner.addFoodErrorDescription'),
      });
      return;
    }

    const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);

    const newFood = onAddCustomFood({
      name: quickForm.name.trim(),
      category: quickForm.category.trim() || t('mealPlanner.customCategory'),
      defaultServing: quickForm.defaultServing.trim(),
      servingUnit: quickForm.servingUnit,
      macros: {
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        calories,
      },
      preparation: quickForm.preparation,
      emoji:
        quickForm.emoji.trim() ||
        (quickForm.preparation === 'raw' ? '🥕' : '🍽️'),
    });

    setPendingFoodId(newFood.id);
    setShowQuickAdd(false);
    resetQuickForm();
    toast({
      variant: 'success',
      title: t('mealPlanner.customFoodAdded'),
    });
  };

  const handleRemove = (portionId: string) => {
    onUpdate(portions.filter((portion) => portion.id !== portionId));
    setExpandedPortions((prev) => {
      if (!prev[portionId]) return prev;
      const next = { ...prev };
      delete next[portionId];
      return next;
    });
  };

  const addInputLabel = getInputLabel(selectedFood?.servingUnit);
  const addInputSuffix = getInputSuffix(selectedFood?.servingUnit);
  const addInputStep = getInputStep(selectedFood?.servingUnit);
  const addInputValue = Number.isFinite(servings) ? servings : '';

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {slotDefinition.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t(slotDefinition.translationKey)}
            </span>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
            onRemove={() => handleRemove(portion.id)}
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
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedFoodId}
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
              >
                <SelectTrigger className="h-8 w-48 text-xs">
                  <SelectValue
                    placeholder={t('mealPlanner.searchPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {localizedFoodLibrary.map(
                    ({ food, name, serving, unitLabel }) => (
                      <SelectItem key={food.id} value={food.id}>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium flex items-center gap-1">
                            <span>{food.emoji || '🍽️'}</span>
                            <span>{name}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            {unitLabel && <span>{unitLabel}</span>}
                            {unitLabel && serving && <span>·</span>}
                            {serving && <span>{serving}</span>}
                            {food.preparation && (
                              <span>
                                {food.preparation === 'raw'
                                  ? t('mealPlanner.preparationShort.raw')
                                  : t('mealPlanner.preparationShort.cooked')}
                              </span>
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  )}
                  <SelectItem value="__add_new_food__">
                    <span className="text-xs">
                      ➕ {t('mealPlanner.quickAddLabel')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-600 dark:text-slate-300">
                  {addInputLabel}
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={addInputStep}
                  value={addInputValue}
                  onChange={(event) => handleAddInputChange(event.target.value)}
                  className="h-8 w-24 text-xs"
                />
                {addInputSuffix && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {addInputSuffix}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={handleAddPortion}
                disabled={!selectedFoodId}
              >
                {t('mealPlanner.addFood')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <QuickAddModal
        open={showQuickAdd}
        onClose={handleQuickAddCancel}
        formState={quickForm}
        onFormChange={setQuickForm}
        onSubmit={handleQuickAddSubmit}
      />
    </div>
  );
}
