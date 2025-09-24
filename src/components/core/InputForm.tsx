import { GlassCard } from '@/components/ui/glass-card';
import { useFormContext } from '@/lib/form-context';
import {
  BasicInfoSection,
  NutritionSection,
  ActivitySection,
} from './input-form';

export function InputForm() {
  const { form, unitSystem } = useFormContext();

  if (!form) return null;

  const { watch } = form;
  const watchedValues = watch();

  return (
    <GlassCard>
      <div className="space-y-3">
        {/* Responsive layout - stacked on mobile, single row on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Column 1: Basic Info - 1 unit */}
          <BasicInfoSection
            form={form}
            unitSystem={unitSystem}
            watchedValues={watchedValues}
          />

          {/* Column 2: Nutrition coefficients - 2 units */}
          <NutritionSection form={form} watchedValues={watchedValues} />

          {/* Column 3: Activity Settings - 1 unit */}
          <ActivitySection form={form} watchedValues={watchedValues} />
        </div>
      </div>
    </GlassCard>
  );
}
