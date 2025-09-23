import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DayMealPlan,
  type FoodItem,
  type MealPortion,
  type MealSlotId,
  type ServingUnit,
  MEAL_SLOT_DEFINITIONS,
  SERVING_UNIT_OPTIONS,
} from '@/lib/persistence-types';
import {
  buildFoodLookup,
  calculateDayTotals,
  calculatePortionMacros,
  calculateSlotTotals,
  createMealPortion,
  getMealSlotDefinition,
} from '@/lib/meal-planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { ChevronDown, MinusCircle, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/lib/use-toast';

interface MealSlotPlannerProps {
  dayNumber: number;
  dayMealPlan: DayMealPlan;
  foodLibrary: FoodItem[];
  onUpdateSlot: (slotId: MealSlotId, portions: MealPortion[]) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  targetMacros: {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  };
}

interface SlotSectionProps {
  slotId: MealSlotId;
  portions: MealPortion[];
  foodLibrary: FoodItem[];
  onUpdate: (portions: MealPortion[]) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  allowRemove: boolean;
  onRemoveSlot: () => void;
}

interface QuickAddFormState {
  name: string;
  category: string;
  defaultServing: string;
  servingUnit: ServingUnit;
  carbs: string;
  protein: string;
  fat: string;
  preparation: 'raw' | 'cooked';
  emoji: string;
}

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

const BASE_MEAL_SLOTS: MealSlotId[] = ['breakfast', 'lunch', 'dinner'];
const ALL_MEAL_SLOT_IDS: MealSlotId[] = MEAL_SLOT_DEFINITIONS.map(
  (slot) => slot.id
);

const deriveVisibleSlots = (plan: DayMealPlan): MealSlotId[] => {
  const base = new Set<MealSlotId>(BASE_MEAL_SLOTS);
  ALL_MEAL_SLOT_IDS.forEach((slotId) => {
    if ((plan[slotId]?.length ?? 0) > 0) {
      base.add(slotId);
    }
  });
  return ALL_MEAL_SLOT_IDS.filter((slotId) => base.has(slotId));
};

