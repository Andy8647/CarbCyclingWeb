import type {
  FoodItem,
  MealPortion,
  MealSlotId,
  ServingUnit,
} from '@/lib/persistence-types';

export interface QuickAddFormState {
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

export interface SlotSectionProps {
  slotId: MealSlotId;
  portions: MealPortion[];
  foodLibrary: FoodItem[];
  onUpdate: (portions: MealPortion[]) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
  ) => FoodItem;
  allowRemove: boolean;
  onRemoveSlot: () => void;
}

export interface PortionCardProps {
  portion: MealPortion;
  food?: FoodItem;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onPortionInputChange: (value: string) => void;
}

export interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  formState: QuickAddFormState;
  onFormChange: (formState: QuickAddFormState) => void;
  onSubmit: () => void;
}
