export function ResultCard() {
  const isReady = false; // TODO: 用表单校验结果驱动

  return (
    <div>
      {isReady ? (
        <div className="space-y-4">
          {/* TODO: 周度摘要卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
              <div className="text-xs text-slate-500">🥗 每日蛋白</div>
              <div className="text-lg font-semibold">— g</div>
            </div>
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
              <div className="text-xs text-slate-500">🍚 周碳水</div>
              <div className="text-lg font-semibold">— g</div>
            </div>
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
              <div className="text-xs text-slate-500">🧈 周脂肪</div>
              <div className="text-lg font-semibold">— g</div>
            </div>
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3">
              <div className="text-xs text-slate-500">🔥 周热量</div>
              <div className="text-lg font-semibold">— kcal</div>
            </div>
          </div>

          {/* TODO: 每日明细表 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">天数</th>
                  <th className="px-3 py-2 text-left font-medium">日型</th>
                  <th className="px-3 py-2 text-right font-medium">碳水(g)</th>
                  <th className="px-3 py-2 text-right font-medium">脂肪(g)</th>
                  <th className="px-3 py-2 text-right font-medium">蛋白(g)</th>
                  <th className="px-3 py-2 text-right font-medium">
                    总热量(kcal)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-3 py-2">第1天</td>
                  <td className="px-3 py-2">⚡ 高碳日</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TODO: 操作按钮（复制/导出） */}
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
              复制结果
            </button>
            <button className="rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
              导出 PNG
            </button>
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
  );
}
