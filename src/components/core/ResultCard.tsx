import { useMemo, useEffect, useState, useRef } from 'react';
import { useFormContext } from '@/lib/form-context';
import {
  calculateNutritionPlan,
  calculateMetabolicData,
  type UserInput,
  WORKOUT_TYPES,
} from '@/lib/calculator';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

const getDayTypeDisplay = (type: string) => {
  switch (type) {
    case 'high':
      return '🔥 高碳日';
    case 'medium':
      return '⚖️ 中碳日';
    case 'low':
      return '🌿 低碳日';
    default:
      return type;
  }
};

// 可拖拽的营养卡片
interface DraggableCardProps {
  day: any;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
}

function DraggableCard({
  day,
  dailyWorkouts,
  setDailyWorkout,
}: DraggableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'card',
          day: day.day,
          dayData: day
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })
    );
  }, [day]);


  return (
    <div
      ref={ref}
      className="rounded-xl border p-3 shadow-sm bg-white dark:bg-black border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md"
      data-dragging={isDragging ? 'true' : 'false'}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* 日型标签 */}
      <div className="flex justify-center mb-3">
        <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
          {getDayTypeDisplay(day.type)}
        </div>
      </div>

      {/* 训练项目选择 */}
      <div
        className="mb-3"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
          🏋️ 训练项目
        </label>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <Select
            value={dailyWorkouts[day.day] || ''}
            onValueChange={(value) => setDailyWorkout(day.day, value)}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="选择训练" />
            </SelectTrigger>
            <SelectContent>
              {WORKOUT_TYPES.map((workout) => (
                <SelectItem key={workout.value} value={workout.value}>
                  <span className="flex items-center gap-1">
                    <span>{workout.emoji}</span>
                    <span>{workout.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 营养数据 */}
      <div className="space-y-2.5">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
          📊 营养配比
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">🍚</span>
              <span className="text-xs">碳水</span>
            </div>
            <div className="font-semibold text-xs">{day.carbs}g</div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">🥜</span>
              <span className="text-xs">脂肪</span>
            </div>
            <div className="font-semibold text-xs">{day.fat}g</div>
          </div>

          <div className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-0.5">
              <span className="text-xs">🥩</span>
              <span className="text-xs">蛋白</span>
            </div>
            <div className="font-semibold text-xs">{day.protein}g</div>
          </div>
        </div>

        {/* 热量信息 */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">🔥 总热量</div>
            <div className="font-semibold text-xs">{day.calories}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">📈 热量差</div>
            <div
              className={`font-semibold text-xs ${
                day.caloriesDiff > 0
                  ? 'text-green-600 dark:text-green-400'
                  : day.caloriesDiff < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
              }`}
            >
              {day.caloriesDiff > 0 ? '+' : ''}
              {day.caloriesDiff}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 可放置的列容器
interface DayColumnProps {
  columnIndex: number;
  day: any;
  dailyWorkouts: Record<number, string>;
  setDailyWorkout: (day: number, workout: string) => void;
  onDrop: (dragData: any, columnIndex: number) => void;
}

function DayColumn({
  columnIndex,
  day,
  dailyWorkouts,
  setDailyWorkout,
  onDrop,
}: DayColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ columnIndex }),
      canDrop: ({ source }) => source.data.type === 'card',
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        onDrop(source.data, columnIndex);
      },
    });
  }, [columnIndex, onDrop]);

  return (
    <div 
      ref={ref}
      className={`flex-1 min-w-[120px] max-w-[280px] ${
        isDraggedOver ? 'bg-blue-50/30 dark:bg-blue-900/20 rounded-lg' : ''
      }`}
    >
      {/* 固定列头 - 不可拖拽 */}
      <div className="mb-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
        <div className="flex items-center justify-center">
          <h3 className="font-semibold text-sm">第{columnIndex + 1}天</h3>
        </div>
      </div>

      {/* 卡片容器区域 */}
      <div
        className={`min-h-[300px] rounded-xl border-2 border-dashed ${
          isDraggedOver
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 border-solid'
            : 'border-slate-300/50 dark:border-slate-600/50'
        }`}
      >
        {day && (
          <DraggableCard
            day={day}
            dailyWorkouts={dailyWorkouts}
            setDailyWorkout={setDailyWorkout}
          />
        )}
        {!day && (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm">拖拽卡片到此处</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultCard() {
  const { form, dailyWorkouts, setDailyWorkout, dayOrder, setDayOrder } =
    useFormContext();

  const formData = form?.watch();
  const isValid = form?.formState.isValid;

  const nutritionPlan = useMemo(() => {
    if (
      !form ||
      !isValid ||
      !formData?.weight ||
      !formData?.bodyType ||
      !formData?.age ||
      !formData?.gender ||
      !formData?.height ||
      !formData?.activityFactor ||
      !formData?.carbCoeff ||
      !formData?.proteinCoeff ||
      !formData?.fatCoeff ||
      !formData?.cycleDays
    ) {
      return null;
    }

    const input: UserInput = {
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: formData.height,
      activityFactor: formData.activityFactor,
      bodyType: formData.bodyType,
      carbCoeff: formData.carbCoeff,
      proteinCoeff: formData.proteinCoeff,
      fatCoeff: formData.fatCoeff,
      cycleDays: formData.cycleDays,
    };

    return calculateNutritionPlan(input);
  }, [form, formData, isValid]);

  const metabolicData = useMemo(() => {
    if (
      !form ||
      !isValid ||
      !formData?.weight ||
      !formData?.height ||
      !formData?.age ||
      !formData?.gender ||
      !formData?.activityFactor
    ) {
      return null;
    }

    const input: UserInput = {
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: formData.height,
      activityFactor: formData.activityFactor,
      bodyType: formData.bodyType,
      carbCoeff: formData.carbCoeff,
      proteinCoeff: formData.proteinCoeff,
      fatCoeff: formData.fatCoeff,
      cycleDays: formData.cycleDays,
    };

    return calculateMetabolicData(input);
  }, [form, formData, isValid]);

  // Initialize dayOrder when nutritionPlan changes
  useEffect(() => {
    if (nutritionPlan && nutritionPlan.dailyPlans.length > 0) {
      if (dayOrder.length !== nutritionPlan.dailyPlans.length) {
        setDayOrder(nutritionPlan.dailyPlans.map((day) => day.day));
      }
    }
  }, [nutritionPlan, dayOrder.length, setDayOrder]);

  // Reorder days based on dayOrder
  const orderedDays = useMemo(() => {
    if (!nutritionPlan || dayOrder.length === 0)
      return nutritionPlan?.dailyPlans || [];

    return dayOrder
      .map((dayNum) =>
        nutritionPlan.dailyPlans.find((day) => day.day === dayNum)
      )
      .filter(Boolean) as typeof nutritionPlan.dailyPlans;
  }, [nutritionPlan, dayOrder]);

  const handleDrop = (dragData: any, targetColumnIndex: number) => {
    if (dragData.type !== 'card') return;
    
    const activeDayNum = dragData.day;
    const currentIndex = dayOrder.indexOf(activeDayNum);

    if (currentIndex !== -1 && currentIndex !== targetColumnIndex) {
      const newDayOrder = [...dayOrder];
      // Remove from current position
      newDayOrder.splice(currentIndex, 1);
      // Insert at target position
      newDayOrder.splice(targetColumnIndex, 0, activeDayNum);
      setDayOrder(newDayOrder);
    }
  };


  if (!form) return null;

  const handleCopyResults = () => {
    if (!nutritionPlan) return;

    const { summary, dailyPlans } = nutritionPlan;

    let markdownText = `# 碳循环饮食计划\n\n`;
    markdownText += `## 周度摘要\n`;
    markdownText += `- 🥩 每日蛋白: ${summary.dailyProtein}g\n`;
    markdownText += `- 🍚 周碳水: ${summary.totalCarbs}g\n`;
    markdownText += `- 🥜 周脂肪: ${summary.totalFat}g\n`;
    markdownText += `- 🔥 周热量: ${summary.totalCalories}kcal\n`;
    if (metabolicData) {
      markdownText += `- ⚡ 每日TDEE: ${metabolicData.tdee}kcal\n`;
    }
    markdownText += `\n## 每日明细\n\n`;
    markdownText += `| 天数 | 日型 | 碳水(g) | 脂肪(g) | 蛋白(g) | 总热量(kcal) | 热量差(kcal) |\n`;
    markdownText += `|------|------|---------|---------|---------|-------------|-------------|\n`;

    dailyPlans.forEach((day) => {
      const caloriesDiffStr =
        day.caloriesDiff > 0 ? `+${day.caloriesDiff}` : `${day.caloriesDiff}`;
      markdownText += `| 第${day.day}天 | ${getDayTypeDisplay(day.type)} | ${day.carbs} | ${day.fat} | ${day.protein} | ${day.calories} | ${caloriesDiffStr} |\n`;
    });

    navigator.clipboard
      .writeText(markdownText)
      .then(() => {
        alert('结果已复制到剪贴板！');
      })
      .catch((err) => {
        console.error('复制失败:', err);
      });
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-lg font-bold text-foreground">计算结果</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleCopyResults}
              className="rounded-xl"
            >
              📋 复制结果
            </Button>
            <Button variant="outline" className="rounded-xl" disabled>
              🖼️ 导出 PNG (待实现)
            </Button>
          </div>
        </div>
      </div>

      <div>
        {nutritionPlan ? (
          <div className="space-y-4">
            {/* 周度摘要卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-sm">🥩</span>
                  <span>每日蛋白</span>
                </div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.dailyProtein} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-sm">🍚</span>
                  <span>周碳水</span>
                </div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalCarbs} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-sm">🥜</span>
                  <span>周脂肪</span>
                </div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalFat} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-sm">🔥</span>
                  <span>周热量</span>
                </div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalCalories} kcal
                </div>
              </div>
              {metabolicData && (
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-sm">⚡</span>
                    <span>每日TDEE</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {metabolicData.tdee} kcal
                  </div>
                </div>
              )}
            </div>

            {/* Kanban Board 按天数分列 */}
            <div className="w-full">
              <div
                className="flex gap-3 pb-4 mx-auto justify-around"
                style={{
                  width: orderedDays.length <= 7 ? '100%' : 'max-content',
                  maxWidth: '100%',
                  overflowX: orderedDays.length > 7 ? 'auto' : 'visible',
                }}
              >
                {Array.from({ length: orderedDays.length }, (_, index) => (
                  <DayColumn
                    key={`column-${index}`}
                    columnIndex={index}
                    day={orderedDays[index]}
                    dailyWorkouts={dailyWorkouts}
                    setDailyWorkout={setDailyWorkout}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 空态
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-4xl">📝</div>
            <div className="text-base font-medium">请先填写完整信息</div>
            <div className="text-sm text-slate-500">
              体重、体型、蛋白系数与循环天数就绪后，这里会即时展示你的 3–7
              天计划。
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