function SlotSection({
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

  const isAmountUnit = (unit?: ServingUnit) =>
    unit === 'per_100g' || unit === 'per_100ml';

  const getDefaultInputValue = (unit?: ServingUnit) =>
    isAmountUnit(unit) ? 100 : 1;

  const convertServingsToInput = (value: number, unit?: ServingUnit) => {
    if (!Number.isFinite(value)) return 0;
    if (isAmountUnit(unit)) {
      return Number((value * 100).toFixed(2));
    }
    return value;
  };

  const convertInputToServings = (input: number, unit?: ServingUnit) => {
    if (!Number.isFinite(input)) return 0;
    if (isAmountUnit(unit)) {
      return input / 100;
    }
    return input;
  };

  const roundToTwo = (value: number) => Math.round(value * 100) / 100;

  const [expandedPortions, setExpandedPortions] = useState<
    Record<string, boolean>
  >({});

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

  const getInputLabel = (unit?: ServingUnit) => {
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

  const getInputSuffix = (unit?: ServingUnit) => {
    switch (unit) {
      case 'per_100g':
        return t('mealPlanner.servingInputSuffix.per_100g');
      case 'per_100ml':
        return t('mealPlanner.servingInputSuffix.per_100ml');
      default:
        return '';
    }
  };

  const getInputStep = (unit?: ServingUnit) => {
    if (isAmountUnit(unit)) return 1;
    if (unit === 'per_piece' || unit === 'per_half_piece') return 1;
    return 0.25;
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

  const handlePortionInputChange = (
    portionId: string,
    value: string,
    unit?: ServingUnit
  ) => {
    if (value === '') return;
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;

    const normalized = convertInputToServings(parsed, unit);

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
          <div>
            <div className="text-sm font-semibold">
              {t(slotDefinition.translationKey)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('mealPlanner.slotTotals', {
                carbs: totals.carbs,
                protein: totals.protein,
                fat: totals.fat,
              })}
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

        {portions.map((portion) => {
          const food = foodLookup[portion.foodId];
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
          const inputLabel = getInputLabel(food?.servingUnit);
          const inputSuffix = getInputSuffix(food?.servingUnit);
          const inputStep = getInputStep(food?.servingUnit);
          const inputValue = convertServingsToInput(
            portion.servings,
            food?.servingUnit
          );
          const isExpanded = expandedPortions[portion.id] ?? false;
          const macroBadges = [
            { icon: food?.emoji || '🍽️', value: servingLine || '' },
            {
              icon: macroEmojis?.carbs ?? '🍚',
              value: `${macros.carbs}g`,
            },
            {
              icon: macroEmojis?.protein ?? '🥩',
              value: `${macros.protein}g`,
            },
            {
              icon: macroEmojis?.fat ?? '🥜',
              value: `${macros.fat}g`,
            },
            { icon: '🔥', value: `${macros.calories} kcal` },
          ];

          return (
            <div
              key={portion.id}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2"
                onClick={() => toggleExpandedPortion(portion.id)}
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
                    onClick={() => handleRemove(portion.id)}
                    aria-label={t('mealPlanner.removeFood')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {preparationLabel && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {preparationLabel}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {macroBadges.map((badge) => (
                      <span
                        key={badge.icon}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-1 dark:bg-slate-700/40"
                      >
                        <span>{badge.icon}</span>
                        {badge.value && <span>{badge.value}</span>}
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
                          onChange={(event) =>
                            handlePortionInputChange(
                              portion.id,
                              event.target.value,
                              food?.servingUnit
                            )
                          }
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
        })}

        {isAdding && (
          <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-2 space-y-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t('mealPlanner.chooseFood')}
              </label>
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
                <SelectTrigger className="h-8 text-xs">
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
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">
                {addInputLabel}
              </label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={addInputStep}
                  value={addInputValue}
                  onChange={(event) => handleAddInputChange(event.target.value)}
                  className="w-24 h-8 text-xs"
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

      <Modal
        open={showQuickAdd}
        onClose={handleQuickAddCancel}
        title={t('mealPlanner.quickAddTitle')}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder={t('mealPlanner.fieldName')}
              value={quickForm.name}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Input
              placeholder={t('mealPlanner.fieldCategory')}
              value={quickForm.category}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Input
              placeholder={t('mealPlanner.fieldServing')}
              value={quickForm.defaultServing}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  defaultServing: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Select
              value={quickForm.servingUnit}
              onValueChange={(value: ServingUnit) =>
                setQuickForm((prev) => ({
                  ...prev,
                  servingUnit: value,
                }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue
                  placeholder={t('mealPlanner.servingUnitPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {SERVING_UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {t(`mealPlanner.servingUnits.${unit}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={quickForm.preparation}
              onValueChange={(value: 'raw' | 'cooked') =>
                setQuickForm((prev) => ({
                  ...prev,
                  preparation: value,
                }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t('mealPlanner.fieldPreparation')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">
                  {t('mealPlanner.preparationRaw')}
                </SelectItem>
                <SelectItem value="cooked">
                  {t('mealPlanner.preparationCooked')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder={t('mealPlanner.fieldCarbs')}
              value={quickForm.carbs}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  carbs: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder={t('mealPlanner.fieldProtein')}
              value={quickForm.protein}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  protein: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder={t('mealPlanner.fieldFat')}
              value={quickForm.fat}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  fat: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
            <Input
              value={quickForm.emoji}
              maxLength={4}
              placeholder={t('mealPlanner.fieldEmoji')}
              onChange={(event) =>
                setQuickForm((prev) => ({
                  ...prev,
                  emoji: event.target.value,
                }))
              }
              className="h-9 text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('mealPlanner.servingUnitHint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleQuickAddCancel}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleQuickAddSubmit}>
              {t('mealPlanner.quickAddSubmit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function MealSlotPlanner({
  dayNumber,
  dayMealPlan,
  foodLibrary,
  onUpdateSlot,
  onAddCustomFood,
  targetMacros,
}: MealSlotPlannerProps) {
  const { t } = useTranslation();
  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);
  const [visibleSlots, setVisibleSlots] = useState<MealSlotId[]>(() =>
    deriveVisibleSlots(dayMealPlan)
  );
  const previousDayRef = useRef(dayNumber);

  useEffect(() => {
    if (previousDayRef.current !== dayNumber) {
      previousDayRef.current = dayNumber;
      setVisibleSlots(deriveVisibleSlots(dayMealPlan));
    }
  }, [dayNumber, dayMealPlan]);

  useEffect(() => {
    setVisibleSlots((current) => {
      const next = new Set<MealSlotId>(current);
      ALL_MEAL_SLOT_IDS.forEach((slotId) => {
        if ((dayMealPlan[slotId]?.length ?? 0) > 0) {
          next.add(slotId);
        }
      });
      return ALL_MEAL_SLOT_IDS.filter((slotId) => next.has(slotId));
    });
  }, [dayMealPlan]);

  const availableSlots = useMemo(
    () =>
      MEAL_SLOT_DEFINITIONS.filter((slot) => !visibleSlots.includes(slot.id)),
    [visibleSlots]
  );

  const handleAddSlot = useCallback((slotId: MealSlotId) => {
    setVisibleSlots((current) => {
      if (current.includes(slotId)) return current;
      const next = new Set<MealSlotId>([...current, slotId]);
      return ALL_MEAL_SLOT_IDS.filter((id) => next.has(id));
    });
  }, []);

  const handleRemoveSlot = useCallback(
    (slotId: MealSlotId) => {
      setVisibleSlots((current) => current.filter((id) => id !== slotId));
      onUpdateSlot(slotId, []);
    },
    [onUpdateSlot]
  );

  const dayTotals = useMemo(
    () => calculateDayTotals(dayMealPlan, foodLookup),
    [dayMealPlan, foodLookup]
  );

  const diff = {
    carbs: Math.round((dayTotals.carbs - targetMacros.carbs) * 10) / 10,
    protein: Math.round((dayTotals.protein - targetMacros.protein) * 10) / 10,
    fat: Math.round((dayTotals.fat - targetMacros.fat) * 10) / 10,
    calories: dayTotals.calories - targetMacros.calories,
  };

  const renderDiff = (value: number, suffix: string) => {
    if (value === 0) return `${value}${suffix}`;
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-lg bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('mealPlanner.daySummary', { day: dayNumber })}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.carbs === 0
                  ? 'border-slate-300'
                  : diff.carbs > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.carbsDiff', {
                value: renderDiff(diff.carbs, 'g'),
              })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.protein === 0
                  ? 'border-slate-300'
                  : diff.protein > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.proteinDiff', {
                value: renderDiff(diff.protein, 'g'),
              })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.fat === 0
                  ? 'border-slate-300'
                  : diff.fat > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.fatDiff', { value: renderDiff(diff.fat, 'g') })}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border',
                diff.calories === 0
                  ? 'border-slate-300'
                  : diff.calories > 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {t('mealPlanner.calorieDiff', {
                value: renderDiff(diff.calories, 'kcal'),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {availableSlots.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                {t('mealPlanner.addMealSlot')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              {availableSlots.map((slot) => (
                <DropdownMenuItem
                  key={slot.id}
                  onSelect={() => {
                    handleAddSlot(slot.id);
                  }}
                >
                  {t(slot.translationKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-1 h-4 w-4" />
            {t('mealPlanner.addMealSlot')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleSlots.map((slotId) => (
          <SlotSection
            key={`${dayNumber}-${slotId}`}
            slotId={slotId}
            portions={dayMealPlan[slotId]}
            foodLibrary={foodLibrary}
            onUpdate={(portions) => onUpdateSlot(slotId, portions)}
            onAddCustomFood={onAddCustomFood}
            allowRemove={visibleSlots.length > 1}
            onRemoveSlot={() => handleRemoveSlot(slotId)}
          />
        ))}
      </div>
    </div>
  );
}
