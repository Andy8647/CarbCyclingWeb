import { useTranslation } from 'react-i18next';
import { CompactInput } from '@/components/ui/compact-input';
import { RadioGroup } from '@/components/ui/radio-group';
import { SectionCard } from '@/components/ui/section-card';
import { RadioCard } from '@/components/ui/radio-card';
import type { NutritionSectionProps } from './types';

export function NutritionSection({
  form,
  watchedValues,
}: NutritionSectionProps) {
  const { t } = useTranslation();
  const {
    setValue,
    formState: { errors },
  } = form;

  const handleBodyTypeChange = (value: string) => {
    const bodyType = value as 'endomorph' | 'mesomorph' | 'ectomorph';

    // Auto-fill nutrition coefficients based on body type
    const coefficients = {
      endomorph: { carbCoeff: 2.0, proteinCoeff: 1.5, fatCoeff: 1.0 },
      mesomorph: { carbCoeff: 2.5, proteinCoeff: 1.2, fatCoeff: 0.9 },
      ectomorph: { carbCoeff: 3.0, proteinCoeff: 1.0, fatCoeff: 1.1 },
    };

    const { carbCoeff, proteinCoeff, fatCoeff } = coefficients[bodyType];

    // Use React's batching - no need for setTimeout, React will batch these updates
    setValue('bodyType', bodyType, { shouldValidate: true });
    setValue('carbCoeff', carbCoeff, { shouldValidate: true });
    setValue('proteinCoeff', proteinCoeff, { shouldValidate: true });
    setValue('fatCoeff', fatCoeff, { shouldValidate: true });
  };

  const nutritionEmojis = t('nutrition.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

  return (
    <div className="lg:col-span-2">
      <SectionCard
        title={t('nutrition.title')}
        emoji="🏋️"
        description={(() => {
          return watchedValues.bodyType
            ? t(`nutrition.descriptions.${watchedValues.bodyType}`)
            : t('nutrition.descriptions.default');
        })()}
      >
        {/* Body type selection - top row */}
        <RadioGroup
          value={watchedValues.bodyType}
          onValueChange={handleBodyTypeChange}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-1 mb-3"
        >
          <RadioCard
            value="endomorph"
            id="endomorph"
            emoji="🔺"
            title={t('nutrition.endomorph')}
            description=""
            isSelected={watchedValues.bodyType === 'endomorph'}
          />
          <RadioCard
            value="mesomorph"
            id="mesomorph"
            emoji="⬜"
            title={t('nutrition.mesomorph')}
            description=""
            isSelected={watchedValues.bodyType === 'mesomorph'}
          />
          <RadioCard
            value="ectomorph"
            id="ectomorph"
            emoji="🔻"
            title={t('nutrition.ectomorph')}
            description=""
            isSelected={watchedValues.bodyType === 'ectomorph'}
          />
        </RadioGroup>

        {/* Nutrition coefficients - bottom section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <CompactInput
            key={`carb-${watchedValues.bodyType}`}
            label={t('nutrition.carbCoeff')}
            emoji={nutritionEmojis?.carbs ?? 'C'}
            type="number"
            step="0.1"
            min="2.0"
            max="8.0"
            value={watchedValues.carbCoeff || 5.0}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                return;
              }
              setValue('carbCoeff', parseFloat(value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="5.0"
            unit="g/kg"
          />
          <CompactInput
            key={`protein-${watchedValues.bodyType}`}
            label={t('nutrition.proteinCoeff')}
            emoji={nutritionEmojis?.protein ?? 'P'}
            type="number"
            step="0.1"
            min="0.8"
            max="2.5"
            value={watchedValues.proteinCoeff || 1.2}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                return;
              }
              setValue('proteinCoeff', parseFloat(value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.2"
            unit="g/kg"
          />
          <CompactInput
            key={`fat-${watchedValues.bodyType}`}
            label={t('nutrition.fatCoeff')}
            emoji={nutritionEmojis?.fat ?? 'F'}
            type="number"
            step="0.1"
            min="0.5"
            max="1.5"
            value={watchedValues.fatCoeff || 1.0}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                return;
              }
              setValue('fatCoeff', parseFloat(value) || 0, {
                shouldValidate: true,
              });
            }}
            placeholder="1.0"
            unit="g/kg"
          />
        </div>

        {errors.bodyType && (
          <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center mt-2">
            <span>⚠️</span>
            {errors.bodyType.message}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
