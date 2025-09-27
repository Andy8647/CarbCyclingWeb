import type {
  FoodItem,
  ServingUnit,
  CategoryType,
} from '@/lib/persistence-types';
import type { LocalizedFood } from '@/lib/hooks/use-food-library-filters';

export interface FoodFormState {
  name: string;
  category: CategoryType;
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
    food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  onUpdateFood: (
    id: string,
    food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  onRemoveFood: (id: string) => void;
}

export interface CreateOrUpdateFoodModalProps {
  open: boolean;
  mode: 'create' | 'update';
  formState: FoodFormState;
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: <Key extends keyof FoodFormState>(
    field: Key,
    value: FoodFormState[Key]
  ) => void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
  servingUnitOptions?: ServingUnit[];
  onServingUnitChange?: (unit: ServingUnit) => void;
  onDelete?: () => void;
  deleteLabel?: string;
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
    food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  onRemoveFood: (id: string) => void;
}
