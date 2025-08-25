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
      className={`p-2 sm:p-3 cursor-pointer md:transition-colors md:duration-150 rounded-lg bg-white dark:bg-muted touch-manipulation select-none ${
        isSelected
          ? 'bg-slate-200 dark:bg-secondary'
          : 'hover:bg-slate-100 dark:hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        <RadioGroupItem value={value} id={id} />
        <Label htmlFor={id} className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">{emoji}</span>
              <span className="font-medium text-xs sm:text-sm">{title}</span>
            </div>
            {rightElement}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </Label>
      </div>
    </div>
  );
}
