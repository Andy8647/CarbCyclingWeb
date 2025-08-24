import { type ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface SectionCardProps {
  title: string;
  emoji: string;
  children: ReactNode;
  className?: string;
  description?: string;
}

export function SectionCard({
  title,
  emoji,
  children,
  className = '',
  description,
}: SectionCardProps) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-white dark:bg-card ${className}`}>
      <div className="space-y-2">
        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
            <span className="text-lg sm:text-xl">{emoji}</span>
            <span>{title}</span>
          </Label>
          {description && (
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">
              {description.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
