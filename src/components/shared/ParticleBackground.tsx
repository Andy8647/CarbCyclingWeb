import { useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useEffect, useState } from 'react';

interface ParticleBackgroundProps {
  isAnimating?: boolean;
}

const FOOD_EMOJIS = [
  '🥐',
  '🥯',
  '🍞',
  '🥖',
  '🥨',
  '🧀',
  '🍚',
  '🍙',
  '🍘',
  '🍢',
  '🍡',
  '🍧',
  '🍨',
  '🍦',
  '🍮',
  '🍩',
  '🍪',
  '🥠',
  '🥮',
  '🍳',
  '🥞',
  '🧇',
  '🥓',
  '🥩',
  '🍗',
  '🍖',
  '🌭',
  '🍔',
  '🍟',
  '🍕',
  '🥪',
  '🥙',
  '🧆',
  '🌮',
  '🌯',
  '🥗',
  '🥘',
  '🥫',
  '🍝',
  '🍜',
  '🍲',
  '🥣',
  '🍏',
  '🍎',
  '🍐',
  '🍊',
  '🍋',
  '🍌',
  '🍉',
  '🍇',
  '🍓',
  '🫐',
  '🍈',
  '🍒',
  '🍑',
  '🥭',
  '🍍',
  '🥥',
  '🥝',
  '🍅',
  '🫒',
  '🥑',
  '🍆',
  '🥔',
  '🥕',
  '🌽',
  '🌶️',
  '🫑',
  '🥒',
  '🥬',
  '🥦',
  '🧄',
  '🧅',
  '🍄',
  '🍤',
  '🍣',
  '🍱',
  '🍛',
  '🥟',
  '🥡',
  '🦀',
  '🦞',
  '🦐',
  '🦑',
  '🐟',
  '🍫',
  '🍬',
  '🍭',
  '🍯',
  '🧁',
  '🍰',
  '🎂',
  '🥧',
  '☕',
  '🍵',
  '🧉',
  '🫖',
  '🥤',
  '🧋',
  '🍼',
  '🥛',
  '🍶',
  '🍺',
  '🍻',
  '🥂',
  '🍷',
  '🥃',
  '🍸',
  '🍹',
  '🍴',
  '🥄',
  '🥢',
  '🧂',
  '🫛',
];

export function ParticleBackground({
  isAnimating = false,
}: ParticleBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particleOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 20, // Reduced for better mobile performance
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      particles: {
        number: {
          value: 50, // Increased particle count for more visual density
          density: {
            enable: true,
            area: 1200,
          },
        },
        shape: {
          type: 'emoji',
          options: {
            emoji: {
              value: FOOD_EMOJIS,
            },
          },
        },
        opacity: {
          value: 0.6,
        },
        size: {
          value: 16,
        },
        links: {
          enable: false,
        },
        move: {
          enable: true,
          speed: isAnimating ? 2 : 0.5, // Reduced speed for smoother performance
          direction: isAnimating ? ('top' as const) : ('none' as const),
          random: !isAnimating,
          straight: isAnimating,
          outModes: {
            default: isAnimating ? ('out' as const) : ('bounce' as const),
          },
        },
        rotate: {
          animation: {
            enable: true,
            speed: 1, // Reduced rotation speed for better mobile performance
            sync: false,
          },
        },
      },
      interactivity: {
        detectsOn: 'canvas' as const,
        events: {
          onHover: {
            enable: false,
          },
          onClick: {
            enable: false,
          },
          resize: {
            enable: true,
          },
        },
      },
      detectRetina: true,
    }),
    [isAnimating]
  );

  if (!init) {
    return null;
  }

  return <Particles id="nutrition-particles" options={particleOptions} />;
}
