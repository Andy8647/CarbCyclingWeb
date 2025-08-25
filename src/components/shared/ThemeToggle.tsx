import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

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
      title={t('accessibility.currentTheme', {
        theme: t(
          `accessibility.theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`
        ),
      })}
    >
      <span className="text-xl">{getThemeIcon()}</span>
    </Button>
  );
}
