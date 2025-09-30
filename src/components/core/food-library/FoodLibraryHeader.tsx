import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FoodLibraryHeaderProps } from './types';

export function FoodLibraryHeader({
  search,
  onSearchChange,
  showForm,
  onToggleForm,
}: FoodLibraryHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold">
          {t('mealPlanner.foodLibraryTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('mealPlanner.foodLibrarySubtitle')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('mealPlanner.searchPlaceholder')}
          className="h-8 w-44 text-xs"
        />
        <Button
          size="sm"
          variant={showForm ? 'secondary' : 'default'}
          onClick={onToggleForm}
        >
          {showForm
            ? t('mealPlanner.hideAddFoodForm')
            : t('mealPlanner.showAddFoodForm')}
        </Button>
      </div>
    </div>
  );
}
