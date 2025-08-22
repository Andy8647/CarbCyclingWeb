import { Input } from '@/components/ui/input';
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
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;

  const watchedValues = watch();
  const showCustomProtein = watchedValues.proteinLevel === 'custom';

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Single row layout - all in one line */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Column 1: Basic Info */}
          <div className="xl:col-span-2">
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
              
              {/* Activity Factor - full width */}
              <div className="space-y-2 mt-3">
                <Label className="text-xs font-light text-foreground flex items-center gap-1">
                  <span className="text-xs">🏃</span>
                  <span>活动水平</span>
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
            </SectionCard>
          </div>

          {/* Column 2: Body type */}
          <div>
            <SectionCard title="体型" emoji="🏃">
              <RadioGroup
                value={watchedValues.bodyType}
                onValueChange={(value) =>
                  setValue(
                    'bodyType',
                    value as 'endomorph' | 'mesomorph' | 'ectomorph',
                    { shouldValidate: true }
                  )
                }
                className="space-y-1"
              >
                <RadioCard
                  value="endomorph"
                  id="endomorph"
                  emoji="🔺"
                  title="内胚型"
                  description="易增重"
                  isSelected={watchedValues.bodyType === 'endomorph'}
                />
                <RadioCard
                  value="mesomorph"
                  id="mesomorph"
                  emoji="⬜"
                  title="中胚型"
                  description="均衡型"
                  isSelected={watchedValues.bodyType === 'mesomorph'}
                />
                <RadioCard
                  value="ectomorph"
                  id="ectomorph"
                  emoji="🔻"
                  title="外胚型"
                  description="偏瘦型"
                  isSelected={watchedValues.bodyType === 'ectomorph'}
                />
              </RadioGroup>
              {errors.bodyType && (
                <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center mt-2">
                  <span>⚠️</span>
                  {errors.bodyType.message}
                </p>
              )}
            </SectionCard>
          </div>

          {/* Column 3: Protein level */}
          <div>
            <SectionCard title="训练水平" emoji="🏋️">
              <RadioGroup
                value={watchedValues.proteinLevel}
                onValueChange={(value) =>
                  setValue(
                    'proteinLevel',
                    value as 'beginner' | 'experienced' | 'custom',
                    { shouldValidate: true }
                  )
                }
                className="space-y-1"
              >
                <RadioCard
                  value="beginner"
                  id="beginner"
                  emoji="🌱"
                  title="初学者"
                  description="0.8g/kg"
                  isSelected={watchedValues.proteinLevel === 'beginner'}
                />
                <RadioCard
                  value="experienced"
                  id="experienced"
                  emoji="💪"
                  title="有经验"
                  description="1.5g/kg"
                  isSelected={watchedValues.proteinLevel === 'experienced'}
                />
                <RadioCard
                  value="custom"
                  id="custom"
                  emoji="⚙️"
                  title="自定义"
                  description="0.8-2.0g/kg"
                  isSelected={watchedValues.proteinLevel === 'custom'}
                />
              </RadioGroup>

              {showCustomProtein && (
                <div className="mt-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.8"
                    max="2.0"
                    {...register('customProtein', { valueAsNumber: true })}
                    className="h-8 bg-transparent border text-center text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="1.2"
                  />
                </div>
              )}

              {errors.proteinLevel && (
                <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center mt-2">
                  <span>⚠️</span>
                  {errors.proteinLevel.message}
                </p>
              )}
            </SectionCard>
          </div>

          {/* Column 4: Cycle days */}
          <div>
            <SectionCard title="循环天数" emoji="📅">
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <div className="px-3 py-2 rounded-lg bg-white/5 dark:bg-black/5">
                    <span className="text-lg font-light">
                      {watchedValues.cycleDays}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">天</span>
                  </div>
                </div>

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
                  unit=""
                  options={[3, 4, 5, 6, 7]}
                  getDescription={(value) => {
                    const descriptions: Record<number, string> = {
                      3: '短周期',
                      4: '平衡周期',
                      5: '标准周期',
                      6: '增强周期',
                      7: '完整周期',
                    };
                    return descriptions[value] || '';
                  }}
                />
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

        {/* Status */}
        <div
          className={`p-3 transition-all duration-300 rounded-lg ${
            isValid
              ? 'bg-green-400/10 dark:bg-green-400/10'
              : 'bg-white/10 dark:bg-black/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isValid ? 'bg-green-400' : 'bg-muted-foreground animate-pulse'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isValid ? 'text-green-400' : 'text-muted-foreground'
              }`}
            >
              {isValid ? '✓ 表单已完整' : '请完善必填项'}
            </span>
            {isValid && <span className="text-sm">🎉</span>}
          </div>
        </div>
      </form>
    </GlassCard>
  );
}
