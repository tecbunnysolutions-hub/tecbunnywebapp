"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@tecbunny/database';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [superadminCode, setSuperadminCode] = useState("");

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId) return;
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await createClient().auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode.trim() });
      if (verifyError) {
        setError(verifyError.message || "Invalid verification code");
        setLoading(false);
        return;
      }
      router.replace("/");
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Root (superadmin) sign-in is explicit so ordinary staff logins never
      // consume the root login attempt budget.
      if (isSuperadmin) {
        const superadminResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, otp: superadminCode || undefined, isSuperadmin: true })
        });

        if (superadminResponse.ok) {
          router.replace("/");
          return;
        }

        const data = await superadminResponse.json().catch(() => ({}));
        setError(data.error || "Superadmin sign-in failed");
        setLoading(false);
        return;
      }

      let supabase;
      try {
        supabase = createClient();
      } catch {
        setError('Authentication service is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Complete the account's second factor so privileged APIs see AAL2.
        const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance?.nextLevel === 'aal2' && assurance.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const factor = factors?.totp?.find((candidate: { id: string; status: string }) => candidate.status === 'verified');
          if (factor) {
            setMfaFactorId(factor.id);
            setLoading(false);
            return;
          }
        }
        router.replace("/");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Agent Login</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Access your WABA CRM Workspace</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {mfaFactorId ? (
          <form onSubmit={handleMfaVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="crm-field">
              <label htmlFor="waba-mfa-code">Authenticator code</label>
              <input
                id="waba-mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="crm-input"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        ) : (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="crm-field">
            <label>Email Address</label>
            <input 
              type="text" 
              className="crm-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="agent@tecbunny.com"
              required
            />
          </div>
          
          <div className="crm-field">
            <label>Password</label>
            <input 
              type="password" 
              className="crm-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            <input type="checkbox" checked={isSuperadmin} onChange={e => setIsSuperadmin(e.target.checked)} />
            Sign in as superadmin
          </label>

          {isSuperadmin && (
            <div className="crm-field">
              <label htmlFor="waba-superadmin-code">Authenticator code (if enabled)</label>
              <input
                id="waba-superadmin-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="crm-input"
                value={superadminCode}
                onChange={e => setSuperadminCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              background: loading ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
