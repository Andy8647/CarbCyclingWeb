import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ExportActions } from './ExportActions';

interface ResultsHeaderProps {
  showMealSlots: boolean;
  setShowMealSlots: (value: boolean | ((prev: boolean) => boolean)) => void;
  showFoodLibrary: boolean;
  setShowFoodLibrary: (value: boolean | ((prev: boolean) => boolean)) => void;
  onCopyAsMarkdown: () => void;
  onCopyAsCSV: () => void;
  onExportPNG: () => void;
  onResetMealPlan: () => void;
  cycleDays: number;
}

export function ResultsHeader({
  showMealSlots,
  setShowMealSlots,
  showFoodLibrary,
  setShowFoodLibrary,
  onCopyAsMarkdown,
  onCopyAsCSV,
  onExportPNG,
  onResetMealPlan,
  cycleDays,
}: ResultsHeaderProps) {
  const { t } = useTranslation();

  const handleToggleMealSlots = useCallback(() => {
    setShowMealSlots((prev) => !prev);
  }, [setShowMealSlots]);

  const handleToggleFoodLibrary = useCallback(() => {
    setShowFoodLibrary((prev) => !prev);
  }, [setShowFoodLibrary]);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">🍽️</span>
        <h2 className="text-lg font-bold text-foreground">
          {t('results.title')}
        </h2>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
        data-export-exclude
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant={showMealSlots ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={handleToggleMealSlots}
          >
            <span>🥗</span>
            <span className="hidden sm:inline ml-1">
              {showMealSlots
                ? t('mealPlanner.hideMealSlots')
                : t('mealPlanner.showMealSlots')}
            </span>
          </Button>

          <Button
            variant={showFoodLibrary ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={handleToggleFoodLibrary}
          >
            <span>🍱</span>
            <span className="hidden sm:inline ml-1">
              {showFoodLibrary
                ? t('mealPlanner.hideLibrary')
                : t('mealPlanner.showLibrary')}
            </span>
          </Button>

          <ExportActions
            onCopyAsMarkdown={onCopyAsMarkdown}
            onCopyAsCSV={onCopyAsCSV}
            onExportPNG={onExportPNG}
            onResetMealPlan={onResetMealPlan}
            cycleDays={cycleDays}
          />
        </div>
      </div>
    </div>
  );
}
