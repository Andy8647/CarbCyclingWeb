import type { FoodItem, ServingUnit } from '@/lib/persistence-types';
import type { LocalizedFood } from '@/lib/hooks/use-food-library-filters';

export interface FoodFormState {
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

export interface FoodLibraryPanelProps {
  foods: FoodItem[];
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  onUpdateFood: (
    id: string,
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => void;
  onRemoveFood: (id: string) => void;
}

export interface FoodLibraryHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  showForm: boolean;
  onToggleForm: () => void;
}

export interface FoodAddFormProps {
  formState: FoodFormState;
  onFormChange: (formState: FoodFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface FoodGridProps {
  filteredFoods: LocalizedFood[];
  onUpdateFood: (
    id: string,
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => void;
  onRemoveFood: (id: string) => void;
}
