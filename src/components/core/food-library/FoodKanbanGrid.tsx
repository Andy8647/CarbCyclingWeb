import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CreateOrUpdateFoodModal } from './CreateOrUpdateFoodModal';
import { KanbanColumn } from './KanbanColumn';
import type { FoodGridProps, FoodFormState } from './types';
import type { ServingUnit, CategoryType } from '@/lib/persistence-types';
import type { LocalizedFood } from '@/lib/hooks/use-food-library-filters';

interface GroupedFoods {
  [key: string]: LocalizedFood[];
}

const NUTRITION_CATEGORIES = ['protein', 'carb', 'fat'] as const;
const OTHER_CATEGORIES = ['vegetable', 'fruit', 'supplement', 'other'] as const;

export function FoodKanbanGrid({
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

  // Group foods by category and sort within each category
  const groupedFoods: GroupedFoods = filteredFoods.reduce(
    (acc, localizedFood) => {
      const category = localizedFood.food.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(localizedFood);
      return acc;
    },
    {} as GroupedFoods
  );

  // Sort foods within each category by their main nutrition value
  Object.keys(groupedFoods).forEach((category) => {
    groupedFoods[category].sort((a, b) => {
      const foodA = a.food;
      const foodB = b.food;

      switch (category) {
        case 'protein':
          return foodB.macros.protein - foodA.macros.protein;
        case 'carb':
          return foodB.macros.carbs - foodA.macros.carbs;
        case 'fat':
          return foodB.macros.fat - foodA.macros.fat;
        default:
          // For other categories, sort by total calories
          return foodB.macros.calories - foodA.macros.calories;
      }
    });
  });

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

  const getCategoryDisplayName = (category: string) => {
    return t(`mealPlanner.categories.${category}`);
  };

  // Combine nutrition categories first, then other categories
  const allCategories = [...NUTRITION_CATEGORIES, ...OTHER_CATEGORIES];
  const displayCategories = allCategories.filter(
    (category) => groupedFoods[category]?.length > 0
  );

  if (filteredFoods.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {t('mealPlanner.noFoodsFound')}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center overflow-x-auto bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
        {displayCategories.map((category) => {
          const foods = groupedFoods[category] || [];
          if (foods.length === 0) return null;

          return (
            <KanbanColumn
              key={category}
              category={category}
              title={getCategoryDisplayName(category)}
              foods={foods}
              onEditFood={handleEditFood}
            />
          );
        })}
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
