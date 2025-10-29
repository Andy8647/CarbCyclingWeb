import type {
  FoodItem,
  MealPortion,
  MealSlotId,
} from '@/lib/persistence-types';

export interface SlotSectionProps {
  slotId: MealSlotId;
  dayNumber: number;
  portions: MealPortion[];
  foodLibrary: FoodItem[];
  onUpdate: (portions: MealPortion[]) => void;
  allowRemove: boolean;
  onRemoveSlot: () => void;
  onCopySlot: () => void;
  onPasteSlot: (mode: 'replace' | 'append') => void;
  canPaste: boolean;
  onMovePortion: (
    sourceDayNumber: number,
    sourceSlotId: MealSlotId,
    targetDayNumber: number,
    targetSlotId: MealSlotId,
    portionId: string,
    foodId: string,
    servings: number
  ) => void;
}

export interface PortionCardProps {
  portion: MealPortion;
  food?: FoodItem;
  onRemove: () => void;
  onPortionInputChange: (value: string) => void;
  slotId: MealSlotId;
  dayNumber: number;
}
