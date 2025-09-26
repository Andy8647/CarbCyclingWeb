import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/lib/use-toast';
import {
  createMealPortion,
  convertInputToServings,
  roundToTwo,
} from '@/lib/meal-planner';
import type { MealPortion, FoodItem, ServingUnit } from '@/lib/persistence-types';

interface QuickFormData {
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

type AddCustomFoodFunction = (
  food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
) => FoodItem;

interface UseSlotManagementProps {
  portions: MealPortion[];
  onUpdate: (portions: MealPortion[]) => void;
  foodLookup: Record<string, FoodItem>;
}

export function useSlotManagement({
  portions,
  onUpdate,
  foodLookup,
}: UseSlotManagementProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [expandedPortions, setExpandedPortions] = useState<
    Record<string, boolean>
  >({});

  const toggleExpandedPortion = useCallback((portionId: string) => {
    setExpandedPortions((prev) => ({
      ...prev,
      [portionId]: !prev[portionId],
    }));
  }, []);

  const handleAddPortion = useCallback(
    (selectedFoodId: string, servings: number) => {
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
      setExpandedPortions((prev) => ({ ...prev, [newPortion.id]: true }));

      return newPortion;
    },
    [portions, onUpdate, foodLookup]
  );

  const handlePortionInputChange = useCallback(
    (portionId: string, value: string) => {
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
    },
    [portions, onUpdate, foodLookup]
  );

  const handleRemovePortion = useCallback(
    (portionId: string) => {
      onUpdate(portions.filter((portion) => portion.id !== portionId));
      setExpandedPortions((prev) => {
        if (!prev[portionId]) return prev;
        const next = { ...prev };
        delete next[portionId];
        return next;
      });
    },
    [portions, onUpdate]
  );

  const handleQuickAddFood = useCallback(
    (quickForm: QuickFormData, onAddCustomFood: AddCustomFoodFunction) => {
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
        return null;
      }

      const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);

      const newFood = onAddCustomFood({
        name: quickForm.name.trim(),
        category: quickForm.category,
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
        isBuiltin: false,
      });

      toast({
        variant: 'success',
        title: t('mealPlanner.customFoodAdded'),
      });

      return newFood;
    },
    [toast, t]
  );

  return {
    expandedPortions,
    setExpandedPortions,
    toggleExpandedPortion,
    handleAddPortion,
    handlePortionInputChange,
    handleRemovePortion,
    handleQuickAddFood,
  };
}
