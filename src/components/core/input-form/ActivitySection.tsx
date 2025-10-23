import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DistributionRing } from '@/components/ui/distribution-ring';
import { DEFAULT_DISTRIBUTION } from '@/lib/calculator';
import type { ActivitySectionProps } from './types';

const CARB_RING_COLORS = {
  high: '#9a3412',
  mid: '#fb923c',
  low: '#fed7aa',
};

const FAT_RING_COLORS = {
  high: '#0369a1',
  mid: '#0ea5e9',
  low: '#bae6fd',
};

export function ActivitySection({ form, watchedValues }: ActivitySectionProps) {
  const { t } = useTranslation();
  const {
    setValue,
    formState: { errors },
  } = form;

  const handleResetDistribution = () => {
    const includeMid = watchedValues.includeMidCarb;
    if (includeMid) {
      setValue('highCarbPercent', DEFAULT_DISTRIBUTION.high.carbs, {
        shouldValidate: true,
      });
      setValue('midCarbPercent', DEFAULT_DISTRIBUTION.medium.carbs, {
        shouldValidate: true,
      });
      setValue('lowCarbPercent', DEFAULT_DISTRIBUTION.low.carbs, {
        shouldValidate: true,
      });
      setValue('highFatPercent', DEFAULT_DISTRIBUTION.high.fat, {
        shouldValidate: true,
      });
      setValue('midFatPercent', DEFAULT_DISTRIBUTION.medium.fat, {
        shouldValidate: true,
      });
      setValue('lowFatPercent', DEFAULT_DISTRIBUTION.low.fat, {
        shouldValidate: true,
      });
    } else {
      // No mid: set mid=0 and split totals between high/low keeping current high
      setValue('midCarbPercent', 0, { shouldValidate: true });
      setValue('lowCarbPercent', 100 - DEFAULT_DISTRIBUTION.high.carbs, {
        shouldValidate: true,
      });
      setValue('highCarbPercent', DEFAULT_DISTRIBUTION.high.carbs, {
        shouldValidate: true,
      });

      setValue('midFatPercent', 0, { shouldValidate: true });
      setValue('lowFatPercent', 100 - DEFAULT_DISTRIBUTION.high.fat, {
        shouldValidate: true,
      });
      setValue('highFatPercent', DEFAULT_DISTRIBUTION.high.fat, {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-2">
        {/* Reset Button */}
        <div className="flex items-center justify-end mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDistribution}
            className="h-8 text-xs"
          >
            {t('activity.resetToDefault')}
          </Button>
        </div>

        {/* Distribution Rings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DistributionRing
            highPercent={watchedValues.highCarbPercent}
            midPercent={watchedValues.midCarbPercent}
            lowPercent={watchedValues.lowCarbPercent}
            includeMid={watchedValues.includeMidCarb}
            stepPercent={5}
            onHighChange={(value, isDragging) =>
              setValue('highCarbPercent', value, {
                shouldValidate: !isDragging,
              })
            }
            onMidChange={(value, isDragging) =>
              setValue('midCarbPercent', value, { shouldValidate: !isDragging })
            }
            onLowChange={(value, isDragging) =>
              setValue('lowCarbPercent', value, { shouldValidate: !isDragging })
            }
            label={t('nutrition.carbCoeff')}
            colors={CARB_RING_COLORS}
          />
          <DistributionRing
            highPercent={watchedValues.highFatPercent}
            midPercent={watchedValues.midFatPercent}
            lowPercent={watchedValues.lowFatPercent}
            includeMid={watchedValues.includeMidCarb}
            stepPercent={5}
            onHighChange={(value, isDragging) =>
              setValue('highFatPercent', value, { shouldValidate: !isDragging })
            }
            onMidChange={(value, isDragging) =>
              setValue('midFatPercent', value, { shouldValidate: !isDragging })
            }
            onLowChange={(value, isDragging) =>
              setValue('lowFatPercent', value, { shouldValidate: !isDragging })
            }
            label={t('nutrition.fatCoeff')}
            colors={FAT_RING_COLORS}
          />
        </div>

        {errors.cycleDays && (
          <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center">
            <span>⚠️</span>
            {errors.cycleDays.message}
          </p>
        )}
      </div>
    </div>
  );
}
