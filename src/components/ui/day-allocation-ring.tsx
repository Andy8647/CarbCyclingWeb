import { useTranslation } from 'react-i18next';
import { DistributionRing } from './distribution-ring';

interface DayAllocationRingProps {
  cycleDays: number;
  highDays: number;
  midDays: number;
  lowDays: number;
  onHighChange: (value: number) => void;
  onMidChange: (value: number) => void;
  onLowChange: (value: number) => void;
  legendPosition?: 'bottom' | 'right';
}

const DAYS_RING_COLORS = {
  high: '#E57373', // Material Red 300
  mid: '#FFB74D', // Material Orange 300
  low: '#81C784', // Material Green 300
};

export function DayAllocationRing({
  cycleDays,
  highDays,
  midDays,
  lowDays,
  onHighChange,
  onMidChange,
  onLowChange,
  legendPosition = 'bottom',
}: DayAllocationRingProps) {
  const { t } = useTranslation();

  // Convert days to percentages for the ring
  const daysToPercent = (days: number) => {
    return cycleDays > 0 ? (days / cycleDays) * 100 : 0;
  };

  // Convert percentages back to days (with rounding and constraints)
  const percentToDays = (percent: number) => {
    const rawDays = Math.round((percent * cycleDays) / 100);

    // Ensure at least 1 day for each type
    const minDays = 1;
    const clampedDays = Math.max(minDays, Math.min(cycleDays - 2, rawDays)); // -2 to leave room for other two types

    return clampedDays;
  };

  const handleHighChange = (percent: number) => {
    const newHigh = percentToDays(percent);
    // Adjust mid to maintain total
    const remaining = cycleDays - newHigh - lowDays;
    if (remaining >= 1) {
      onHighChange(newHigh);
      onMidChange(remaining);
    }
  };

  const handleMidChange = (percent: number) => {
    const newMid = percentToDays(percent);
    onMidChange(newMid);
  };

  const handleLowChange = (percent: number) => {
    const newLow = percentToDays(percent);
    // Adjust mid to maintain total
    const remaining = cycleDays - highDays - newLow;
    if (remaining >= 1) {
      onLowChange(newLow);
      onMidChange(remaining);
    }
  };

  const legendContent = (
    <div
      className={`flex ${legendPosition === 'right' ? 'flex-col' : 'flex-row'} gap-2 text-xs text-slate-600 dark:text-slate-400`}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: DAYS_RING_COLORS.high }}
        />
        <span className="font-medium whitespace-nowrap">
          {t('basicInfo.highDays')}: {highDays}
          {t('activity.days')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: DAYS_RING_COLORS.mid }}
        />
        <span className="font-medium whitespace-nowrap">
          {t('basicInfo.midDays')}: {midDays}
          {t('activity.days')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: DAYS_RING_COLORS.low }}
        />
        <span className="font-medium whitespace-nowrap">
          {t('basicInfo.lowDays')}: {lowDays}
          {t('activity.days')}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={`flex ${legendPosition === 'right' ? 'flex-row items-center justify-center' : 'flex-col items-center'} gap-3`}
    >
      <div className="shrink-0">
        <DistributionRing
          highPercent={daysToPercent(highDays)}
          midPercent={daysToPercent(midDays)}
          lowPercent={daysToPercent(lowDays)}
          onHighChange={handleHighChange}
          onMidChange={handleMidChange}
          onLowChange={handleLowChange}
          label=""
          colors={DAYS_RING_COLORS}
          hideLabels={true}
          size={160}
        />
      </div>

      {/* Display actual days instead of percentages */}
      {legendContent}
    </div>
  );
}
