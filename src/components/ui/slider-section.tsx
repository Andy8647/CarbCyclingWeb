import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SliderSectionProps {
  title: string;
  emoji: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  options: number[];
  getDescription: (value: number) => string;
}

export function SliderSection({
  title,
  emoji,
  value,
  onValueChange,
  min,
  max,
  step,
  unit,
  options,
  getDescription,
}: SliderSectionProps) {
  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="text-sm">{emoji}</span>
            <span>{title}</span>
          </Label>
          <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="text-xl font-light">{value}</span>
            <span className="text-xs text-muted-foreground ml-1">{unit}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onValueChange(newValue)}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          {options.map((option) => (
            <div
              key={option}
              className={`text-center transition-all duration-200 cursor-pointer hover:text-foreground hover:scale-105 ${
                option === value ? 'text-foreground font-medium scale-110' : ''
              }`}
              onClick={() => onValueChange(option)}
            >
              {option}
              {unit}
            </div>
          ))}
        </div>

        {getDescription(value) && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="text-xs text-center text-muted-foreground">
              {getDescription(value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
