import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      default:
        return '💻';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 hover:bg-transparent dark:hover:bg-transparent rounded-full transition-all duration-200 cursor-pointer"
      title={`Current theme: ${theme}`}
    >
      <span className="text-xl">{getThemeIcon()}</span>
    </Button>
  );
}
