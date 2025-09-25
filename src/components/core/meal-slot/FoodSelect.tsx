import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FoodItem } from '@/lib/persistence-types';

export interface LocalizedFoodOption {
  food: FoodItem;
  name: string;
  serving: string;
  unitLabel: string;
}

interface FoodSelectProps {
  selectedFoodId: string;
  foodLookup: Record<string, FoodItem>;
  options: LocalizedFoodOption[];
  placeholder: string;
  quickAddLabel: string;
  onValueChange: (value: string) => void;
}

export function FoodSelect({
  selectedFoodId,
  foodLookup,
  options,
  placeholder,
  quickAddLabel,
  onValueChange,
}: FoodSelectProps) {
  const { t } = useTranslation();

  const selectedFood = useMemo(() => {
    if (!selectedFoodId || selectedFoodId === '__add_new_food__') {
      return undefined;
    }
    return foodLookup[selectedFoodId];
  }, [foodLookup, selectedFoodId]);

  return (
    <Select value={selectedFoodId} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder={placeholder}>
          {selectedFood && (
            <div className="flex items-center gap-1 truncate">
              <span>{selectedFood.emoji || '🍽️'}</span>
              <span className="truncate">
                {selectedFood.nameKey
                  ? t(selectedFood.nameKey)
                  : selectedFood.name}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)]">
        {options.map(({ food, name, serving, unitLabel }) => (
          <SelectItem key={food.id} value={food.id}>
            <div className="flex flex-col text-left whitespace-normal">
              <span className="text-xs font-medium flex items-center gap-1">
                <span>{food.emoji || '🍽️'}</span>
                <span className="truncate">{name}</span>
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                {unitLabel && <span>{unitLabel}</span>}
                {unitLabel && serving && <span>·</span>}
                {serving && <span className="truncate">{serving}</span>}
                {food.preparation && (
                  <span>
                    {food.preparation === 'raw'
                      ? t('mealPlanner.preparationShort.raw')
                      : t('mealPlanner.preparationShort.cooked')}
                  </span>
                )}
              </span>
            </div>
          </SelectItem>
        ))}
        <SelectItem value="__add_new_food__">
          <span className="text-xs">➕ {quickAddLabel}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
