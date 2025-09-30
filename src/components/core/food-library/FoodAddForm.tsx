import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ServingUnit, CategoryType } from '@/lib/persistence-types';
import {
  SERVING_UNIT_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
} from '@/lib/persistence-types';
import type { FoodAddFormProps } from './types';

export function FoodAddForm({
  formState,
  onFormChange,
  onSubmit,
}: FoodAddFormProps) {
  const { t } = useTranslation();

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-3"
      onSubmit={onSubmit}
    >
      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldName')}</Label>
        <Input
          value={formState.name}
          onChange={(event) =>
            onFormChange({ ...formState, name: event.target.value })
          }
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldCategory')}</Label>
        <Select
          value={formState.category}
          onValueChange={(value: CategoryType) =>
            onFormChange({ ...formState, category: value })
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('mealPlanner.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`mealPlanner.categories.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldServing')}</Label>
        <Input
          value={formState.defaultServing}
          onChange={(event) =>
            onFormChange({ ...formState, defaultServing: event.target.value })
          }
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldServingUnit')}</Label>
        <Select
          value={formState.servingUnit}
          onValueChange={(value: ServingUnit) =>
            onFormChange({ ...formState, servingUnit: value })
          }
        >
          <SelectTrigger className="h-8 text-sm">
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
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {t('mealPlanner.servingUnitHint')}
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldPreparation')}</Label>
        <Select
          value={formState.preparation}
          onValueChange={(value: 'raw' | 'cooked') =>
            onFormChange({ ...formState, preparation: value })
          }
        >
          <SelectTrigger className="h-8 text-sm">
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
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldCarbs')}</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={formState.carbs}
          onChange={(event) =>
            onFormChange({ ...formState, carbs: event.target.value })
          }
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldProtein')}</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={formState.protein}
          onChange={(event) =>
            onFormChange({ ...formState, protein: event.target.value })
          }
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('mealPlanner.fieldFat')}</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={formState.fat}
          onChange={(event) =>
            onFormChange({ ...formState, fat: event.target.value })
          }
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="md:col-span-3 flex justify-end">
        <Button type="submit" size="sm">
          {t('mealPlanner.submitNewFood')}
        </Button>
      </div>
    </form>
  );
}
