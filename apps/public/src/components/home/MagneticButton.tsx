'use client';

import React from 'react';
import Link from 'next/link';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function MagneticButton({ href, className, children, ...props }: MagneticButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMagneticMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    
    window.requestAnimationFrame(() => {
      target.style.setProperty('--m-x', `${x * 0.15}px`);
      target.style.setProperty('--m-y', `${y * 0.15}px`);
      target.style.transform = 'translate(var(--m-x, 0px), var(--m-y, 0px))';
    });
  };

  const handleMagneticLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    const target = event.currentTarget;
    window.requestAnimationFrame(() => {
      target.style.setProperty('--m-x', '0px');
      target.style.setProperty('--m-y', '0px');
      target.style.transform = 'translate(0px, 0px)';
    });
  };

  return (
    <Link
      href={href}
      onMouseMove={handleMagneticMove}
      onMouseLeave={handleMagneticLeave}
      className={cn('magnetic-btn', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
