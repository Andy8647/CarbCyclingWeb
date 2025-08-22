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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span>{title}</span>
        </Label>
        <div className="px-3 py-1 rounded-lg bg-white/5 dark:bg-black/5">
          <span className="text-xl font-light">{value}</span>
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>

      <div className="space-y-3">
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
              className={`text-center transition-all duration-200 ${
                option === value ? 'text-foreground font-medium scale-110' : ''
              }`}
            >
              {option}
              {unit}
            </div>
          ))}
        </div>

        <div className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
          <div className="text-xs text-center text-muted-foreground">
            {getDescription(value)}
          </div>
        </div>
      </div>
    </div>
  );
}
