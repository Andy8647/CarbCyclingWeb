import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Header() {
  return (
    <header className="w-screen px-8 py-4 sticky flex items-center justify-between top-0 z-50 bg-transparent">
      <div className="flex items-center gap-3 text-xl sm:text-2xl">
        <span className="text-primary-foreground font-bold">🍚&nbsp;</span>
        <h1 className=" font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          碳循环饮食计算器
        </h1>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
