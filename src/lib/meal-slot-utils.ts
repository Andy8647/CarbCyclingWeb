import type {
  ServingUnit,
  MealSlotId,
  DayMealPlan,
} from '@/lib/persistence-types';
import { MEAL_SLOT_DEFINITIONS } from '@/lib/persistence-types';

const BASE_MEAL_SLOTS: MealSlotId[] = ['breakfast', 'lunch', 'dinner'];
const ALL_MEAL_SLOT_IDS: MealSlotId[] = MEAL_SLOT_DEFINITIONS.map(
  (slot) => slot.id
);

export const deriveVisibleSlots = (plan: DayMealPlan): MealSlotId[] => {
  const base = new Set<MealSlotId>(BASE_MEAL_SLOTS);
  ALL_MEAL_SLOT_IDS.forEach((slotId) => {
    if ((plan[slotId]?.length ?? 0) > 0) {
      base.add(slotId);
    }
  });
  return ALL_MEAL_SLOT_IDS.filter((slotId) => base.has(slotId));
};

export const isAmountUnit = (unit?: ServingUnit) =>
  unit === 'per_100g' || unit === 'per_100ml';

export const getDefaultInputValue = (unit?: ServingUnit) =>
  isAmountUnit(unit) ? 100 : 1;

export const convertServingsToInput = (value: number, unit?: ServingUnit) => {
  if (!Number.isFinite(value)) return 0;
  if (isAmountUnit(unit)) {
    return Number((value * 100).toFixed(2));
  }
  return value;
};

export const convertInputToServings = (input: number, unit?: ServingUnit) => {
  if (!Number.isFinite(input)) return 0;
  if (isAmountUnit(unit)) {
    return input / 100;
  }
  return input;
};

export const roundToTwo = (value: number) => Math.round(value * 100) / 100;

export const formatBadgeValue = (value: number) => Math.round(value * 10) / 10;

export const getInputStep = (unit?: ServingUnit) => {
  if (isAmountUnit(unit)) return 1;
  if (unit === 'per_piece' || unit === 'per_half_piece') return 1;
  return 0.25;
};
