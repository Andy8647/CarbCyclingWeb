import { useCallback, useMemo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadTextShape } from '@tsparticles/shape-text';
import type { Engine } from '@tsparticles/engine';
import { useTheme } from '@/lib/theme-context';

export function ParticleBackground() {
  const { theme } = useTheme();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadTextShape(engine);
  }, []);

  // Determine if we're in dark mode
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const particlesOptions = useMemo(() => {
    return {
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: prefersReducedMotion ? 30 : 60,
      interactivity: {
        events: {
          onClick: {
            enable: !prefersReducedMotion,
            mode: 'push',
          },
          onHover: {
            enable: !prefersReducedMotion,
            mode: 'repulse',
          },
          resize: true,
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: [
            isDark ? '#98c379' : '#E7B669', // Carbs - accent color
            isDark ? '#c678dd' : '#5C7C8A', // Protein - primary color  
            isDark ? '#56b6c2' : '#8fa1a7', // Fat - secondary color
          ],
        },
        links: {
          color: isDark ? '#98c379' : '#E7B669', // Use theme accent colors
          distance: 200,
          enable: true,
          opacity: prefersReducedMotion ? 0.2 : 0.4,
          width: 1.5,
        },
        move: {
          direction: 'none',
          enable: !prefersReducedMotion,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: prefersReducedMotion ? 0.3 : 1.5,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 400,
          },
          value: 10,
        },
        opacity: {
          value: 1,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 20, max: 40 },
        },
      },
      detectRetina: true,
    };
  }, [isDark, prefersReducedMotion]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw', 
        height: '100vh',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 0, 0, 0.1)', // Temporary red background to see if div is there
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
