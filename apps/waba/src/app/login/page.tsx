"use client";

import { useState } from "react";
import { createClient } from '@tecbunny/database';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");
    
    try {
      if (email === 'superadmin' || email === 'Shubham6010' || email === process.env.NEXT_PUBLIC_SUPERADMIN_USER_ID) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'superadmin', password, isSuperadmin: true })
        });
        
        if (res.ok) {
          window.location.href = "/";
          return;
        } else {
          const data = await res.json();
          setError(data.error || "Invalid superadmin credentials");
          setLoading(false);
          return;
        }
      }

      const supabase = createClient();
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
        window.location.href = "/";
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
      </div>
    </div>
  );
}
