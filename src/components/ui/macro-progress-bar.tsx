import { cn } from '@/lib/utils';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: 'blue' | 'green' | 'red' | 'orange';
  className?: string;
  showPercentage?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-200 dark:bg-blue-900/30',
    fill: 'bg-blue-500 dark:bg-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-200 dark:bg-green-900/30',
    fill: 'bg-green-500 dark:bg-green-500',
    text: 'text-green-700 dark:text-green-400',
  },
  red: {
    bg: 'bg-red-200 dark:bg-red-900/30',
    fill: 'bg-red-500 dark:bg-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
  orange: {
    bg: 'bg-orange-200 dark:bg-orange-900/30',
    fill: 'bg-orange-500 dark:bg-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
  },
};

/**
 * 营养素进度条组件
 * 显示当前摄入量相对于目标的进度
 */
export function MacroProgressBar({
  label,
  current,
  target,
  color,
  className,
  showPercentage = false,
}: MacroProgressBarProps) {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const deficit = target - current;
  const colors = colorClasses[color];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* 标签和数值 */}
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold', colors.text)}>{label}</span>
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          {Math.round(current)}/{Math.round(target)}g
          {showPercentage && (
            <span className="ml-1 text-[10px]">
              ({Math.round(percentage)}%)
            </span>
          )}
        </span>
      </div>

      {/* 进度条 */}
      <div className={cn('h-1.5 rounded-full overflow-hidden', colors.bg)}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            colors.fill
          )}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      {/* 缺口提示（可选） */}
      {deficit > 0 && (
        <span className="text-[10px] text-slate-500 dark:text-slate-500">
          还需 {Math.round(deficit)}g
        </span>
      )}
    </div>
  );
}

/**
 * 紧凑的营养素盈亏显示
 * 用于每日卡片顶部
 */
interface CompactMacroDeficitProps {
  deficit: {
    carbs: number;
    protein: number;
    fat: number;
  };
  className?: string;
}

export function CompactMacroDeficit({
  deficit,
  className,
}: CompactMacroDeficitProps) {
  const formatDeficit = (value: number) => {
    const rounded = Math.round(value);
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg',
        className
      )}
    >
      <span className="text-stone-500 dark:text-stone-400 font-semibold">
        碳 {formatDeficit(deficit.carbs)}
      </span>
      <span className="text-slate-400 dark:text-slate-600">•</span>
      <span className="text-rose-600 dark:text-rose-400 font-semibold">
        蛋 {formatDeficit(deficit.protein)}
      </span>
      <span className="text-slate-400 dark:text-slate-600">•</span>
      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
        脂 {formatDeficit(deficit.fat)}
      </span>
    </div>
  );
}
