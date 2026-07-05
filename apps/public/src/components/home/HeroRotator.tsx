'use client';

import React from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const heroWords = ['Home.', 'Business.', 'Assets.', 'Future.'];

export function HeroRotator() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [heroWordIndex, setHeroWordIndex] = React.useState(0);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setHeroWordIndex(0);
      return undefined;
    }

    let intervalId: number;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setHeroWordIndex((current) => (current + 1) % heroWords.length);
      }, 2400);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="hero-rotator text-base font-black uppercase tracking-[0.4em] text-blue-500" aria-hidden="true">
      {heroWords.map((word, index) => (
        <span
          key={word}
          className={index === heroWordIndex ? 'hero-rotator__word hero-rotator__word--active drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'hero-rotator__word'}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
