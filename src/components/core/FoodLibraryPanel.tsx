import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/lib/use-toast';
import { useFoodLibraryFilters } from '@/lib/hooks/use-food-library-filters';
import {
  FoodLibraryHeader,
  FoodKanbanGrid,
  CreateOrUpdateFoodModal,
  type FoodLibraryPanelProps,
  type FoodFormState,
} from './food-library';
import {
  type ServingUnit,
  SERVING_UNIT_OPTIONS,
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
    <Key extends keyof FoodFormState>(
      field: Key,
      value: FoodFormState[Key]
    ) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleServingUnitChange = useCallback(
    (unit: ServingUnit) => {
      updateFormField('servingUnit', unit);
      const defaultValue =
        unit === 'per_100g' || unit === 'per_100ml' ? '100' : '1';
      updateFormField('defaultServing', defaultValue);
    },
    [updateFormField]
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

      <CreateOrUpdateFoodModal
        open={showForm}
        mode="create"
        title={t('mealPlanner.showAddFoodForm')}
        submitLabel={t('mealPlanner.submitNewFood')}
        cancelLabel={t('common.cancel')}
        formState={formState}
        onClose={() => {
          setShowForm(false);
          setFormState(emptyForm);
        }}
        onSubmit={handleFormSubmit}
        onFieldChange={updateFormField}
        servingUnitOptions={SERVING_UNIT_OPTIONS}
        onServingUnitChange={handleServingUnitChange}
      />
    </div>
  );
}
