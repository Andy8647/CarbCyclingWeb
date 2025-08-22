import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CompactInputProps extends React.ComponentProps<'input'> {
  label: string;
  emoji?: string;
  labelClassName?: string;
  containerClassName?: string;
  unit?: string;
}

const CompactInput = React.forwardRef<HTMLInputElement, CompactInputProps>(
  (
    {
      label,
      emoji,
      labelClassName,
      containerClassName,
      unit,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label
          className={cn(
            'text-xs font-light text-foreground flex items-center gap-1',
            labelClassName
          )}
        >
          {emoji && <span className="text-xs">{emoji}</span>}
          <span>{label}</span>
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'h-9 text-sm text-center pr-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]',
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
              {unit}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CompactInput.displayName = 'CompactInput';

export { CompactInput };
