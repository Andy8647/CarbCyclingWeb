import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import {
  SERVING_UNIT_OPTIONS,
  type ServingUnit,
} from '@/lib/persistence-types';
import type { CreateOrUpdateFoodModalProps } from './types';

export function CreateOrUpdateFoodModal({
  open,
  mode,
  title,
  submitLabel,
  cancelLabel,
  formState,
  onClose,
  onSubmit,
  onFieldChange,
  servingUnitOptions,
  onServingUnitChange,
  showCategoryField,
  onDelete,
  deleteLabel,
}: CreateOrUpdateFoodModalProps) {
  const { t } = useTranslation();

  const computedTitle =
    title ??
    (mode === 'create'
      ? t('mealPlanner.quickAddTitle')
      : t('mealPlanner.editFoodTitle'));

  const computedSubmitLabel =
    submitLabel ??
    (mode === 'create'
      ? t('mealPlanner.quickAddSubmit')
      : t('mealPlanner.editFoodSubmit'));

  const computedCancelLabel = cancelLabel ?? t('common.cancel');
  const computedDeleteLabel = deleteLabel ?? t('mealPlanner.removeCustomFood');

  const unitOptions = useMemo(
    () => servingUnitOptions ?? SERVING_UNIT_OPTIONS,
    [servingUnitOptions]
  );

  const handleServingUnitChange = (unit: ServingUnit) => {
    if (onServingUnitChange) {
      onServingUnitChange(unit);
      return;
    }

    onFieldChange('servingUnit', unit);
  };

  const shouldShowCategory = showCategoryField ?? mode === 'create';

  return (
    <Modal open={open} onClose={onClose} title={computedTitle}>
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
          <Input
            placeholder={t('mealPlanner.foodNamePlaceholder')}
            value={formState.name}
            onChange={(event) => onFieldChange('name', event.target.value)}
            className="h-9 text-sm"
          />
          <Input
            value={formState.emoji}
            maxLength={4}
            placeholder={t('mealPlanner.emojiPlaceholder')}
            onChange={(event) => onFieldChange('emoji', event.target.value)}
            className="h-9 text-sm"
          />
        </div>

        {shouldShowCategory && (
          <Input
            placeholder={t('mealPlanner.fieldCategory')}
            value={formState.category}
            onChange={(event) => onFieldChange('category', event.target.value)}
            className="h-9 text-sm"
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={formState.servingUnit}
            onValueChange={(value) =>
              handleServingUnitChange(value as ServingUnit)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('mealPlanner.unitPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t(`mealPlanner.servingUnits.${unit}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={formState.defaultServing}
            onChange={(event) =>
              onFieldChange('defaultServing', event.target.value)
            }
            className="h-9 text-sm flex-1"
          />
          <Select
            value={formState.preparation}
            onValueChange={(value: 'raw' | 'cooked') =>
              onFieldChange('preparation', value)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue
                placeholder={t('mealPlanner.preparationPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">
                {t('mealPlanner.preparationRaw')}
              </SelectItem>
              <SelectItem value="cooked">
                {t('mealPlanner.preparationCooked')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              {t('mealPlanner.carbsLabel')}
            </label>
            <NumberInput
              step={0.1}
              min={0}
              value={formState.carbs}
              onChange={(value) => onFieldChange('carbs', value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              {t('mealPlanner.proteinLabel')}
            </label>
            <NumberInput
              step={0.1}
              min={0}
              value={formState.protein}
              onChange={(value) => onFieldChange('protein', value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              {t('mealPlanner.fatLabel')}
            </label>
            <NumberInput
              step={0.1}
              min={0}
              value={formState.fat}
              onChange={(value) => onFieldChange('fat', value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('mealPlanner.servingUnitHint')}
        </p>

        {onDelete ? (
          <div className="flex items-center justify-between gap-2">
            <Button variant="destructive" size="sm" onClick={onDelete}>
              {computedDeleteLabel}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {computedCancelLabel}
              </Button>
              <Button size="sm" onClick={onSubmit}>
                {computedSubmitLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {computedCancelLabel}
            </Button>
            <Button size="sm" onClick={onSubmit}>
              {computedSubmitLabel}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
