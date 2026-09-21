'use client';

import dynamic from 'next/dynamic';

// Client-only runtime widgets for the homepage. They live in a dedicated
// client boundary because next/dynamic with ssr:false is not allowed inside
// server components — and the homepage itself is a server component so all
// static sections skip hydration entirely.

export const DeferredBehavioralCouponPopup = dynamic(
  () => import('../BehavioralCouponPopup').then((mod) => mod.BehavioralCouponPopup),
  { ssr: false }
);

export const DeferredAmbientEffects = dynamic(
  () => import('./AmbientEffects').then((mod) => mod.AmbientEffects),
  { ssr: false }
);
