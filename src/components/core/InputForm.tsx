export function InputForm() {
  return (
    <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
      {/* TODO: Weight input field */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">⚖️</span>
          体重 (Body Weight)
        </label>
        <div className="h-11 bg-input rounded-xl border border-border flex items-center px-4 text-muted-foreground shadow-sm hover:shadow-md transition-shadow">
          Weight input (kg/lb) - TODO
        </div>
      </div>

      {/* TODO: Body type radio group */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">🏃</span>
          体型 (Body Type)
        </label>
        <div className="min-h-[5rem] bg-input rounded-xl border border-border flex items-center px-4 text-muted-foreground shadow-sm hover:shadow-md transition-shadow">
          Radio Group: Endomorph / Mesomorph / Ectomorph - TODO
        </div>
      </div>

      {/* TODO: Protein level selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">🥩</span>
          训练水平 / 蛋白系数
        </label>
        <div className="min-h-[4rem] bg-input rounded-xl border border-border flex items-center px-4 text-muted-foreground shadow-sm hover:shadow-md transition-shadow">
          Beginner / Experienced / Custom + number input - TODO
        </div>
      </div>

      {/* TODO: Cycle days slider */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">📅</span>
          循环天数 (Cycle Days)
        </label>
        <div className="h-12 bg-input rounded-xl border border-border flex items-center px-4 text-muted-foreground shadow-sm hover:shadow-md transition-shadow">
          Slider: 3-7 days - TODO
        </div>
      </div>

      {/* TODO: Calculate button */}
      <div className="pt-6">
        <button className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
          开始计算 🚀
        </button>
      </div>

      <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
        <span>所有必填项完成后，右侧会自动显示结果</span>
      </div>
    </div>
  );
}
