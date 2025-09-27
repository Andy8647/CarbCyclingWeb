import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/lib/use-toast';
import { useFoodLibraryFilters } from '@/lib/hooks/use-food-library-filters';
import {
  FoodLibraryHeader,
  FoodKanbanGrid,
  type FoodLibraryPanelProps,
  type FoodFormState,
} from './food-library';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type ServingUnit,
  type CategoryType,
  CATEGORY_TYPE_OPTIONS,
} from '@/lib/persistence-types';

const emptyForm: FoodFormState = {
  name: '',
  category: 'other',
  defaultServing: '100',
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
  onUpdateFood,
  onRemoveFood,
}: FoodLibraryPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FoodFormState>(emptyForm);

  const { search, setSearch, filteredFoods } = useFoodLibraryFilters(foods);

  const updateFormField = useCallback(
    (field: string, value: string | ServingUnit) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleFormSubmit = useCallback(() => {
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
      category: formState.category,
      defaultServing: formState.defaultServing.trim(),
      servingUnit: formState.servingUnit,
      macros: {
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        calories,
      },
      preparation,
      emoji: formState.emoji.trim() || (preparation === 'raw' ? '🥕' : '🍽️'),
      isBuiltin: false,
    });

    toast({
      variant: 'success',
      title: t('mealPlanner.customFoodAdded'),
    });

    setFormState(emptyForm);
    setShowForm(false);
  }, [formState, onAddCustomFood, t, toast]);

  return (
    <div className="space-y-3">
      <FoodLibraryHeader
        search={search}
        onSearchChange={setSearch}
        showForm={showForm}
        onToggleForm={() => setShowForm((prev) => !prev)}
      />

      <FoodKanbanGrid
        filteredFoods={filteredFoods}
        onUpdateFood={onUpdateFood}
        onRemoveFood={onRemoveFood}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t('mealPlanner.showAddFoodForm')}
      >
        <div className="space-y-3">
          {/* 第一行：食材名称 + Emoji */}
          <div className="grid grid-cols-[2fr_1fr] gap-2">
            <Input
              placeholder={t('mealPlanner.foodNamePlaceholder')}
              value={formState.name}
              onChange={(event) => updateFormField('name', event.target.value)}
              className="h-9 text-sm"
            />
            <Input
              value={formState.emoji}
              maxLength={4}
              placeholder={t('mealPlanner.emojiPlaceholder')}
              onChange={(event) => updateFormField('emoji', event.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* 食材分类选择 */}
          <Select
            value={formState.category}
            onValueChange={(value: CategoryType) =>
              updateFormField('category', value)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('mealPlanner.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`mealPlanner.categories.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 第二行：单位选择 + 份量输入 + 生熟重 */}
          <div className="flex gap-2">
            <Select
              value={formState.servingUnit}
              onValueChange={(value) => {
                updateFormField('servingUnit', value as ServingUnit);
                // 根据单位自动填充默认值
                const defaultValue =
                  value === 'per_100g'
                    ? '100'
                    : value === 'per_100ml'
                      ? '100'
                      : '1';
                updateFormField('defaultServing', defaultValue);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t('mealPlanner.unitPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_100g">g</SelectItem>
                <SelectItem value="per_100ml">ml</SelectItem>
                <SelectItem value="per_piece">
                  {t('mealPlanner.servingUnits.per_piece')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={formState.defaultServing}
              onChange={(event) =>
                updateFormField('defaultServing', event.target.value)
              }
              className="h-9 text-sm flex-1"
            />
            <Select
              value={formState.preparation}
              onValueChange={(value: 'raw' | 'cooked') =>
                updateFormField('preparation', value)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue
                  placeholder={t('mealPlanner.preparationPlaceholder')}
                />
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

          {/* 第三行：营养素 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                {t('mealPlanner.carbsLabel')}
              </label>
              <NumberInput
                step={0.1}
                min={0}
                value={formState.carbs}
                onChange={(value) => updateFormField('carbs', value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                {t('mealPlanner.proteinLabel')}
              </label>
              <NumberInput
                step={0.1}
                min={0}
                value={formState.protein}
                onChange={(value) => updateFormField('protein', value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                {t('mealPlanner.fatLabel')}
              </label>
              <NumberInput
                step={0.1}
                min={0}
                value={formState.fat}
                onChange={(value) => updateFormField('fat', value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('mealPlanner.servingUnitHint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleFormSubmit}>
              {t('mealPlanner.submitNewFood')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
