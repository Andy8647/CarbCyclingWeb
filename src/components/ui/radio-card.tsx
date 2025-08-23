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
      className={`p-3 cursor-pointer transition-all duration-200 rounded-lg bg-white/5 dark:bg-black/5 ${
        isSelected
          ? 'bg-white/30 dark:bg-white/25'
          : 'hover:bg-white/20 dark:hover:bg-white/15'
      }`}
    >
      <div className="flex items-center space-x-3">
        <RadioGroupItem value={value} id={id} />
        <Label htmlFor={id} className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span className="font-medium text-sm">{title}</span>
            </div>
            {rightElement}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </Label>
      </div>
    </div>
  );
}
