'use client';

import * as React from 'react';
import { Bell, Camera, KeyRound, Laptop, RefreshCw, Save, ShieldCheck, UserCog } from 'lucide-react';

type StaffProfile = {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  branch_name?: string | null;
  department?: string | null;
  timezone?: string | null;
  language?: string | null;
  theme?: 'system' | 'light' | 'dark' | null;
  signature?: string | null;
  notification_preferences?: Record<string, boolean>;
  security_preferences?: { requireTwoFactor?: boolean; loginAlerts?: boolean; sessionTimeoutMinutes?: number };
  privacy_preferences?: { showOnlineStatus?: boolean; allowActivityAnalytics?: boolean };
};

const defaultProfile: StaffProfile = {
  id: '',
  name: '',
  email: '',
  mobile: '',
  role: '',
  avatar_url: '',
  company_name: '',
  branch_name: '',
  department: '',
  timezone: 'Asia/Kolkata',
  language: 'en',
  theme: 'system',
  signature: '',
  notification_preferences: { email: true, whatsapp: true, sms: false, orderUpdates: true, securityAlerts: true, marketing: false },
  security_preferences: { requireTwoFactor: false, loginAlerts: true, sessionTimeoutMinutes: 480 },
  privacy_preferences: { showOnlineStatus: true, allowActivityAnalytics: true },
};

function mergeProfile(profile: Partial<StaffProfile>): StaffProfile {
  return {
    ...defaultProfile,
    ...profile,
    notification_preferences: { ...defaultProfile.notification_preferences, ...(profile.notification_preferences ?? {}) },
    security_preferences: { ...defaultProfile.security_preferences, ...(profile.security_preferences ?? {}) },
    privacy_preferences: { ...defaultProfile.privacy_preferences, ...(profile.privacy_preferences ?? {}) },
  };
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = React.useState<StaffProfile>(defaultProfile);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState('');

  const loadProfile = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/profile', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to load profile');
      setProfile(mergeProfile(payload.profile ?? {}));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = (key: keyof StaffProfile, value: unknown) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateNested = (group: 'notification_preferences' | 'security_preferences' | 'privacy_preferences', key: string, value: boolean | number) => {
    setProfile((current) => ({ ...current, [group]: { ...(current[group] as Record<string, unknown>), [key]: value } }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to save profile');
      setProfile(mergeProfile(payload.profile ?? profile));
      setMessage('Profile settings saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', newPassword }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Password change failed');
      setNewPassword('');
      setMessage('Password changed successfully.');
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading profile settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Staff Workspace</p>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage identity, security, notifications, appearance, and activity preferences.</p>
        </div>
        <button type="button" onClick={loadProfile} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</div>}
      {message && <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</div>}

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Personal & Company Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium">Full name<input value={profile.name ?? ''} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Email<input value={profile.email ?? ''} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Phone<input value={profile.mobile ?? ''} onChange={(e) => updateField('mobile', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Role<input value={profile.role ?? ''} readOnly className="w-full rounded-lg border border-border bg-muted px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Company<input value={profile.company_name ?? ''} onChange={(e) => updateField('company_name', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Branch<input value={profile.branch_name ?? ''} onChange={(e) => updateField('branch_name', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Department<input value={profile.department ?? ''} onChange={(e) => updateField('department', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium">Profile image URL<input value={profile.avatar_url ?? ''} onChange={(e) => updateField('avatar_url', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Profile Picture</h2></div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xl font-bold">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : (profile.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <p className="text-sm text-muted-foreground">Use a HTTPS image URL. Binary upload can be connected to Supabase Storage without changing this profile contract.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Security</h2></div>
          <label className="mb-3 flex items-center justify-between gap-3 text-sm">Require two-factor authentication<input type="checkbox" checked={Boolean(profile.security_preferences?.requireTwoFactor)} onChange={(e) => updateNested('security_preferences', 'requireTwoFactor', e.target.checked)} /></label>
          <label className="mb-3 flex items-center justify-between gap-3 text-sm">Login alerts<input type="checkbox" checked={Boolean(profile.security_preferences?.loginAlerts)} onChange={(e) => updateNested('security_preferences', 'loginAlerts', e.target.checked)} /></label>
          <label className="space-y-1 text-sm font-medium">Session timeout minutes<input type="number" min={15} max={1440} value={profile.security_preferences?.sessionTimeoutMinutes ?? 480} onChange={(e) => updateNested('security_preferences', 'sessionTimeoutMinutes', Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Notifications</h2></div>
          {Object.entries(profile.notification_preferences ?? {}).map(([key, value]) => (
            <label key={key} className="mb-3 flex items-center justify-between gap-3 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}<input type="checkbox" checked={Boolean(value)} onChange={(e) => updateNested('notification_preferences', key, e.target.checked)} /></label>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><Laptop className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Preferences</h2></div>
          <label className="space-y-1 text-sm font-medium">Language<input value={profile.language ?? 'en'} onChange={(e) => updateField('language', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="mt-3 block space-y-1 text-sm font-medium">Timezone<input value={profile.timezone ?? 'Asia/Kolkata'} onChange={(e) => updateField('timezone', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="mt-3 block space-y-1 text-sm font-medium">Theme<select value={profile.theme ?? 'system'} onChange={(e) => updateField('theme', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Signature & Privacy</h2>
          <label className="space-y-1 text-sm font-medium">Signature<textarea value={profile.signature ?? ''} onChange={(e) => updateField('signature', e.target.value)} rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">Show online status<input type="checkbox" checked={Boolean(profile.privacy_preferences?.showOnlineStatus)} onChange={(e) => updateNested('privacy_preferences', 'showOnlineStatus', e.target.checked)} /></label>
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">Allow activity analytics<input type="checkbox" checked={Boolean(profile.privacy_preferences?.allowActivityAnalytics)} onChange={(e) => updateNested('privacy_preferences', 'allowActivityAnalytics', e.target.checked)} /></label>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Password & Sessions</h2></div>
          <label className="space-y-1 text-sm font-medium">New password<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="12+ chars, upper, lower, number, symbol" className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <button type="button" disabled={saving || newPassword.length === 0} onClick={changePassword} className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Change Password</button>
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">Current device session is active. Central session revocation can be attached to this API contract when Supabase session inventory is enabled.</div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="button" disabled={saving} onClick={saveProfile} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile Settings'}
        </button>
      </div>
    </div>
  );
}