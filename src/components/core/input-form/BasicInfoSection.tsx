import { useTranslation } from 'react-i18next';
import { CompactInput } from '@/components/ui/compact-input';
import { SectionCard } from '@/components/ui/section-card';
import { SliderSection } from '@/components/ui/slider-section';
import { DayAllocationRing } from '@/components/ui/day-allocation-ring';
import type { BasicInfoSectionProps } from './types';

// Default day allocation based on cycle length
const DAY_ALLOCATION: Record<
  number,
  { high: number; medium: number; low: number }
> = {
  3: { high: 1, medium: 1, low: 1 },
  4: { high: 1, medium: 2, low: 1 },
  5: { high: 1, medium: 2, low: 2 },
  6: { high: 2, medium: 2, low: 2 },
  7: { high: 2, medium: 3, low: 2 },
};

export function BasicInfoSection({
  form,
  unitSystem,
  watchedValues,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const { setValue } = form;

  const convertWeight = (kg: number, to: 'metric' | 'imperial') => {
    return to === 'imperial' ? Math.round(kg * 2.20462 * 10) / 10 : kg;
  };

  const handleWeightChange = (value: string) => {
    if (value === '') {
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const kgValue = unitSystem === 'imperial' ? numValue / 2.20462 : numValue;
      setValue('weight', Math.round(kgValue * 10) / 10, {
        shouldValidate: true,
      });
    }
  };

  // When cycleDays changes, update day allocation to default distribution
  const handleCycleDaysChange = (value: number) => {
    setValue('cycleDays', value, { shouldValidate: true });

    // Set default day allocation based on cycle length
    const defaultAllocation =
      DAY_ALLOCATION[value as keyof typeof DAY_ALLOCATION];
    if (defaultAllocation) {
      setValue('highDays', defaultAllocation.high, { shouldValidate: true });
      setValue('midDays', defaultAllocation.medium, { shouldValidate: true });
      setValue('lowDays', defaultAllocation.low, { shouldValidate: true });
    }
  };

  return (
    <div>
      <SectionCard title={t('basicInfo.title')} emoji="👤">
        {/* Cycle Days Slider */}
        <div className="space-y-2">
          <SliderSection
            title={t('activity.cycleDays')}
            emoji="📅"
            value={watchedValues.cycleDays}
            onValueChange={handleCycleDaysChange}
            min={3}
            max={7}
            step={1}
            unit={t('activity.days')}
            options={[3, 4, 5, 6, 7]}
            getDescription={() => ''}
          />
        </div>

        {/* Weight */}
        <div className="mt-4">
          <CompactInput
            key={`weight-${unitSystem}`}
            label={t('common.weight')}
            emoji="⚖️"
            type="number"
            step={unitSystem === 'imperial' ? '0.1' : '1'}
            min={unitSystem === 'imperial' ? '66' : '30'}
            max={unitSystem === 'imperial' ? '440' : '200'}
            defaultValue={convertWeight(watchedValues.weight || 70, unitSystem)}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="70"
            unit={unitSystem === 'metric' ? t('basicInfo.weightUnit') : 'lb'}
          />
        </div>

        {/* Day Allocation Ring */}
        <div className="space-y-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 px-2">
            <span className="text-base font-semibold text-foreground">
              {t('basicInfo.dayAllocation')}
            </span>
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
          />
        </div>
      </SectionCard>
    </div>
  );
}
