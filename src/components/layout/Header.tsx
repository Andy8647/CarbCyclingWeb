import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              🍚
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            碳循环饮食计算器
          </h1>
        </div>
        {/* 右上角放开关：主题/语言/单位等 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full text-xs text-foreground/70">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span>实时计算</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
