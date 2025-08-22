import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompactInput } from '@/components/ui/compact-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { GlassCard } from '@/components/ui/glass-card';
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
      <div className="flex items-center">
        <span className="text-lg">📋</span>
        <h2 className="text-lg font-bold text-foreground">基础信息</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information - Horizontal Layout */}
        <div className="p-6 rounded-xl bg-white/10 dark:bg-black/10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label className="text-sm font-light text-foreground flex items-center gap-1">
                <span className="text-sm">👤</span>
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
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {/* Activity Factor */}
            <div className="space-y-2">
              <Label className="text-sm font-light text-foreground flex items-center gap-1">
                <span className="text-sm">🏃</span>
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
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="选择活动水平" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">久坐 (1.2)</SelectItem>
                  <SelectItem value="light">轻度 (1.375)</SelectItem>
                  <SelectItem value="moderate">中度 (1.55)</SelectItem>
                  <SelectItem value="active">活跃 (1.725)</SelectItem>
                  <SelectItem value="very_active">极活跃 (1.9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Body type */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/10">
          <div className="space-y-3">
            <Label className="text-sm font-light text-foreground flex items-center gap-2">
              <span className="text-sm">🏃</span>
              <span>体型</span>
            </Label>
            <RadioGroup
              value={watchedValues.bodyType}
              onValueChange={(value) =>
                setValue(
                  'bodyType',
                  value as 'endomorph' | 'mesomorph' | 'ectomorph',
                  { shouldValidate: true }
                )
              }
              className="space-y-2"
            >
              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.bodyType === 'endomorph'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="endomorph" id="endomorph" />
                  <Label htmlFor="endomorph" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔺</span>
                      <span className="font-medium text-sm">内胚型</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      易增重，代谢较慢
                    </div>
                  </Label>
                </div>
              </div>

              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.bodyType === 'mesomorph'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="mesomorph" id="mesomorph" />
                  <Label htmlFor="mesomorph" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⬜</span>
                      <span className="font-medium text-sm">中胚型</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      肌肉发达，代谢均衡
                    </div>
                  </Label>
                </div>
              </div>

              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.bodyType === 'ectomorph'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="ectomorph" id="ectomorph" />
                  <Label htmlFor="ectomorph" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔻</span>
                      <span className="font-medium text-sm">外胚型</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      偏瘦，代谢较快
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors.bodyType && (
              <p className="text-sm text-red-400/80 flex items-center gap-1 justify-center">
                <span>⚠️</span>
                {errors.bodyType.message}
              </p>
            )}
          </div>
        </div>

        {/* Protein level */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/10">
          <div className="space-y-3">
            <Label className="text-sm font-light text-foreground flex items-center gap-2">
              <span className="text-sm">🥩</span>
              <span>训练水平</span>
            </Label>
            <RadioGroup
              value={watchedValues.proteinLevel}
              onValueChange={(value) =>
                setValue(
                  'proteinLevel',
                  value as 'beginner' | 'experienced' | 'custom',
                  { shouldValidate: true }
                )
              }
              className="space-y-2"
            >
              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.proteinLevel === 'beginner'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌱</span>
                        <span className="font-medium text-sm">初学者</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        0.8 g/kg
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      训练经验较少
                    </div>
                  </Label>
                </div>
              </div>

              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.proteinLevel === 'experienced'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="experienced" id="experienced" />
                  <Label
                    htmlFor="experienced"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💪</span>
                        <span className="font-medium text-sm">有经验者</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        1.5 g/kg
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      规律训练1年以上
                    </div>
                  </Label>
                </div>
              </div>

              <div
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
                  watchedValues.proteinLevel === 'custom'
                    ? 'bg-white/30 dark:bg-white/25'
                    : 'hover:bg-white/20 dark:hover:bg-white/15'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <span className="font-medium text-sm">自定义</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        0.8-2.0 g/kg
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      个性化蛋白系数
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {showCustomProtein && (
              <div className="p-3 mt-2 rounded-lg bg-white/5 dark:bg-black/5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    蛋白系数 (g/kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.8"
                    max="2.0"
                    {...register('customProtein', { valueAsNumber: true })}
                    className="h-10 bg-transparent border-0 text-center text-sm font-light focus:ring-0 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="1.2"
                  />
                  {errors.customProtein && (
                    <p className="text-xs text-red-400/80 flex items-center gap-1 justify-center">
                      <span>⚠️</span>
                      {errors.customProtein.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {errors.proteinLevel && (
              <p className="text-sm text-red-400/80 flex items-center gap-1 justify-center">
                <span>⚠️</span>
                {errors.proteinLevel.message}
              </p>
            )}
          </div>
        </div>

        {/* Cycle days */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-light text-foreground flex items-center gap-2">
                <span className="text-sm">📅</span>
                <span>循环天数</span>
              </Label>
              <div className="px-3 py-1 rounded-lg bg-white/5 dark:bg-black/5">
                <span className="text-xl font-light">
                  {watchedValues.cycleDays}
                </span>
                <span className="text-xs text-muted-foreground ml-1">天</span>
              </div>
            </div>

            <div className="space-y-3">
              <Slider
                value={[watchedValues.cycleDays]}
                onValueChange={([value]) =>
                  setValue('cycleDays', value, { shouldValidate: true })
                }
                min={3}
                max={7}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                {[3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`text-center transition-all duration-200 ${
                      day === watchedValues.cycleDays
                        ? 'text-foreground font-medium scale-110'
                        : ''
                    }`}
                  >
                    {day}天
                  </div>
                ))}
              </div>

              <div className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
                <div className="text-xs text-center text-muted-foreground">
                  {watchedValues.cycleDays === 3 &&
                    '短周期：1高 + 1中 + 1低碳日'}
                  {watchedValues.cycleDays === 4 &&
                    '平衡周期：1高 + 2中 + 1低碳日'}
                  {watchedValues.cycleDays === 5 &&
                    '标准周期：1高 + 2中 + 2低碳日'}
                  {watchedValues.cycleDays === 6 &&
                    '增强周期：2高 + 2中 + 2低碳日'}
                  {watchedValues.cycleDays === 7 &&
                    '完整周期：2高 + 3中 + 2低碳日'}
                </div>
              </div>
            </div>

            {errors.cycleDays && (
              <p className="text-sm text-red-400/80 flex items-center gap-1 justify-center">
                <span>⚠️</span>
                {errors.cycleDays.message}
              </p>
            )}
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
