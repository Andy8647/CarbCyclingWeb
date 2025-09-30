import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/lib/use-toast';
import { exportNodeToPNG } from '@/lib/export-to-png';
import { generateMarkdown, generateCSV } from '@/lib/result-card-logic';
import type {
  NutritionPlan,
  MetabolicData,
  DayData,
} from '@/lib/result-card-logic';

interface UseExportActionsProps {
  nutritionPlan: NutritionPlan | null;
  orderedDays: (DayData | null)[];
  dailyWorkouts: Record<number, string>;
  metabolicData: MetabolicData | null;
  macroIcons: Record<string, string>;
}

export function useExportActions({
  nutritionPlan,
  orderedDays,
  dailyWorkouts,
  metabolicData,
  macroIcons,
}: UseExportActionsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const exportRef = useRef<HTMLDivElement>(null);

  const handleCopyAsMarkdown = useCallback(() => {
    if (!nutritionPlan) return;

    const markdownText = generateMarkdown(
      nutritionPlan,
      orderedDays.filter((day): day is DayData => day !== null),
      dailyWorkouts,
      metabolicData,
      macroIcons,
      t
    );

    navigator.clipboard
      .writeText(markdownText)
      .then(() => {
        toast({
          variant: 'success',
          title: '📝 ' + t('results.copyAsMarkdown'),
          description: t('results.copySuccess'),
        });
      })
      .catch((err) => {
        console.error(t('results.copyError'), err);
        toast({
          variant: 'destructive',
          title: t('results.copyError'),
          description: 'Failed to copy to clipboard',
        });
      });
  }, [
    nutritionPlan,
    orderedDays,
    dailyWorkouts,
    metabolicData,
    macroIcons,
    t,
    toast,
  ]);

  const handleCopyAsCSV = useCallback(() => {
    if (!nutritionPlan) return;

    const csvText = generateCSV(
      nutritionPlan,
      orderedDays.filter((day): day is DayData => day !== null),
      dailyWorkouts,
      metabolicData,
      t
    );

    navigator.clipboard
      .writeText(csvText)
      .then(() => {
        toast({
          variant: 'success',
          title: '📊 ' + t('results.copyAsCSV'),
          description: t('results.copySuccess'),
        });
      })
      .catch((err) => {
        console.error(t('results.copyError'), err);
        toast({
          variant: 'destructive',
          title: t('results.copyError'),
          description: 'Failed to copy to clipboard',
        });
      });
  }, [nutritionPlan, orderedDays, dailyWorkouts, metabolicData, t, toast]);

  const handleExportPNG = useCallback(async () => {
    try {
      if (!nutritionPlan) {
        toast({
          variant: 'destructive',
          title: t('results.exportError'),
          description: 'No results to export',
        });
        return;
      }

      const node = exportRef.current;
      if (!node) return;

      const prevPadding = node.style.padding;
      node.style.padding = '24px';

      try {
        await exportNodeToPNG(node, {
          fileName: 'carb-cycling-plan.png',
          pixelRatio: 3,
          filter: (n) =>
            !(
              n instanceof HTMLElement && n.hasAttribute('data-export-exclude')
            ),
        });
      } finally {
        node.style.padding = prevPadding;
      }

      toast({
        variant: 'success',
        title: '🖼️ ' + t('results.exportPNG'),
        description: t('results.exportSuccess'),
      });
    } catch (err) {
      console.error('Export PNG failed', err);
      toast({
        variant: 'destructive',
        title: t('results.exportError'),
        description: 'Failed to export PNG',
      });
    }
  }, [nutritionPlan, t, toast]);

  return {
    exportRef,
    handleCopyAsMarkdown,
    handleCopyAsCSV,
    handleExportPNG,
  };
}
