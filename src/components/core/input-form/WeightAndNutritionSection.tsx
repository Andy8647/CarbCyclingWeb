import { useTranslation } from 'react-i18next';
import { CompactInput } from '@/components/ui/compact-input';
import { SectionCard } from '@/components/ui/section-card';
import type { BasicInfoSectionProps } from './types';

export function WeightAndNutritionSection({
  form,
  watchedValues,
}: Omit<BasicInfoSectionProps, 'unitSystem'>) {
  const { t } = useTranslation();
  const { setValue } = form;

  const nutritionEmojis = t('nutrition.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

  const stripLeadingEmoji = (s: string) =>
    s.replace(/^\p{Extended_Pictographic}+\s*/u, '');
  const lowTitle = `${stripLeadingEmoji(t('results.dayTypes.low'))} • ${t('nutrition.title')}`;
  const highTitle = `${stripLeadingEmoji(t('results.dayTypes.high'))} • ${t('nutrition.title')}`;

  return (
    <div className="h-full space-y-2">
      <SectionCard className="flex flex-col" title={lowTitle} emoji="🌿">
        <div className="grid grid-cols-3 gap-1.5">
          <CompactInput
            label={t('nutrition.carbCoeff')}
            emoji={nutritionEmojis?.carbs ?? 'C'}
            type="number"
            step="0.1"
            min="0.5"
            max="8.0"
            value={watchedValues.lowCarbCoeff ?? 1.25}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('lowCarbCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.25"
            unit="g/kg"
          />
          <CompactInput
            label={t('nutrition.proteinCoeff')}
            emoji={nutritionEmojis?.protein ?? 'P'}
            type="number"
            step="0.1"
            min="0.5"
            max="2.5"
            value={watchedValues.lowProteinCoeff ?? 1.7}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('lowProteinCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.7"
            unit="g/kg"
          />
          <CompactInput
            label={t('nutrition.fatCoeff')}
            emoji={nutritionEmojis?.fat ?? 'F'}
            type="number"
            step="0.1"
            min="0.3"
            max="2.0"
            value={watchedValues.lowFatCoeff ?? 1.1}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('lowFatCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.1"
            unit="g/kg"
          />
        </div>
      </SectionCard>

      <SectionCard className="flex flex-col" title={highTitle} emoji="⚡">
        <div className="grid grid-cols-3 gap-1.5">
          <CompactInput
            label={t('nutrition.carbCoeff')}
            emoji={nutritionEmojis?.carbs ?? 'C'}
            type="number"
            step="0.1"
            min="0.5"
            max="8.0"
            value={watchedValues.highCarbCoeff ?? 4.0}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('highCarbCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="4.0"
            unit="g/kg"
          />
          <CompactInput
            label={t('nutrition.proteinCoeff')}
            emoji={nutritionEmojis?.protein ?? 'P'}
            type="number"
            step="0.1"
            min="0.5"
            max="2.5"
            value={watchedValues.highProteinCoeff ?? 1.0}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('highProteinCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.0"
            unit="g/kg"
          />
          <CompactInput
            label={t('nutrition.fatCoeff')}
            emoji={nutritionEmojis?.fat ?? 'F'}
            type="number"
            step="0.1"
            min="0.3"
            max="2.0"
            value={watchedValues.highFatCoeff ?? 0.7}
            onChange={(e) => {
              if (e.target.value === '') return;
              setValue('highFatCoeff', parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="0.7"
            unit="g/kg"
          />
        </div>
      </SectionCard>
    </div>
  );
}
