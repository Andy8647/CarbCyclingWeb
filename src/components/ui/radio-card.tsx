import { type ReactNode } from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RadioCardProps {
  value: string;
  id: string;
  emoji: string;
  title: string;
  description: string;
  rightElement?: ReactNode;
  isSelected: boolean;
}

export function RadioCard({
  value,
  id,
  emoji,
  title,
  description,
  rightElement,
  isSelected,
}: RadioCardProps) {
  return (
    <div
      className={`p-1 sm:p-2 cursor-pointer md:transition-colors md:duration-150 rounded-lg bg-white dark:bg-muted touch-manipulation select-none ${
        isSelected
          ? 'bg-slate-200 dark:bg-secondary'
          : 'hover:bg-slate-100 dark:hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-start space-x-1 sm:space-x-1">
        <RadioGroupItem value={value} id={id} className="mt-0.5" />
        <Label htmlFor={id} className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg leading-none">{emoji}</span>
              <span className="font-medium text-xs sm:text-sm leading-none">
                {title}
              </span>
            </div>
            {rightElement}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
              {description}
            </div>
          )}
        </Label>
      </div>
    </div>
  );
}
