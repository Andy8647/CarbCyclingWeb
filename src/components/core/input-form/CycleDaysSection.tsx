import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/ui/section-card';
import { CycleDaysRing } from '@/components/ui/cycle-days-ring';
import { SnapRing } from '@/components/ui/snap-ring';
import type { BasicInfoSectionProps } from './types';

// Default high/low allocation computed dynamically

export function CycleDaysSection({
  form,
  watchedValues,
}: Omit<BasicInfoSectionProps, 'unitSystem'>) {
  const { t } = useTranslation();
  const { setValue } = form;

  // When cycleDays changes, scale allocation proportionally (fallback to 1..value-1)
  const handleCycleDaysChange = (newDays: number) => {
    const oldDays = watchedValues.cycleDays || newDays;
    const currentHigh = Math.max(
      1,
      Math.min(oldDays - 1, watchedValues.highDays || Math.round(oldDays / 4))
    );
    const ratio = oldDays > 0 ? currentHigh / oldDays : 0.25;
    const high = Math.max(
      1,
      Math.min(newDays - 1, Math.round(newDays * ratio))
    );
    const low = Math.max(1, newDays - high);
    setValue('cycleDays', newDays, { shouldValidate: true });
    setValue('highDays', high, { shouldValidate: true });
    setValue('lowDays', low, { shouldValidate: true });
  };

  return (
    <div className="h-full flex flex-col">
      <SectionCard
        title={t('basicInfo.dayAllocation')}
        emoji="📊"
        className="flex-1"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-center">
          <CycleDaysRing
            value={Math.max(4, Math.min(7, watchedValues.cycleDays || 4))}
            min={4}
            max={7}
            onChange={handleCycleDaysChange}
            size={140}
          />
          {(() => {
            const total = Math.max(
              4,
              Math.min(7, watchedValues.cycleDays || 4)
            );
            const high = Math.max(
              1,
              Math.min(
                total - 1,
                watchedValues.highDays || Math.round(total / 4)
              )
            );
            const low = Math.max(1, total - high);
            const nodes = Array.from(
              { length: total - 1 },
              (_, i) => (i + 1) / total
            );
            const ratio = high / total;
            const label = `${t('basicInfo.highShort')}${high}/${t('basicInfo.lowShort')}${low}`;
            return (
              <SnapRing
                value={ratio}
                nodes={nodes}
                onInput={() => {}}
                onChange={(r) => {
                  const newHigh = Math.max(
                    1,
                    Math.min(total - 1, Math.round(r * total))
                  );
                  const newLow = Math.max(1, total - newHigh);
                  setValue('highDays', newHigh, { shouldValidate: true });
                  setValue('lowDays', newLow, { shouldValidate: true });
                }}
                size={140}
                thickness={0.25}
                colorActive="var(--accent)"
                colorRest="var(--muted)"
                handleColor="#ffffff"
                label={label}
                showMarkers={true}
                markersOnDrag={true}
              />
            );
          })()}
        </div>
      </SectionCard>
    </div>
  );
}
