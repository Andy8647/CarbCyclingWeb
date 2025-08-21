import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LabeledInputProps extends React.ComponentProps<'input'> {
  label: string;
  emoji?: string;
  labelClassName?: string;
  containerClassName?: string;
  unit?: string;
}

const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
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
      <div className={cn('space-y-4', containerClassName)}>
        <Label
          className={cn(
            'text-lg font-light text-foreground flex items-center gap-2',
            labelClassName
          )}
        >
          {emoji && <span className="text-xl">{emoji}</span>}
          <span>{label}</span>
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'h-14 text-xl text-center pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]',
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
              {unit}
            </div>
          )}
        </div>
      </div>
    );
  }
);

LabeledInput.displayName = 'LabeledInput';

export { LabeledInput };
