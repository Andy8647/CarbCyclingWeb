import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'strong';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default:
        'bg-white/20 dark:bg-black/20 shadow-[0_0_10px_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_0_rgba(0,0,0,0.3)]',
      subtle:
        'bg-white/10 dark:bg-black/10 shadow-[0_0_8px_0_rgba(0,0,0,0.08)] dark:shadow-[0_0_8px_0_rgba(0,0,0,0.2)]',
      strong:
        'bg-white/30 dark:bg-black/30 shadow-[0_0_15px_0_rgba(0,0,0,0.12)] dark:shadow-[0_0_15px_0_rgba(0,0,0,0.35)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full sm:p-8 rounded-2xl backdrop-blur-[4px] transition-all duration-300 ease-in-out',
          variants[variant],
          className
        )}
        style={{
          WebkitBackdropFilter: 'blur(4px)',
          borderRadius: '1rem',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
