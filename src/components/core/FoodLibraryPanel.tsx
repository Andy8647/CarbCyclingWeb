import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FoodItem, ServingUnit } from '@/lib/persistence-types';
import { SERVING_UNIT_OPTIONS } from '@/lib/persistence-types';
import { useToast } from '@/lib/use-toast';

interface FoodLibraryPanelProps {
  foods: FoodItem[];
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  onRemoveFood: (id: string) => void;
}

interface FoodFormState {
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

const emptyForm: FoodFormState = {
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

export function FoodLibraryPanel({
  foods,
  onAddCustomFood,
  onRemoveFood,
}: FoodLibraryPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FoodFormState>(emptyForm);

  const localizedFoods = useMemo(() => {
    const mapped = foods.map((food) => {
      const name = food.nameKey ? t(food.nameKey) : food.name;
      const category = food.categoryKey ? t(food.categoryKey) : food.category;
      const serving = food.defaultServingKey
        ? t(food.defaultServingKey)
        : food.defaultServing;
      const unitLabel = food.servingUnit
        ? t(`mealPlanner.servingUnits.${food.servingUnit}`)
        : '';
      const preparationLabel = food.preparation
        ? food.preparation === 'raw'
          ? t('mealPlanner.preparationRaw')
          : t('mealPlanner.preparationCooked')
        : '';

      return {
        food,
        name,
        category,
        serving,
        unitLabel,
        preparationLabel,
      };
    });

    return mapped.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [foods, t]);

  const filteredFoods = useMemo(() => {
    if (!search.trim()) return localizedFoods;
    const query = search.trim().toLowerCase();
    return localizedFoods.filter(({
      food,
      name,
      category,
      serving,
      unitLabel,
      preparationLabel,
    }) =>
      [
        name,
        category,
        serving,
        unitLabel,
        preparationLabel,
        food.name,
        food.category,
        food.defaultServing,
        food.emoji,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [localizedFoods, search]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const carbs = parseFloat(formState.carbs);
    const protein = parseFloat(formState.protein);
    const fat = parseFloat(formState.fat);

    if (
      !formState.name.trim() ||
      !formState.defaultServing.trim() ||
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

    const preparation = formState.preparation || 'raw';

    onAddCustomFood({
      name: formState.name.trim(),
      category: formState.category.trim() || t('mealPlanner.customCategory'),
      defaultServing: formState.defaultServing.trim(),
      servingUnit: formState.servingUnit,
      macros: {
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        calories,
      },
      preparation,
      emoji:
        formState.emoji.trim() ||
        (preparation === 'raw'
          ? '🥕'
          : '🍽️'),
    });

    toast({
      variant: 'success',
      title: t('mealPlanner.customFoodAdded'),
    });

    setFormState(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">
            {t('mealPlanner.foodLibraryTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('mealPlanner.foodLibrarySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('mealPlanner.searchPlaceholder')}
            className="h-8 w-44 text-xs"
          />
          <Button
            size="sm"
            variant={showForm ? 'secondary' : 'default'}
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm
              ? t('mealPlanner.hideAddFoodForm')
              : t('mealPlanner.showAddFoodForm')}
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-3"
          onSubmit={handleFormSubmit}
        >
          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldName')}</Label>
            <Input
              value={formState.name}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, name: event.target.value }))
              }
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldCategory')}</Label>
            <Input
              value={formState.category}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldServing')}</Label>
            <Input
              value={formState.defaultServing}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  defaultServing: event.target.value,
                }))
              }
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldServingUnit')}</Label>
            <Select
              value={formState.servingUnit}
              onValueChange={(value: ServingUnit) =>
                setFormState((prev) => ({
                  ...prev,
                  servingUnit: value,
                }))
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t('mealPlanner.servingUnitPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {SERVING_UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {t(`mealPlanner.servingUnits.${unit}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {t('mealPlanner.servingUnitHint')}
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldPreparation')}</Label>
            <Select
              value={formState.preparation}
              onValueChange={(value: 'raw' | 'cooked') =>
                setFormState((prev) => ({
                  ...prev,
                  preparation: value,
                }))
              }
            >
              <SelectTrigger className="h-8 text-sm">
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
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldCarbs')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={formState.carbs}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  carbs: event.target.value,
                }))
              }
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldProtein')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={formState.protein}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  protein: event.target.value,
                }))
              }
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldFat')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={formState.fat}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  fat: event.target.value,
                }))
              }
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('mealPlanner.fieldEmoji')}</Label>
            <Input
              value={formState.emoji}
              maxLength={4}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  emoji: event.target.value,
                }))
              }
              className="h-8 text-sm"
              placeholder="🍚"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" size="sm">
              {t('mealPlanner.submitNewFood')}
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFoods.map(({
          food,
          name,
          category,
          serving,
          unitLabel,
          preparationLabel,
        }) => (
          <div
            key={food.id}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{food.emoji || '🍽️'}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {name}
                  </span>
                  {food.isCustom && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {t('mealPlanner.customBadge')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {unitLabel || serving ? (
                    <>
                      {unitLabel}
                      {unitLabel && serving && (
                        <span className="text-slate-400 dark:text-slate-500"> · {serving}</span>
                      )}
                      {!unitLabel && serving}
                    </>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {category}
                </div>
                {food.preparation && preparationLabel && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {preparationLabel}
                  </div>
                )}
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <div>{t('mealPlanner.carbsShort', { value: food.macros.carbs })}</div>
                <div>
                  {t('mealPlanner.proteinShort', { value: food.macros.protein })}
                </div>
                <div>{t('mealPlanner.fatShort', { value: food.macros.fat })}</div>
                <div>{t('mealPlanner.caloriesShort', { value: food.macros.calories })}</div>
              </div>
            </div>

            {food.isCustom && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFood(food.id)}
                >
                  {t('mealPlanner.removeCustomFood')}
                </Button>
              </div>
            )}
          </div>
        ))}
        {filteredFoods.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('mealPlanner.noFoodsFound')}
          </div>
        )}
      </div>
    </div>
  );
}
