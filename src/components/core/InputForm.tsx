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

export function InputForm() {
  const { form, unitSystem } = useFormContext();

  if (!form) return null;

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
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

    // Batch update all values at once to avoid race conditions
    setTimeout(() => {
      setValue('bodyType', bodyType, { shouldValidate: true });
      setValue('carbCoeff', carbCoeff, { shouldValidate: true });
      setValue('proteinCoeff', proteinCoeff, { shouldValidate: true });
      setValue('fatCoeff', fatCoeff, { shouldValidate: true });
    }, 0);
  };

  const onSubmit = (data: unknown) => {
    console.log('Form data:', data);
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
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValue('height', Math.round(numValue), {
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Single row layout - all in one line */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Column 1: Basic Info - 1 unit */}
          <div>
            <SectionCard title="基础信息" emoji="👤">
              <div className="grid grid-cols-2 gap-2">
                {/* Age */}
                <CompactInput
                  label="年龄"
                  emoji="🎂"
                  type="number"
                  min="18"
                  max="80"
                  value={watchedValues.age || 25}
                  onChange={(e) =>
                    setValue('age', parseInt(e.target.value) || 25, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="25"
                  unit="岁"
                />

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-xs font-light text-foreground flex items-center gap-1">
                    <span className="text-xs">👨‍👩</span>
                    <span>性别</span>
                  </Label>
                  <Select
                    value={watchedValues.gender}
                    onValueChange={(value) =>
                      setValue('gender', value as 'male' | 'female', {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm text-center w-full">
                      <SelectValue placeholder="性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height */}
                <CompactInput
                  label="身高"
                  emoji="📏"
                  type={unitSystem === 'imperial' ? 'text' : 'number'}
                  min={unitSystem === 'imperial' ? undefined : '120'}
                  max={unitSystem === 'imperial' ? undefined : '250'}
                  value={
                    unitSystem === 'imperial'
                      ? convertHeight(watchedValues.height || 175, 'imperial')
                      : watchedValues.height || 175
                  }
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder={unitSystem === 'imperial' ? '5\'9"' : '175'}
                  unit={unitSystem === 'metric' ? 'cm' : ''}
                />

                {/* Weight */}
                <CompactInput
                  label="体重"
                  emoji="⚖️"
                  type="number"
                  step={unitSystem === 'imperial' ? '0.1' : '1'}
                  min={unitSystem === 'imperial' ? '66' : '30'}
                  max={unitSystem === 'imperial' ? '440' : '200'}
                  value={convertWeight(watchedValues.weight || 70, unitSystem)}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="70"
                  unit={unitSystem === 'metric' ? 'kg' : 'lb'}
                />
              </div>
            </SectionCard>
          </div>

          {/* Column 2: Nutrition coefficients - 2 units */}
          <div className="xl:col-span-2">
            <SectionCard
              title="营养素系数"
              emoji="🏋️"
              description={(() => {
                const descriptions = {
                  endomorph:
                    '内胚型：易增重，代谢较慢，适合低碳水高蛋白饮食。蛋白质建议0.8-2.5g/kg体重。',
                  mesomorph:
                    '中胚型：肌肉发达，代谢均衡，营养分配相对灵活。蛋白质建议0.8-2.5g/kg体重。',
                  ectomorph:
                    '外胚型：偏瘦难增重，代谢快，需要更多碳水维持体重。蛋白质建议0.8-2.5g/kg体重。',
                };
                return watchedValues.bodyType
                  ? descriptions[watchedValues.bodyType]
                  : '选择体型后显示对应的营养建议。蛋白质建议0.8-2.5g/kg体重，根据训练强度调整。';
              })()}
            >
              {/* Body type selection - top row */}
              <RadioGroup
                value={watchedValues.bodyType}
                onValueChange={handleBodyTypeChange}
                className="grid grid-cols-3 gap-1 mb-3"
              >
                <RadioCard
                  value="endomorph"
                  id="endomorph"
                  emoji="🔺"
                  title="内胚型"
                  description=""
                  isSelected={watchedValues.bodyType === 'endomorph'}
                />
                <RadioCard
                  value="mesomorph"
                  id="mesomorph"
                  emoji="⬜"
                  title="中胚型"
                  description=""
                  isSelected={watchedValues.bodyType === 'mesomorph'}
                />
                <RadioCard
                  value="ectomorph"
                  id="ectomorph"
                  emoji="🔻"
                  title="外胚型"
                  description=""
                  isSelected={watchedValues.bodyType === 'ectomorph'}
                />
              </RadioGroup>

              {/* Nutrition coefficients - bottom section */}
              <div className="grid grid-cols-3 gap-2">
                <CompactInput
                  label="碳水"
                  emoji="🍞"
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="8.0"
                  value={watchedValues.carbCoeff || 5.0}
                  onChange={(e) =>
                    setValue('carbCoeff', parseFloat(e.target.value) || 5.0, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="5.0"
                  unit="g/kg"
                />
                <CompactInput
                  label="蛋白质"
                  emoji="🥩"
                  type="number"
                  step="0.1"
                  min="0.8"
                  max="2.5"
                  value={watchedValues.proteinCoeff || 1.2}
                  onChange={(e) =>
                    setValue(
                      'proteinCoeff',
                      parseFloat(e.target.value) || 1.2,
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                  placeholder="1.2"
                  unit="g/kg"
                />
                <CompactInput
                  label="脂肪"
                  emoji="🥑"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="1.5"
                  value={watchedValues.fatCoeff || 1.0}
                  onChange={(e) =>
                    setValue('fatCoeff', parseFloat(e.target.value) || 1.0, {
                      shouldValidate: true,
                    })
                  }
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

          {/* Column 3: Cycle days + Activity - 1 unit */}
          <div>
            <SectionCard title="循环天数" emoji="📅">
              <div className="space-y-2">
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
                  unit="天"
                  options={[3, 4, 5, 6, 7]}
                  getDescription={() => ''}
                />

                {/* Activity Factor */}
                <div className="space-y-2">
                  <Label className="text-xs font-light text-foreground flex items-center gap-1">
                    <span className="text-xs">🏃</span>
                    <span>每日活动量</span>
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
                    <SelectTrigger className="h-9 text-sm text-center w-full">
                      <SelectValue placeholder="活动水平" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">久坐</SelectItem>
                      <SelectItem value="light">轻度</SelectItem>
                      <SelectItem value="moderate">中度</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="very_active">极活跃</SelectItem>
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

        {/* Calculate Button */}
        <div className="flex justify-end -mt-10">
          <button
            type="submit"
            disabled={!isValid}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              isValid
                ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transform hover:scale-105 hover:cursor-pointer'
                : 'bg-white/20 dark:bg-black/20 text-muted-foreground cursor-not-allowed'
            }`}
          >
            <span className='text-xl'>🚀</span>
            <span>{isValid ? '开始计算' : '请完善表单'}</span>
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
