import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/ui/section-card';
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
        <DayAllocationRing
          cycleDays={watchedValues.cycleDays}
          highDays={watchedValues.highDays || 1}
          midDays={watchedValues.midDays || 1}
          lowDays={watchedValues.lowDays || 1}
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
