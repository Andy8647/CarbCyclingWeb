import { ReactNode } from 'react';
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
    <div className={`p-3 rounded-xl bg-white/10 dark:bg-black/10 ${className}`}>
      <div className="space-y-2">
        <div>
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span>{title}</span>
          </Label>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
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
