import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { QuickAddModalProps } from './types';

export function QuickAddModal({
  open,
  onClose,
  formState,
  onFormChange,
  onSubmit,
}: QuickAddModalProps) {
  const { t } = useTranslation();

  const updateFormField = (field: string, value: string | ServingUnit) => {
    onFormChange({ ...formState, [field]: value });
  };

  return (
    <Modal open={open} onClose={onClose} title={t('mealPlanner.quickAddTitle')}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder={t('mealPlanner.fieldName')}
            value={formState.name}
            onChange={(event) => updateFormField('name', event.target.value)}
            className="h-9 text-sm"
          />
          <Input
            placeholder={t('mealPlanner.fieldCategory')}
            value={formState.category}
            onChange={(event) =>
              updateFormField('category', event.target.value)
            }
            className="h-9 text-sm"
          />
          <Input
            placeholder={t('mealPlanner.fieldServing')}
            value={formState.defaultServing}
            onChange={(event) =>
              updateFormField('defaultServing', event.target.value)
            }
            className="h-9 text-sm"
          />
          <Select
            value={formState.servingUnit}
            onValueChange={(value: ServingUnit) =>
              updateFormField('servingUnit', value)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue
                placeholder={t('mealPlanner.servingUnitPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {SERVING_UNIT_OPTIONS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t(`mealPlanner.servingUnits.${unit}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={formState.preparation}
            onValueChange={(value: 'raw' | 'cooked') =>
              updateFormField('preparation', value)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('mealPlanner.fieldPreparation')} />
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
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder={t('mealPlanner.fieldCarbs')}
            value={formState.carbs}
            onChange={(event) => updateFormField('carbs', event.target.value)}
            className="h-9 text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder={t('mealPlanner.fieldProtein')}
            value={formState.protein}
            onChange={(event) => updateFormField('protein', event.target.value)}
            className="h-9 text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder={t('mealPlanner.fieldFat')}
            value={formState.fat}
            onChange={(event) => updateFormField('fat', event.target.value)}
            className="h-9 text-sm"
          />
          <Input
            value={formState.emoji}
            maxLength={4}
            placeholder={t('mealPlanner.fieldEmoji')}
            onChange={(event) => updateFormField('emoji', event.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('mealPlanner.servingUnitHint')}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" onClick={onSubmit}>
            {t('mealPlanner.quickAddSubmit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
