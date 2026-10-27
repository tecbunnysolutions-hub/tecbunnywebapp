'use client';

import { ReactNode } from 'react';

// ThemeControls owns the shared preference. CSS supplies the system theme before
// hydration so every app uses the same behavior without a second theme owner.
export function ThemeProvider({ children }: { children: ReactNode; nonce?: string }) {
  return children;
}
