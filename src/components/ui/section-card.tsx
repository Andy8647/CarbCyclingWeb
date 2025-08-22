import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface SectionCardProps {
  title: string;
  emoji: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  emoji,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div className={`p-4 rounded-xl bg-white/10 dark:bg-black/10 ${className}`}>
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span>{title}</span>
        </Label>
        {children}
      </div>
    </div>
  );
}
