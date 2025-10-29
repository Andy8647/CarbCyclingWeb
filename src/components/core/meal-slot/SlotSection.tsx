import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ClipboardPaste,
  MinusCircle,
  Trash2,
} from 'lucide-react';
import { useSlotManagement } from '@/lib/hooks/use-slot-management';
import {
  buildFoodLookup,
  calculateSlotTotals,
  getMealSlotDefinition,
  getDefaultInputValue,
} from '@/lib/meal-planner';
import { PortionCard } from './PortionCard';
import type { SlotSectionProps } from './types';
import type { MealSlotId } from '@/lib/persistence-types';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from '@/lib/utils';
import { CompactMacroDisplay } from '@/components/ui/compact-macro-display';

export function SlotSection({
  slotId,
  dayNumber,
  portions,
  foodLibrary,
  onUpdate,
  allowRemove,
  onRemoveSlot,
  onCopySlot,
  onPasteSlot,
  canPaste,
  onMovePortion,
}: SlotSectionProps) {
  const { t } = useTranslation();
  const slotDefinition = getMealSlotDefinition(slotId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  const foodLookup = useMemo(() => buildFoodLookup(foodLibrary), [foodLibrary]);

  const {
    handleAddPortion: addPortion,
    handlePortionInputChange,
    handleRemovePortion,
  } = useSlotManagement({ portions, onUpdate, foodLookup });

  const totals = useMemo(
    () => calculateSlotTotals(portions, foodLookup),
    [portions, foodLookup]
  );

  useEffect(() => {
    const element = slotRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ slotId }),
      canDrop: ({ source }) =>
        source.data.type === 'food-card' || source.data.type === 'portion',
      onDragEnter: ({ source }) => {
        if (source.data.type !== 'food-card' && source.data.type !== 'portion')
          return;
        setIsDragOver(true);
      },
      onDragLeave: () => {
        setIsDragOver(false);
      },
      onDrop: ({ source }) => {
        setIsDragOver(false);
        const data = source.data as {
          type?: string;
          foodId?: string;
          portionId?: string;
          servings?: number;
          sourceSlotId?: string;
          sourceDayNumber?: number;
        };

        // Handle food-card drop (from food library)
        if (data.type === 'food-card' && data.foodId) {
          const droppedFood = foodLookup[data.foodId];
          if (!droppedFood) return;

          const defaultServings = getDefaultInputValue(droppedFood.servingUnit);
          addPortion(data.foodId, defaultServings);
          setIsCollapsed(false);
          return;
        }

        // Handle portion drop (from another slot)
        if (data.type === 'portion' && data.foodId && data.portionId) {
          const sourceDayNumber = data.sourceDayNumber as number;
          const sourceSlotId = data.sourceSlotId as MealSlotId;

          // Prevent dropping into the same slot on the same day
          if (sourceDayNumber === dayNumber && sourceSlotId === slotId) {
            return;
          }

          // Use atomic move operation
          onMovePortion(
            sourceDayNumber,
            sourceSlotId,
            dayNumber,
            slotId,
            data.portionId,
            data.foodId,
            data.servings || 1
          );
          setIsCollapsed(false);
          return;
        }
      },
    });
  }, [foodLookup, addPortion, onMovePortion, slotId, dayNumber]);

  return (
    <div
      ref={slotRef}
      className={cn(
        'h-fit flex flex-col border-b border-slate-200 dark:border-slate-700 transition-all',
        isDragOver &&
          'ring-2 ring-blue-300 dark:ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-blue-50/40 dark:bg-blue-900/20'
      )}
    >
      {/* Header with meal title and controls */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed
                ? t('mealPlanner.expandSlot')
                : t('mealPlanner.collapseSlot')
            }
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="text-lg" aria-hidden>
            {slotDefinition.icon}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t(slotDefinition.translationKey)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCopySlot}
            aria-label={t('mealPlanner.copySlot')}
            title={t('mealPlanner.copySlot')}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPasteSlot('replace')}
            disabled={!canPaste}
            aria-label={t('mealPlanner.pasteSlot')}
            title={t('mealPlanner.pasteSlot')}
          >
            <ClipboardPaste className="h-4 w-4" />
          </Button>
          {allowRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRemoveSlot}
              aria-label={t('mealPlanner.removeSlot', {
                slot: t(slotDefinition.translationKey),
              })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Macro summary badges - always visible */}
      <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <CompactMacroDisplay
            macros={{
              carbs: totals.carbs,
              protein: totals.protein,
              fat: totals.fat,
            }}
            size="sm"
            showLabels={false}
          />
          {totals.calories > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(totals.calories)} kCal
            </span>
          )}
        </div>
      </div>

      {/* Content area - only show when not collapsed */}
      {!isCollapsed && (
        <div className="p-1 flex-1">
          {portions.length === 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center py-4">
              <MinusCircle className="h-3.5 w-3.5" />
              <span>{t('mealPlanner.emptySlotHint')}</span>
            </div>
          )}

          {portions.length > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {portions.map((portion) => (
                <PortionCard
                  key={portion.id}
                  portion={portion}
                  food={foodLookup[portion.foodId]}
                  onRemove={() => handleRemovePortion(portion.id)}
                  onPortionInputChange={(value) =>
                    handlePortionInputChange(portion.id, value)
                  }
                  slotId={slotId}
                  dayNumber={dayNumber}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
