import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { CompactInput } from '@/components/ui/compact-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCard } from '@/components/ui/section-card';
import type { BasicInfoSectionProps } from './types';

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

  const handleHeightChange = (value: string) => {
    if (unitSystem === 'imperial') {
      if (value === '') {
        return;
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
        return;
      }
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValue('height', Math.round(numValue), {
          shouldValidate: true,
        });
      }
    }
  };

  return (
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
                <SelectItem value="female">{t('common.female')}</SelectItem>
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
            unit={unitSystem === 'metric' ? t('basicInfo.heightUnit') : ''}
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
            defaultValue={convertWeight(watchedValues.weight || 70, unitSystem)}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="70"
            unit={unitSystem === 'metric' ? t('basicInfo.weightUnit') : 'lb'}
          />
        </div>
      </SectionCard>
    </div>
  );
}
