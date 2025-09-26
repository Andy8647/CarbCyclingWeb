import type {
  FoodItem,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';
import type { FoodFormState } from '@/components/core/food-library/types';

export type QuickAddFormState = FoodFormState;

export interface SlotSectionProps {
  slotId: MealSlotId;
  portions: MealPortion[];
  foodLibrary: FoodItem[];
  onUpdate: (portions: MealPortion[]) => void;
  onAddCustomFood: (
    food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
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
