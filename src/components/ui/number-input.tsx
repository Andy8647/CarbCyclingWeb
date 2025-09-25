import * as React from 'react';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  value: string | number;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    { value, onChange, step = 1, min = 0, max, unit, className, ...props },
    ref
  ) => {
    const handleIncrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = Math.min(max ?? Infinity, currentValue + step);
      onChange(newValue.toString());
    };

    const handleDecrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = Math.max(min, currentValue - step);
      onChange(newValue.toString());
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={Number.isFinite(Number(value)) ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'text-center pr-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]',
            unit && 'pl-8',
            className
          )}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
          <button
            type="button"
            onClick={handleIncrement}
            className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronUp className="h-2 w-2" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronDown className="h-2 w-2" />
          </button>
        </div>
        {unit && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
