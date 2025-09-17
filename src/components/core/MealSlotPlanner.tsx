import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DayMealPlan,
  type FoodItem,
  type MealPortion,
  type MealSlotId,
  MEAL_SLOT_DEFINITIONS,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MinusCircle, Plus, Trash2 } from 'lucide-react';
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
}

function SlotSection({
  slotId,
  portions,
  foodLibrary,
  onUpdate,
  onAddCustomFood,
}: SlotSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const slotDefinition = getMealSlotDefinition(slotId);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);
  const [quickForm, setQuickForm] = useState({
    name: '',
    category: '',
    defaultServing: '',
    carbs: '',
    protein: '',
    fat: '',
    preparation: 'raw' as 'raw' | 'cooked',
    emoji: '',
  });
  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);

  useEffect(() => {
    if (pendingFoodId && foodLookup[pendingFoodId]) {
      setSelectedFoodId(pendingFoodId);
      setPendingFoodId(null);
    }
  }, [pendingFoodId, foodLookup]);

  const totals = useMemo(
    () => calculateSlotTotals(portions, foodLookup),
    [portions, foodLookup]
  );

  const handleAddPortion = () => {
    if (!selectedFoodId) return;
    const food = foodLookup[selectedFoodId];
    if (!food) return;
    const safeServings = Math.max(Number(servings) || 0, 0);
    if (!safeServings) return;

    const newPortion = createMealPortion(selectedFoodId, safeServings);
    onUpdate([...portions, newPortion]);
    setSelectedFoodId('');
    setServings(1);
    setIsAdding(false);
  };

  const handleServingsChange = (portionId: string, value: string) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;

    if (parsed <= 0) {
      onUpdate(portions.filter((portion) => portion.id !== portionId));
      return;
    }

    onUpdate(
      portions.map((portion) =>
        portion.id === portionId
          ? {
              ...portion,
              servings: Math.round(parsed * 100) / 100,
            }
          : portion
      )
    );
  };

  const handleRemove = (portionId: string) => {
    onUpdate(portions.filter((portion) => portion.id !== portionId));
  };

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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsAdding((prev) => !prev)}
          aria-label={t('mealPlanner.addFoodToSlot')}
        >
          <Plus className="h-4 w-4" />
        </Button>
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

          return (
            <div
              key={portion.id}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2"
            >
              <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span className="mr-1">{food?.emoji || '🍽️'}</span>
                    {food?.name || t('mealPlanner.unknownFood')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {food?.defaultServing}
                </div>
                {food?.preparation && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {food.preparation === 'raw'
                      ? t('mealPlanner.preparationRaw')
                      : t('mealPlanner.preparationCooked')}
                  </div>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t('mealPlanner.portionMacros', {
                    carbs: macros.carbs,
                    protein: macros.protein,
                    fat: macros.fat,
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400">
                      {t('mealPlanner.servings')}
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.25"
                      min="0"
                      value={portion.servings}
                      onChange={(event) =>
                        handleServingsChange(portion.id, event.target.value)
                      }
                      className="w-20 h-7 text-xs"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemove(portion.id)}
                    aria-label={t('mealPlanner.removeFood')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                    setShowQuickAdd(true);
                    setSelectedFoodId('');
                    return;
                  }
                  setShowQuickAdd(false);
                  setSelectedFoodId(value);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t('mealPlanner.searchPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {foodLibrary.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <span>{food.emoji || '🍽️'}</span>
                          <span>{food.name}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>{food.defaultServing}</span>
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
                  ))}
                  <SelectItem value="__add_new_food__">
                    <span className="text-xs">➕ {t('mealPlanner.quickAddLabel')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">
                {t('mealPlanner.servings')}
              </label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={servings}
                onChange={(event) => setServings(Number(event.target.value) || 0)}
                className="w-20 h-8 text-xs"
              />
              <Button size="sm" onClick={handleAddPortion}>
                {t('mealPlanner.addFood')}
              </Button>
            </div>

            {showQuickAdd && (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-2 space-y-2">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t('mealPlanner.quickAddTitle')}
                </div>
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs"
                  />
                  <Select
                    value={quickForm.preparation}
                    onValueChange={(value: 'raw' | 'cooked') =>
                      setQuickForm((prev) => ({
                        ...prev,
                        preparation: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowQuickAdd(false);
                      setQuickForm({
                        name: '',
                        category: '',
                        defaultServing: '',
                        carbs: '',
                        protein: '',
                        fat: '',
                        preparation: 'raw',
                        emoji: '',
                      });
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
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
                        category:
                          quickForm.category.trim() ||
                          t('mealPlanner.customCategory'),
                        defaultServing: quickForm.defaultServing.trim(),
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
                      setQuickForm({
                        name: '',
                        category: '',
                        defaultServing: '',
                        carbs: '',
                        protein: '',
                        fat: '',
                        preparation: 'raw',
                        emoji: '',
                      });
                      toast({
                        variant: 'success',
                        title: t('mealPlanner.customFoodAdded'),
                      });
                    }}
                  >
                    {t('mealPlanner.quickAddSubmit')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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
              {t('mealPlanner.carbsDiff', { value: renderDiff(diff.carbs, 'g') })}
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

      <div className="space-y-2">
        {MEAL_SLOT_DEFINITIONS.map((slot) => (
          <SlotSection
            key={`${dayNumber}-${slot.id}`}
            slotId={slot.id}
            portions={dayMealPlan[slot.id]}
            foodLibrary={foodLibrary}
            onUpdate={(portions) => onUpdateSlot(slot.id, portions)}
            onAddCustomFood={onAddCustomFood}
          />
        ))}
      </div>
    </div>
  );
}
