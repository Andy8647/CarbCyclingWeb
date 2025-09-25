import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit3, Trash2 } from 'lucide-react';
import type { FoodGridProps, FoodFormState } from './types';
import type { ServingUnit } from '@/lib/persistence-types';

export function FoodGrid({
  filteredFoods,
  onUpdateFood,
  onRemoveFood,
}: FoodGridProps) {
  const { t } = useTranslation();
  const [editingFood, setEditingFood] = useState<string | null>(null);
  const [deletingFood, setDeletingFood] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<FoodFormState>({
    name: '',
    category: '',
    defaultServing: '',
    servingUnit: 'per_100g',
    carbs: '',
    protein: '',
    fat: '',
    preparation: 'raw',
    emoji: '',
  });

  const handleEditFood = (foodId: string) => {
    const food = filteredFoods.find((f) => f.food.id === foodId)?.food;
    if (!food) return;

    setEditFormState({
      name: food.name,
      category: food.category,
      defaultServing: food.defaultServing,
      servingUnit: food.servingUnit,
      carbs: food.macros.carbs.toString(),
      protein: food.macros.protein.toString(),
      fat: food.macros.fat.toString(),
      preparation: food.preparation || 'raw',
      emoji: food.emoji || '',
    });
    setEditingFood(foodId);
  };

  const handleUpdateFood = () => {
    if (!editingFood) return;

    const carbs = parseFloat(editFormState.carbs);
    const protein = parseFloat(editFormState.protein);
    const fat = parseFloat(editFormState.fat);

    if (
      !editFormState.name.trim() ||
      !editFormState.defaultServing.trim() ||
      Number.isNaN(carbs) ||
      Number.isNaN(protein) ||
      Number.isNaN(fat)
    ) {
      return;
    }

    const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);

    onUpdateFood(editingFood, {
      name: editFormState.name.trim(),
      category:
        editFormState.category.trim() || t('mealPlanner.customCategory'),
      defaultServing: editFormState.defaultServing.trim(),
      servingUnit: editFormState.servingUnit,
      macros: {
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        calories,
      },
      preparation: editFormState.preparation,
      emoji: editFormState.emoji.trim() || '🍽️',
    });

    setEditingFood(null);
  };

  const updateEditFormField = (field: string, value: string | ServingUnit) => {
    setEditFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmDelete = () => {
    if (deletingFood) {
      onRemoveFood(deletingFood);
      setDeletingFood(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredFoods.map(
          ({ food, name, category, serving, unitLabel, preparationLabel }) => (
            <div
              key={food.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{food.emoji || '🍽️'}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                      onClick={() => handleEditFood(food.id)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {unitLabel || serving ? (
                      <>
                        {unitLabel}
                        {unitLabel && serving && (
                          <span className="text-slate-400 dark:text-slate-500">
                            {' '}
                            · {serving}
                          </span>
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
                  <div>
                    {t('mealPlanner.carbsShort', { value: food.macros.carbs })}
                  </div>
                  <div>
                    {t('mealPlanner.proteinShort', {
                      value: food.macros.protein,
                    })}
                  </div>
                  <div>
                    {t('mealPlanner.fatShort', { value: food.macros.fat })}
                  </div>
                  <div>
                    {t('mealPlanner.caloriesShort', {
                      value: food.macros.calories,
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setDeletingFood(food.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          )
        )}
        {filteredFoods.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('mealPlanner.noFoodsFound')}
          </div>
        )}
      </div>

      {/* Edit Food Modal */}
      <Modal
        open={!!editingFood}
        onClose={() => setEditingFood(null)}
        title="编辑食材"
      >
        <div className="space-y-3">
          {/* 第一行：食材名称 + Emoji */}
          <div className="grid grid-cols-[2fr_1fr] gap-2">
            <Input
              placeholder={t('mealPlanner.foodNamePlaceholder')}
              value={editFormState.name}
              onChange={(event) =>
                updateEditFormField('name', event.target.value)
              }
              className="h-9 text-sm"
            />
            <Input
              value={editFormState.emoji}
              maxLength={4}
              placeholder={t('mealPlanner.emojiPlaceholder')}
              onChange={(event) =>
                updateEditFormField('emoji', event.target.value)
              }
              className="h-9 text-sm"
            />
          </div>

          {/* 第二行：单位选择 + 份量输入 + 生熟重 */}
          <div className="flex gap-2">
            <Select
              value={editFormState.servingUnit}
              onValueChange={(value) => {
                updateEditFormField('servingUnit', value as ServingUnit);
                const defaultValue =
                  value === 'per_100g'
                    ? '100'
                    : value === 'per_100ml'
                      ? '100'
                      : '1';
                updateEditFormField('defaultServing', defaultValue);
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
              value={editFormState.defaultServing}
              onChange={(event) =>
                updateEditFormField('defaultServing', event.target.value)
              }
              className="h-9 text-sm flex-1"
            />
            <Select
              value={editFormState.preparation}
              onValueChange={(value: 'raw' | 'cooked') =>
                updateEditFormField('preparation', value)
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
                value={editFormState.carbs}
                onChange={(value) => updateEditFormField('carbs', value)}
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
                value={editFormState.protein}
                onChange={(value) => updateEditFormField('protein', value)}
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
                value={editFormState.fat}
                onChange={(value) => updateEditFormField('fat', value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingFood(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleUpdateFood}>
              保存修改
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            确定要删除这个食材吗？此操作无法撤销。
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingFood(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
