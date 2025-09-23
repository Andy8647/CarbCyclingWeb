// import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { CompactInput } from '@/components/ui/compact-input';
import { RadioGroup } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionCard } from '@/components/ui/section-card';
import { RadioCard } from '@/components/ui/radio-card';
import { SliderSection } from '@/components/ui/slider-section';
import { useFormContext } from '@/lib/form-context';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function InputForm() {
  const { t } = useTranslation();
  const { form, unitSystem } = useFormContext();

  if (!form) return null;

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedValues = watch();

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

  const convertWeight = (kg: number, to: 'metric' | 'imperial') => {
    return to === 'imperial' ? Math.round(kg * 2.20462 * 10) / 10 : kg;
  };

  const convertHeight = (cm: number, to: 'metric' | 'imperial') => {
    if (to === 'imperial') {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10;
      return `${feet}'${inches}"`;
    }
    return cm;
  };

  const handleWeightChange = (value: string) => {
    if (value === '') {
      return; // Don't update form state when empty
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const kgValue = unitSystem === 'imperial' ? numValue / 2.20462 : numValue;
      setValue('weight', Math.round(kgValue * 10) / 10, {
        shouldValidate: true,
      });
    }
  };

  const handleHeightChange = (value: string) => {
    if (unitSystem === 'imperial') {
      if (value === '') {
        return; // Don't update form state when empty
      }
      const match = value.match(/^(\d+)'(\d+(?:\.\d+)?)"?$/);
      if (match) {
        const feet = parseInt(match[1]);
        const inches = parseFloat(match[2]);
        const totalInches = feet * 12 + inches;
        const cmValue = totalInches * 2.54;
        setValue('height', Math.round(cmValue), {
          shouldValidate: true,
        });
      }
    } else {
      if (value === '') {
        return; // Don't update form state when empty
      }
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValue('height', Math.round(numValue), {
          shouldValidate: true,
        });
      }
    }
  };

  const nutritionEmojis = t('nutrition.macroEmojis', {
    returnObjects: true,
  }) as Record<string, string>;

  return (
    <GlassCard>
      <div className="space-y-3">
        {/* Responsive layout - stacked on mobile, single row on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Column 1: Basic Info - 1 unit */}
          <div>
            <SectionCard title={t('basicInfo.title')} emoji="👤">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {/* Age */}
                <CompactInput
                  label={t('common.age')}
                  emoji="🎂"
                  type="number"
                  min="18"
                  max="80"
                  defaultValue={watchedValues.age || 25}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      return;
                    }
                    setValue('age', parseInt(value) || 0, {
                      shouldValidate: true,
                    });
                  }}
                  placeholder="25"
                  unit={t('basicInfo.ageUnit')}
                />

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-xs font-light text-foreground flex items-center gap-1">
                    <span className="text-xs">👨‍👩</span>
                    <span>{t('common.gender')}</span>
                  </Label>
                  <Select
                    value={watchedValues.gender}
                    onValueChange={(value) =>
                      setValue('gender', value as 'male' | 'female', {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm text-center w-full">
                      <SelectValue placeholder={t('common.gender')} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4}>
                      <SelectItem value="male">{t('common.male')}</SelectItem>
                      <SelectItem value="female">
                        {t('common.female')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height */}
                <CompactInput
                  key={`height-${unitSystem}`}
                  label={t('common.height')}
                  emoji="📏"
                  type={unitSystem === 'imperial' ? 'text' : 'number'}
                  min={unitSystem === 'imperial' ? undefined : '120'}
                  max={unitSystem === 'imperial' ? undefined : '250'}
                  defaultValue={
                    unitSystem === 'imperial'
                      ? convertHeight(watchedValues.height || 175, 'imperial')
                      : watchedValues.height || 175
                  }
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder={unitSystem === 'imperial' ? '5\'9"' : '175'}
                  unit={
                    unitSystem === 'metric' ? t('basicInfo.heightUnit') : ''
                  }
                />

                {/* Weight */}
                <CompactInput
                  key={`weight-${unitSystem}`}
                  label={t('common.weight')}
                  emoji="⚖️"
                  type="number"
                  step={unitSystem === 'imperial' ? '0.1' : '1'}
                  min={unitSystem === 'imperial' ? '66' : '30'}
                  max={unitSystem === 'imperial' ? '440' : '200'}
                  defaultValue={convertWeight(
                    watchedValues.weight || 70,
                    unitSystem
                  )}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="70"
                  unit={
                    unitSystem === 'metric' ? t('basicInfo.weightUnit') : 'lb'
                  }
                />
              </div>
            </SectionCard>
          </div>

          {/* Column 2: Nutrition coefficients - 2 units */}
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
                  emoji={nutritionEmojis?.carbs ?? '🍞'}
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
                  emoji={nutritionEmojis?.protein ?? '🥩'}
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
                  emoji={nutritionEmojis?.fat ?? '🥑'}
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

          {/* Column 3: Activity Settings - 1 unit */}
          <div>
            <SectionCard title={t('activity.title')} emoji="⚙️">
              <div className="space-y-4">
                {/* Cycle Days */}
                <div className="space-y-2">
                  <Label className="text-xs font-light text-foreground flex items-center gap-1">
                    <span className="text-sm">📅</span>
                    <span>{t('activity.cycleDays')}</span>
                  </Label>
                  <SliderSection
                    title=""
                    emoji=""
                    value={watchedValues.cycleDays}
                    onValueChange={(value) =>
                      setValue('cycleDays', value, { shouldValidate: true })
                    }
                    min={3}
                    max={7}
                    step={1}
                    unit={t('activity.days')}
                    options={[3, 4, 5, 6, 7]}
                    getDescription={() => ''}
                  />
                </div>

                {/* Activity Factor */}
                <div className="space-y-2">
                  <Label className="text-xs font-light text-foreground flex items-center gap-1">
                    <span className="text-sm">🏃</span>
                    <span>{t('activity.activityLevel')}</span>
                    <Tooltip>
                      <TooltipTrigger className="text-xs text-muted-foreground cursor-help ml-1 hover:text-foreground transition-colors">
                        ?
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {t('activity.activityTooltip')}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select
                    value={watchedValues.activityFactor}
                    onValueChange={(value) =>
                      setValue(
                        'activityFactor',
                        value as
                          | 'sedentary'
                          | 'light'
                          | 'moderate'
                          | 'active'
                          | 'very_active',
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm text-center w-full mt-2">
                      <SelectValue placeholder={t('activity.activityLevel')} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4}>
                      <SelectItem value="sedentary">
                        {t('activity.sedentary')}
                      </SelectItem>
                      <SelectItem value="light">
                        {t('activity.light')}
                      </SelectItem>
                      <SelectItem value="moderate">
                        {t('activity.moderate')}
                      </SelectItem>
                      <SelectItem value="active">
                        {t('activity.active')}
                      </SelectItem>
                      <SelectItem value="very_active">
                        {t('activity.very_active')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {errors.cycleDays && (
                <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center mt-2">
                  <span>⚠️</span>
                  {errors.cycleDays.message}
                </p>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
