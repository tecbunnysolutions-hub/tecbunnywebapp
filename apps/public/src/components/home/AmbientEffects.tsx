'use client';

import React from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

function scheduleWhenIdle(callback: () => void, timeout = 1600) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const timeoutId = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(timeoutId);
}

export function AmbientEffects() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [enableAmbientEffects, setEnableAmbientEffects] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    return scheduleWhenIdle(() => setEnableAmbientEffects(true), 4000);
  }, [prefersReducedMotion]);

  React.useEffect(() => {
    if (prefersReducedMotion || !enableAmbientEffects) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS max

    const draw = (currentTime: number) => {
      animationId = window.requestAnimationFrame(draw);
      
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      if (!context) return;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        context.fillStyle = 'rgba(59, 130, 246, 0.2)';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
    };

    resize();
    window.addEventListener('resize', resize);
    draw(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [enableAmbientEffects, prefersReducedMotion]);

  if (!enableAmbientEffects || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="pointer-events-none absolute inset-0 h-full w-full opacity-30" 
      aria-hidden="true" 
    />
  );
}
