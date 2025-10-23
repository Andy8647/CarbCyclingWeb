import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/ui/section-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DayAllocationRing } from '@/components/ui/day-allocation-ring';
import type { BasicInfoSectionProps } from './types';

export function DayAllocationSection({
  form,
  watchedValues,
}: Omit<BasicInfoSectionProps, 'unitSystem'>) {
  const { t } = useTranslation();
  const { setValue } = form;

  return (
    <div className="h-full">
      <SectionCard
        title={t('basicInfo.dayAllocation')}
        emoji="📊"
        className="h-full flex flex-col"
      >
        {/* Include Mid-Carb toggle */}
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs sm:text-sm text-muted-foreground">
            {t('basicInfo.includeMidCarb')}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {watchedValues.includeMidCarb ? 'On' : 'Off'}
            </span>
            <Switch
              checked={watchedValues.includeMidCarb}
              onCheckedChange={(checked: boolean) => {
                setValue('includeMidCarb', checked as boolean, {
                  shouldValidate: true,
                });

                const total = watchedValues.cycleDays;
                let high = watchedValues.highDays || 1;
                let mid = watchedValues.midDays || 0;
                let low = watchedValues.lowDays || 1;

                if (!checked) {
                  // Disable mid: reassign mid days to low; enforce min 1 for high/low
                  low = Math.max(1, low + mid);
                  high = Math.max(1, Math.min(total - 1, high));
                  low = Math.max(1, total - high);
                  setValue('midDays', 0, { shouldValidate: true });
                  setValue('highDays', high, { shouldValidate: true });
                  setValue('lowDays', low, { shouldValidate: true });

                  // Macro rings: hide mid by setting it to 0 and adjust low to keep 100%
                  setValue('midCarbPercent', 0, { shouldValidate: true });
                  setValue(
                    'lowCarbPercent',
                    100 - (watchedValues.highCarbPercent || 0),
                    {
                      shouldValidate: true,
                    }
                  );
                  setValue('midFatPercent', 0, { shouldValidate: true });
                  setValue(
                    'lowFatPercent',
                    100 - (watchedValues.highFatPercent || 0),
                    {
                      shouldValidate: true,
                    }
                  );
                } else {
                  // Enable mid: allocate 1 day to mid by taking from low (fallback to high)
                  if (low > 1) {
                    low -= 1;
                  } else if (high > 1) {
                    high -= 1;
                  }
                  mid = 1;
                  // Recompute if totals off
                  const ensureHigh = Math.max(1, Math.min(total - 2, high));
                  const ensureLow = Math.max(
                    1,
                    Math.min(total - ensureHigh - 1, low)
                  );
                  const ensureMid = total - ensureHigh - ensureLow;
                  setValue('highDays', ensureHigh, { shouldValidate: true });
                  setValue('midDays', ensureMid, { shouldValidate: true });
                  setValue('lowDays', ensureLow, { shouldValidate: true });

                  // Give mid a small starting share (5%), reduce low to keep total 100
                  const newMidPct = 5;
                  const newLowCarb = Math.max(
                    0,
                    100 - (watchedValues.highCarbPercent || 0) - newMidPct
                  );
                  const newLowFat = Math.max(
                    0,
                    100 - (watchedValues.highFatPercent || 0) - newMidPct
                  );
                  setValue('midCarbPercent', newMidPct, {
                    shouldValidate: true,
                  });
                  setValue('lowCarbPercent', newLowCarb, {
                    shouldValidate: true,
                  });
                  setValue('midFatPercent', newMidPct, {
                    shouldValidate: true,
                  });
                  setValue('lowFatPercent', newLowFat, {
                    shouldValidate: true,
                  });
                }
              }}
            />
          </div>
        </div>
        <DayAllocationRing
          cycleDays={watchedValues.cycleDays}
          highDays={watchedValues.highDays || 1}
          midDays={watchedValues.midDays ?? 0}
          lowDays={watchedValues.lowDays || 1}
          includeMid={watchedValues.includeMidCarb}
          onHighChange={(value) =>
            setValue('highDays', value, { shouldValidate: true })
          }
          onMidChange={(value) =>
            setValue('midDays', value, { shouldValidate: true })
          }
          onLowChange={(value) =>
            setValue('lowDays', value, { shouldValidate: true })
          }
          legendPosition="right"
        />
      </SectionCard>
    </div>
  );
}
