import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ExportActionsProps {
  onCopyAsMarkdown: () => void;
  onCopyAsCSV: () => void;
  onExportPNG: () => void;
  onResetMealPlan: () => void;
  cycleDays: number;
}

export function ExportActions({
  onCopyAsMarkdown,
  onCopyAsCSV,
  onExportPNG,
  onResetMealPlan,
  cycleDays,
}: ExportActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl">
            <span>📋</span>
            <span className="hidden sm:inline ml-1">
              {t('results.copyResults')}
            </span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onCopyAsMarkdown}>
            <span className="mr-2">📝</span>
            {t('results.copyAsMarkdown')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyAsCSV}>
            <span className="mr-2">📊</span>
            {t('results.copyAsCSV')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onResetMealPlan} disabled={!cycleDays}>
            <span className="mr-2">♻️</span>
            {t('mealPlanner.resetPlanAction')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" className="rounded-xl" onClick={onExportPNG}>
        <span>🖼️</span>
        <span className="hidden sm:inline ml-1">{t('results.exportPNG')}</span>
      </Button>
    </div>
  );
}
