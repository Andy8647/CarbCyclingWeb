import { GlassCard } from '@/components/ui/glass-card';
import { useFormContext } from '@/lib/form-context';
import {
  WeightAndNutritionSection,
  CycleDaysSection,
  ProfileSection,
} from './input-form';

export function InputForm() {
  const { form, unitSystem } = useFormContext();

  if (!form) return null;

  const { watch } = form;
  const watchedValues = watch();

  return (
    <GlassCard className="py-1 sm:py-2">
      <div className="space-y-1">
        {/* Responsive layout - stacked on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:items-start">
          {/* Column 1: Profile (sex, age, AF) + (height, weight) */}
          <div className="flex flex-col h-full">
            <ProfileSection
              form={form}
              unitSystem={unitSystem}
              watchedValues={watchedValues}
            />
          </div>

          {/* Column 2: Low/High macro coefficients */}
          <div className="flex flex-col h-full">
            <WeightAndNutritionSection
              form={form}
              watchedValues={watchedValues}
            />
          </div>

          {/* Column 3: Cycle days + Day allocation (combined) */}
          <div className="flex flex-col h-full gap-2">
            <CycleDaysSection form={form} watchedValues={watchedValues} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
