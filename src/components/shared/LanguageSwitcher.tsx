import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];
  const nextLanguage =
    languages.find((lang) => lang.code !== i18n.language) || languages[1];

  const handleLanguageSwitch = () => {
    i18n.changeLanguage(nextLanguage.code);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageSwitch}
      className="h-8 w-8 p-0 hover:bg-transparent dark:hover:bg-transparent rounded-full transition-all duration-200 cursor-pointer"
      title={`Switch to ${nextLanguage.name}`}
    >
      <span className="text-xl">{currentLanguage.flag}</span>
    </Button>
  );
}
