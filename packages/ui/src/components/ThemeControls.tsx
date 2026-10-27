'use client';

import { useEffect, useState } from 'react';

type Preference = 'light' | 'dark' | 'system';

/** Shared across app hosts; CSS handles system preference before hydration. */
export function ThemeControls({ floating = false }: { floating?: boolean }) {
  const [preference, setPreference] = useState<Preference>('system');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem('theme'); } catch { /* Storage is optional. */ }
      const next: Preference = saved === 'light' || saved === 'dark' ? saved : 'system';
      setPreference(next);
      const dark = next === 'dark' || (next === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
    };
    sync();
    setReady(true);
    media.addEventListener('change', sync);
    window.addEventListener('storage', sync);
    window.addEventListener('tecbunny:theme', sync);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('tecbunny:theme', sync);
    };
  }, []);
  function update(next: Preference) {
    setPreference(next);
    let persisted = true;
    try { localStorage.setItem('theme', next); } catch { persisted = false; }
    const dark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    if (persisted) window.dispatchEvent(new Event('tecbunny:theme')); 
  }
  return (
    <label className={`tb-theme-switch${floating ? ' tb-theme-tools' : ''}`}>
      <span>Appearance</span>
      <select aria-label="Color theme" disabled={!ready} value={preference} onChange={event => update(event.target.value as Preference)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
