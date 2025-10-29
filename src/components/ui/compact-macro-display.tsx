import { cn } from '@/lib/utils';

interface MacroValue {
  carbs: number;
  protein: number;
  fat: number;
}

interface CompactMacroDisplayProps {
  macros: MacroValue;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 紧凑的营养素显示组件
 * 使用简化格式 C35/P11/F7 代替 碳35 蛋11 脂7
 * 通过颜色编码区分不同营养素
 */
export function CompactMacroDisplay({
  macros,
  className,
  showLabels = false,
  size = 'sm',
}: CompactMacroDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2.5',
  };

  const labelClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      {/* 碳水 - 米白色 */}
      <div className="flex items-center gap-0.5">
        {showLabels && (
          <span
            className={cn(
              'font-medium text-stone-500 dark:text-stone-400',
              labelClasses[size]
            )}
          >
            碳
          </span>
        )}
        <span
          className="font-semibold text-stone-500 dark:text-stone-400"
          title="碳水化合物"
        >
          {showLabels ? '' : 'C'}
          {Math.round(macros.carbs)}
        </span>
      </div>

      <span className="text-slate-400 dark:text-slate-600">/</span>

      {/* 蛋白质 - 肉红色 */}
      <div className="flex items-center gap-0.5">
        {showLabels && (
          <span
            className={cn(
              'font-medium text-rose-600 dark:text-rose-400',
              labelClasses[size]
            )}
          >
            蛋
          </span>
        )}
        <span
          className="font-semibold text-rose-600 dark:text-rose-400"
          title="蛋白质"
        >
          {showLabels ? '' : 'P'}
          {Math.round(macros.protein)}
        </span>
      </div>

      <span className="text-slate-400 dark:text-slate-600">/</span>

      {/* 脂肪 - 黄色 */}
      <div className="flex items-center gap-0.5">
        {showLabels && (
          <span
            className={cn(
              'font-medium text-yellow-600 dark:text-yellow-400',
              labelClasses[size]
            )}
          >
            脂
          </span>
        )}
        <span
          className="font-semibold text-yellow-600 dark:text-yellow-400"
          title="脂肪"
        >
          {showLabels ? '' : 'F'}
          {Math.round(macros.fat)}
        </span>
      </div>
    </div>
  );
}
