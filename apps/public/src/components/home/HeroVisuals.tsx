'use client';

import React from 'react';
import { Clock3, ShieldCheck } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const RESPONSE_TIMES = [
  { label: 'General enquiry response', value: 'Average: 9.2 hours' },
  { label: 'Critical AMC incident', value: 'Response target: <2 hours' },
  { label: 'On-site critical fault', value: 'Target: same business day' },
];

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updatePreference = () => setHasFinePointer(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return hasFinePointer;
}

export function HeroVisuals() {
  const tiltRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasFinePointer = useFinePointer();

  const handleTiltMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current || prefersReducedMotion || !hasFinePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = -((y - rect.height / 2) / 20);
    const rotateY = (x - rect.width / 2) / 20;
    
    window.requestAnimationFrame(() => {
      if (tiltRef.current) {
        tiltRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    });
  };

  const handleTiltLeave = () => {
    if (!tiltRef.current) return;
    window.requestAnimationFrame(() => {
      if (tiltRef.current) {
        tiltRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }
    });
  };

  return (
    <div className="reveal-section is-revealed relative block mt-8 lg:mt-0" data-reveal-id="hero-visual" id="hero-visual" onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave}>
      <div ref={tiltRef} className="hero-status-panel tilt-card tb-panel group relative z-10 overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-5 relative z-10">
          <div className="tb-icon-tile h-9 w-9 border-blue-500/30 bg-blue-500/20 text-blue-400">
            <Clock3 size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Service response times</p>
            <p className="mt-0.5 text-xs text-zinc-400">Clear targets for each type of request</p>
          </div>
        </div>
        <dl className="space-y-3 relative z-10">
          {RESPONSE_TIMES.map((response, i) => (
            <div key={response.label} className="animate-fade-in rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3" style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: 'backwards' }}>
              <dt className="text-sm font-semibold text-zinc-200">{response.label}</dt>
              <dd className="mt-1 text-sm text-blue-300">{response.value}</dd>
            </div>
          ))}
        </dl>
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent relative z-10"></div>
        <div className="relative z-10 flex items-center gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4 transition-transform duration-300 group-hover:scale-[1.02]">
          <div className="tb-icon-tile border-blue-500/30 bg-blue-500/20 text-blue-400">
            <ShieldCheck size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="font-black text-white text-base tracking-wide">SLA Active</p>
            <p className="text-xs font-medium text-zinc-400 mt-0.5">Response Guarantee Backed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
