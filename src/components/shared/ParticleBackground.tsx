import { useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useEffect, useState } from 'react';

interface ParticleBackgroundProps {
  isAnimating?: boolean;
}

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
          value: 20, // Balanced particle count for visual appeal and performance
          density: {
            enable: true,
            area: 1200,
          },
        },
        shape: {
          type: 'emoji',
          options: {
            emoji: {
              value: [
                '🍚',
                '🍞',
                '🥖',
                '🥯',
                '🍝',
                '🥩',
                '🍖',
                '🐟',
                '🥑',
                '🫒',
                '🥜',
                '🧈',
              ],
            },
          },
        },
        opacity: {
          value: 0.6,
        },
        size: {
          value: 6,
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
            enable: !isAnimating,
            mode: 'grab',
          },
          onClick: {
            enable: !isAnimating,
            mode: 'push',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.5,
            },
          },
          push: {
            quantity: 3,
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
