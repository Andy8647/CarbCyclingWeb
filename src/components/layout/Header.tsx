import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { UnitSwitcher } from '@/components/shared/UnitSwitcher';
import { GitHubLink } from '@/components/shared/GitHubLink';

export function Header() {
  const { t } = useTranslation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile screen
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Only apply auto-hide on mobile devices
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when at top of page
      if (currentScrollY <= 10) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY - 5) {
        // Scrolling up with slight threshold to avoid jitter
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll listener with throttling
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [lastScrollY, isMobile]);

  return (
    <header
      className={`w-screen px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between z-50 transition-transform duration-300 ease-in-out ${
        isMobile
          ? `sticky top-0 bg-white/90 dark:bg-[#282c34]/90 backdrop-blur-md border-b border-slate-200/20 dark:border-[#3e4451]/30 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`
          : 'relative bg-transparent dark:bg-transparent'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
        <span className="text-primary-foreground font-bold">🍚</span>
        <h1 className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('header.title')}
        </h1>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <UnitSwitcher />
        <LanguageSwitcher />
        <ThemeToggle />
        <GitHubLink />
      </div>
    </header>
  );
}
