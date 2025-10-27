import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/ui/section-card';
import { CompactInput } from '@/components/ui/compact-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BasicInfoSectionProps } from './types';

export function ProfileSection({
  form,
  unitSystem,
  watchedValues,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const { setValue } = form;

  const heightUnit = t('basicInfo.heightUnit');

  const handleSexChange = (value: string) => {
    setValue('sex', value as 'male' | 'female', { shouldValidate: true });
  };

  const handleActivityChange = (value: string) => {
    const af = parseFloat(value);
    if (!Number.isNaN(af)) {
      setValue('activityFactor', af, { shouldValidate: true });
    }
  };

  const convertWeight = (kg: number, to: 'metric' | 'imperial') => {
    return to === 'imperial' ? Math.round(kg * 2.20462 * 10) / 10 : kg;
  };

  const handleWeightChange = (value: string) => {
    if (value === '') return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const kgValue = unitSystem === 'imperial' ? numValue / 2.20462 : numValue;
      setValue('weight', Math.round(kgValue * 10) / 10, {
        shouldValidate: true,
      });
    }
  };

  return (
    <SectionCard title={t('basicInfo.title')} emoji="🧍" className="flex-1">
      {/* Row 1: Sex, Age, Activity Factor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {t('common.gender')}
          </label>
          <Select
            value={(watchedValues.sex as string) || ''}
            onValueChange={handleSexChange}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder={t('common.gender')} />
            </SelectTrigger>
            <SelectContent sideOffset={4}>
              <SelectItem value="male">{t('common.male')}</SelectItem>
              <SelectItem value="female">{t('common.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CompactInput
          label={t('common.age')}
          emoji="🎂"
          type="number"
          min="12"
          max="100"
          step="1"
          value={watchedValues.age ?? ''}
          onChange={(e) => {
            if (e.target.value === '') return;
            setValue('age', parseInt(e.target.value, 10) || 0, {
              shouldValidate: true,
            });
          }}
          placeholder="28"
          unit={t('basicInfo.ageUnit')}
        />

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">AF</label>
          <Select
            value={String(watchedValues.activityFactor ?? '')}
            onValueChange={handleActivityChange}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder={t('activity.activityLevel')} />
            </SelectTrigger>
            <SelectContent sideOffset={4}>
              <SelectItem value="1.2">
                1.2 · {t('activity.sedentary')}
              </SelectItem>
              <SelectItem value="1.375">
                1.375 · {t('activity.light')}
              </SelectItem>
              <SelectItem value="1.55">
                1.55 · {t('activity.moderate')}
              </SelectItem>
              <SelectItem value="1.725">
                1.725 · {t('activity.active')}
              </SelectItem>
              <SelectItem value="1.9">
                1.9 · {t('activity.very_active')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Height, Weight */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <CompactInput
          label={t('common.height')}
          emoji="📏"
          type="number"
          min="100"
          max="250"
          step="1"
          value={watchedValues.heightCm ?? ''}
          onChange={(e) => {
            if (e.target.value === '') return;
            setValue('heightCm', parseInt(e.target.value, 10) || 0, {
              shouldValidate: true,
            });
          }}
          placeholder="175"
          unit={heightUnit}
        />
        <CompactInput
          key={`weight-${unitSystem}`}
          label={t('common.weight')}
          emoji="⚖️"
          type="number"
          step={unitSystem === 'imperial' ? '0.1' : '1'}
          min={unitSystem === 'imperial' ? '66' : '30'}
          max={unitSystem === 'imperial' ? '440' : '200'}
          value={convertWeight(watchedValues.weight || 70, unitSystem)}
          onChange={(e) => handleWeightChange(e.target.value)}
          placeholder="70"
          unit={unitSystem === 'metric' ? t('basicInfo.weightUnit') : 'lb'}
        />
      </div>
    </SectionCard>
  );
}
