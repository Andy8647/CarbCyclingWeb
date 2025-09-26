import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Edit3 } from 'lucide-react';
import { CreateOrUpdateFoodModal } from './CreateOrUpdateFoodModal';
import type { FoodGridProps, FoodFormState } from './types';
import type { ServingUnit, CategoryType } from '@/lib/persistence-types';

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
    category: 'other',
    defaultServing: '',
    servingUnit: 'per_100g',
    carbs: '',
    protein: '',
    fat: '',
    preparation: 'raw',
    emoji: '',
  });

  const editServingUnitOptions: ServingUnit[] = [
    'per_100g',
    'per_100ml',
    'per_piece',
  ];

  const handleEditFood = (foodId: string) => {
    const food = filteredFoods.find((f) => f.food.id === foodId)?.food;
    if (!food) return;

    setEditFormState({
      name: food.name,
      category: food.category as CategoryType,
      defaultServing: food.defaultServing,
      servingUnit: food.servingUnit ?? 'per_100g',
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
      category: editFormState.category,
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

  const handleEditFieldChange = <Key extends keyof FoodFormState>(
    field: Key,
    value: FoodFormState[Key]
  ) => {
    setEditFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditServingUnitChange = (unit: ServingUnit) => {
    setEditFormState((prev) => ({
      ...prev,
      servingUnit: unit,
      defaultServing: unit === 'per_100g' || unit === 'per_100ml' ? '100' : '1',
    }));
  };

  const handleConfirmDelete = () => {
    if (deletingFood) {
      onRemoveFood(deletingFood);
      setDeletingFood(null);
    }
  };

  const handleDeleteFromModal = () => {
    if (!editingFood) return;
    setDeletingFood(editingFood);
    setEditingFood(null);
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
            </div>
          )
        )}
        {filteredFoods.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('mealPlanner.noFoodsFound')}
          </div>
        )}
      </div>

      <CreateOrUpdateFoodModal
        open={!!editingFood}
        mode="update"
        formState={editFormState}
        onClose={() => setEditingFood(null)}
        onSubmit={handleUpdateFood}
        onFieldChange={handleEditFieldChange}
        onServingUnitChange={handleEditServingUnitChange}
        servingUnitOptions={editServingUnitOptions}
        onDelete={handleDeleteFromModal}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        title={t('mealPlanner.deleteFoodTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('mealPlanner.deleteFoodDescription')}
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
              {t('mealPlanner.removeCustomFood')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
