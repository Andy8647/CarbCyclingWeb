import { useTranslation } from 'react-i18next';
import { CompactInput } from '@/components/ui/compact-input';
import { SectionCard } from '@/components/ui/section-card';
import { SliderSection } from '@/components/ui/slider-section';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { ActivitySection } from './ActivitySection';
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

export function CycleDaysSection({
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
      const includeMid = watchedValues.includeMidCarb;
      if (includeMid) {
        setValue('highDays', defaultAllocation.high, { shouldValidate: true });
        setValue('midDays', defaultAllocation.medium, { shouldValidate: true });
        setValue('lowDays', defaultAllocation.low, { shouldValidate: true });
      } else {
        setValue('highDays', defaultAllocation.high, { shouldValidate: true });
        setValue('midDays', 0, { shouldValidate: true });
        setValue('lowDays', defaultAllocation.low + defaultAllocation.medium, {
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <SectionCard
        title={t('basicInfo.cycleSettings')}
        emoji="🔄"
        className="flex-1 flex flex-col"
      >
        {/* Popover trigger in header - positioned absolutely */}
        <div className="absolute top-2 right-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-medium text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180">
                <span className="text-sm">🎯</span>
                <span className="hidden sm:inline">
                  {t('activity.distribution')}
                </span>
                <ChevronDownIcon className="size-[1em] shrink-0 transition-transform duration-200" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0" align="end" side="bottom">
              <ActivitySection form={form} watchedValues={watchedValues} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Weight */}
        <div className="mb-2">
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

        {/* Cycle Days Slider */}
        <div className="space-y-1.5">
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
      </SectionCard>
    </div>
  );
}
