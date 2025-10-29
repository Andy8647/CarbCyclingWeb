import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import {
  type DayMealPlan,
  type FoodItem,
  type MealPortion,
  type MealSlotId,
  MEAL_SLOT_DEFINITIONS,
} from '@/lib/persistence-types';
import {
  BASE_MEAL_SLOTS,
  buildFoodLookup,
  calculateDayTotals,
  deriveVisibleSlots,
} from '@/lib/meal-planner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { SlotSection } from '@/components/core/meal-slot';
import { CompactMacroDeficit } from '@/components/ui/macro-progress-bar';

interface MealSlotPlannerProps {
  dayNumber: number;
  dayMealPlan: DayMealPlan;
  foodLibrary: FoodItem[];
  onUpdateSlot: (slotId: MealSlotId, portions: MealPortion[]) => void;
  onMovePortion: (
    sourceDayNumber: number,
    sourceSlotId: MealSlotId,
    targetDayNumber: number,
    targetSlotId: MealSlotId,
    portionId: string,
    foodId: string,
    servings: number
  ) => void;
  targetMacros: {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  };
  className?: string;
}

interface MacroDiffRowProps {
  diff: {
    carbs: number;
    protein: number;
    fat: number;
  };
  macroLabels: Record<'carbs' | 'protein' | 'fat', string>;
  getDiffTextClass: (value: number) => string;
}

function MacroDiffRow({ diff }: MacroDiffRowProps) {
  return (
    <CompactMacroDeficit
      deficit={{
        carbs: diff.carbs, // diff 是 current - target，负数表示还差多少
        protein: diff.protein,
        fat: diff.fat,
      }}
      className="w-full justify-center"
    />
  );
}

interface AddMealSlotControlProps {
  availableSlots: Array<{ id: string; label: string }>;
  onAddSlot: (slotId: string) => void;
  label: string;
}

function AddMealSlotControl({
  availableSlots,
  onAddSlot,
  label,
}: AddMealSlotControlProps) {
  const hasSlots = availableSlots.length > 0;

  if (!hasSlots) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        disabled
      >
        <span>{label}</span>
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span>{label}</span>
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-full">
        {availableSlots.map((slot) => (
          <DropdownMenuItem key={slot.id} onSelect={() => onAddSlot(slot.id)}>
            {slot.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MealSlotPlanner({
  dayNumber,
  dayMealPlan,
  foodLibrary,
  onUpdateSlot,
  onMovePortion,
  targetMacros,
  className,
}: MealSlotPlannerProps) {
  const { t } = useTranslation();
  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);
  const [extraSlots, setExtraSlots] = useState<MealSlotId[]>([
    ...BASE_MEAL_SLOTS,
  ]);

  // 剪贴板管理
  const { copySlot, pasteToSlot, hasSlotData } = useClipboard();

  useEffect(() => {
    setExtraSlots([...BASE_MEAL_SLOTS]);
  }, [dayNumber]);

  const derivedVisibleSlots = useMemo(
    () => deriveVisibleSlots(dayMealPlan),
    [dayMealPlan]
  );

  const combinedVisibleSlots = useMemo(() => {
    const visibleSet = new Set<MealSlotId>(derivedVisibleSlots);
    extraSlots.forEach((slot) => visibleSet.add(slot));
    return MEAL_SLOT_DEFINITIONS.filter((slot) => visibleSet.has(slot.id));
  }, [derivedVisibleSlots, extraSlots]);

  const availableSlots = useMemo(
    () =>
      MEAL_SLOT_DEFINITIONS.filter(
        (slot) =>
          !combinedVisibleSlots.some((visible) => visible.id === slot.id)
      ),
    [combinedVisibleSlots]
  );

  const handleAddSlot = useCallback(
    (slotId: string) => {
      const id = slotId as MealSlotId;
      setExtraSlots((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const portions = dayMealPlan[id] ? [...dayMealPlan[id]] : [];
      onUpdateSlot(id, portions);
    },
    [dayMealPlan, onUpdateSlot]
  );

  const handleRemoveSlot = useCallback(
    (slotId: MealSlotId) => {
      onUpdateSlot(slotId, []);
      setExtraSlots((prev) => prev.filter((slot) => slot !== slotId));
    },
    [onUpdateSlot]
  );

  // 复制餐次处理器
  const handleCopySlot = useCallback(
    (slotId: MealSlotId) => {
      const portions = dayMealPlan[slotId] || [];
      copySlot(slotId, portions);
    },
    [dayMealPlan, copySlot]
  );

  // 粘贴餐次处理器
  const handlePasteSlot = useCallback(
    (slotId: MealSlotId, mode: 'replace' | 'append') => {
      const currentPortions = dayMealPlan[slotId] || [];
      const newPortions = pasteToSlot(currentPortions, mode);
      if (newPortions) {
        onUpdateSlot(slotId, newPortions);
      }
    },
    [dayMealPlan, pasteToSlot, onUpdateSlot]
  );

  const dayTotals = useMemo(
    () => calculateDayTotals(dayMealPlan, foodLookup),
    [dayMealPlan, foodLookup]
  );

  const diff = useMemo(
    () => ({
      carbs: Math.round(dayTotals.carbs - targetMacros.carbs),
      protein: Math.round(dayTotals.protein - targetMacros.protein),
      fat: Math.round(dayTotals.fat - targetMacros.fat),
    }),
    [dayTotals, targetMacros]
  );

  const macroLabels = useMemo(
    () =>
      t('mealPlanner.macroLabels', {
        returnObjects: true,
      }) as Record<'carbs' | 'protein' | 'fat', string>,
    [t]
  );

  const getDiffTextClass = useCallback((value: number) => {
    if (value === 0) return 'text-slate-500 dark:text-slate-400';
    return value > 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  }, []);

  const translatedAvailableSlots = useMemo(
    () =>
      availableSlots.map((slot) => ({
        id: slot.id,
        label: t(slot.translationKey),
      })),
    [availableSlots, t]
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Day Summary Header */}
      <div className="rounded-t-lg bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
          <MacroDiffRow
            diff={diff}
            macroLabels={macroLabels}
            getDiffTextClass={getDiffTextClass}
          />
          <AddMealSlotControl
            availableSlots={translatedAvailableSlots}
            onAddSlot={handleAddSlot}
            label={t('mealPlanner.addMealSlot')}
          />
        </div>
      </div>

      {/* Grid Layout Meal Slots */}
      <div className="flex-1 grid grid-cols-1 content-start bg-white dark:bg-slate-900 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-700 overflow-hidden">
        {combinedVisibleSlots.map((slot) => (
          <SlotSection
            key={`${dayNumber}-${slot.id}`}
            slotId={slot.id}
            dayNumber={dayNumber}
            portions={dayMealPlan[slot.id]}
            foodLibrary={foodLibrary}
            onUpdate={(portions) => onUpdateSlot(slot.id, portions)}
            allowRemove={combinedVisibleSlots.length > 1}
            onRemoveSlot={() => handleRemoveSlot(slot.id)}
            onCopySlot={() => handleCopySlot(slot.id)}
            onPasteSlot={(mode) => handlePasteSlot(slot.id, mode)}
            canPaste={hasSlotData}
            onMovePortion={onMovePortion}
          />
        ))}
      </div>
    </div>
  );
}
