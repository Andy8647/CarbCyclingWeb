import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCard } from '@/components/ui/section-card';
import { SliderSection } from '@/components/ui/slider-section';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ActivitySectionProps } from './types';

export function ActivitySection({ form, watchedValues }: ActivitySectionProps) {
  const { t } = useTranslation();
  const {
    setValue,
    formState: { errors },
  } = form;

  return (
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
                <SelectItem value="light">{t('activity.light')}</SelectItem>
                <SelectItem value="moderate">
                  {t('activity.moderate')}
                </SelectItem>
                <SelectItem value="active">{t('activity.active')}</SelectItem>
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
  );
}
