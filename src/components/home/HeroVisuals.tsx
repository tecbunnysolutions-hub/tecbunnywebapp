'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const LOG_LINES = [
  { left: '> Active_AMC_Sites', right: '47 [ONLINE]', tone: 'text-zinc-400' },
  { left: '> Avg_Response_Time', right: '9.2 Hours [NOMINAL]', tone: 'text-zinc-400' },
  { left: '> Hardware_Warranty', right: '1-3 Years [DIRECT]', tone: 'text-zinc-400' },
  { left: '> On_Site_Cover', right: 'Goa & MH [ACTIVE]', tone: 'text-zinc-400' },
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
    <div className="reveal-section is-revealed relative hidden lg:block" data-reveal-id="hero-visual" id="hero-visual" onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave}>
      <div ref={tiltRef} className="hero-status-panel tilt-card tb-panel group relative z-10 overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/80 pb-5 relative z-10">
          <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
          <div className="ml-auto text-xs font-mono font-bold tracking-widest text-blue-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            system_status.log
          </div>
        </div>
        <div className="space-y-4 font-mono text-sm relative z-10">
          {LOG_LINES.map((log, i) => (
            <div key={log.left} className={`flex justify-between items-center ${log.tone} animate-fade-in`} style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: 'backwards' }}>
              <span className="font-semibold text-zinc-300">{log.left}</span>
              <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-xs text-zinc-100">{log.right}</span>
            </div>
          ))}
        </div>
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
