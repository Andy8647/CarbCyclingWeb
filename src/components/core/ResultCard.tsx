import { useMemo } from 'react';
import { useFormContext } from '@/lib/form-context';
import { calculateNutritionPlan, type UserInput } from '@/lib/calculator';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

const getDayTypeDisplay = (type: string) => {
  switch (type) {
    case 'high':
      return '⚡ 高碳日';
    case 'medium':
      return '🟡 中碳日';
    case 'low':
      return '🔵 低碳日';
    default:
      return type;
  }
};

export function ResultCard({ className }: { className: string }) {
  const { form } = useFormContext();

  const formData = form?.watch();
  const isValid = form?.formState.isValid;

  const nutritionPlan = useMemo(() => {
    if (
      !form ||
      !isValid ||
      !formData?.weight ||
      !formData?.bodyType ||
      !formData?.proteinLevel ||
      !formData?.cycleDays
    ) {
      return null;
    }

    const input: UserInput = {
      weight: formData.weight,
      bodyType: formData.bodyType,
      proteinLevel: formData.proteinLevel,
      customProtein: formData.customProtein,
      cycleDays: formData.cycleDays,
    };

    return calculateNutritionPlan(input);
  }, [form, formData, isValid]);

  if (!form) return null;

  const handleCopyResults = () => {
    if (!nutritionPlan) return;

    const { summary, dailyPlans } = nutritionPlan;

    let markdownText = `# 碳循环饮食计划\n\n`;
    markdownText += `## 周度摘要\n`;
    markdownText += `- 🥗 每日蛋白: ${summary.dailyProtein}g\n`;
    markdownText += `- 🍚 周碳水: ${summary.totalCarbs}g\n`;
    markdownText += `- 🧈 周脂肪: ${summary.totalFat}g\n`;
    markdownText += `- 🔥 周热量: ${summary.totalCalories}kcal\n\n`;
    markdownText += `## 每日明细\n\n`;
    markdownText += `| 天数 | 日型 | 碳水(g) | 脂肪(g) | 蛋白(g) | 总热量(kcal) |\n`;
    markdownText += `|------|------|---------|---------|---------|-------------|\n`;

    dailyPlans.forEach((day) => {
      markdownText += `| 第${day.day}天 | ${getDayTypeDisplay(day.type)} | ${day.carbs} | ${day.fat} | ${day.protein} | ${day.calories} |\n`;
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
    <GlassCard className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-lg font-bold text-foreground">计算结果</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-accent-foreground">
            实时计算 · 无需提交
          </span>
        </div>
      </div>

      <div>
        {nutritionPlan ? (
          <div className="space-y-4">
            {/* 周度摘要卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
                <div className="text-xs text-slate-500">🥗 每日蛋白</div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.dailyProtein} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
                <div className="text-xs text-slate-500">🍚 周碳水</div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalCarbs} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
                <div className="text-xs text-slate-500">🧈 周脂肪</div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalFat} g
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
                <div className="text-xs text-slate-500">🔥 周热量</div>
                <div className="text-lg font-semibold">
                  {nutritionPlan.summary.totalCalories} kcal
                </div>
              </div>
            </div>

            {/* 每日明细表 */}
            <div className="overflow-x-auto rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">天数</th>
                    <th className="px-3 py-2 text-left font-medium">日型</th>
                    <th className="px-3 py-2 text-right font-medium">
                      碳水(g)
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      脂肪(g)
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      蛋白(g)
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      总热量(kcal)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {nutritionPlan.dailyPlans.map((day) => (
                    <tr
                      key={day.day}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-3 py-2">第{day.day}天</td>
                      <td className="px-3 py-2">
                        {getDayTypeDisplay(day.type)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {day.carbs}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {day.fat}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {day.protein}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {day.calories}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 操作按钮 */}
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
