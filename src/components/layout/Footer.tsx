export function Footer() {
  return (
    <footer className="mt-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span>公式依据凯圣王碳循环理论</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed">
            本工具仅供训练与营养规划参考，不构成医疗建议，也不承担任何医疗后果。
            <br />
            请在专业人士指导下进行饮食调整。
          </p>
        </div>
      </div>
    </footer>
  );
}
