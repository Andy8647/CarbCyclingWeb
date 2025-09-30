import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FoodItem } from '@/lib/persistence-types';

export interface LocalizedFood {
  food: FoodItem;
  name: string;
  category: string;
  serving: string;
  unitLabel: string;
  preparationLabel: string;
}

export function useFoodLibraryFilters(foods: FoodItem[]) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

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
    return localizedFoods.filter(
      ({ food, name, category, serving, unitLabel, preparationLabel }) =>
        [
          name,
          category,
          serving,
          unitLabel,
          preparationLabel,
          food.name,
          food.category,
          food.defaultServing,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
    );
  }, [localizedFoods, search]);

  return {
    search,
    setSearch,
    localizedFoods,
    filteredFoods,
  };
}
