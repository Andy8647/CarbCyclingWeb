import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/lib/use-toast';
import { useFoodLibraryFilters } from '@/lib/hooks/use-food-library-filters';
import {
  FoodLibraryHeader,
  FoodAddForm,
  FoodGrid,
  type FoodLibraryPanelProps,
  type FoodFormState,
} from './food-library';

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
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FoodFormState>(emptyForm);

  const { search, setSearch, filteredFoods } = useFoodLibraryFilters(foods);

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
      emoji: formState.emoji.trim() || (preparation === 'raw' ? '🥕' : '🍽️'),
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
      <FoodLibraryHeader
        search={search}
        onSearchChange={setSearch}
        showForm={showForm}
        onToggleForm={() => setShowForm((prev) => !prev)}
      />

      {showForm && (
        <FoodAddForm
          formState={formState}
          onFormChange={setFormState}
          onSubmit={handleFormSubmit}
        />
      )}

      <FoodGrid filteredFoods={filteredFoods} onRemoveFood={onRemoveFood} />
    </div>
  );
}
