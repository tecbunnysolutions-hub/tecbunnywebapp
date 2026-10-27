'use client';

import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SellerLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      window.location.href = '/seller/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-muted-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <Building2 className="w-10 h-10 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">TecBunny Seller Partner</h1>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Sign in to access your Managed Seller Partner Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="app-seller-login-page-registered-email-username" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Registered Email / Username
              </label>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input id="app-seller-login-page-registered-email-username"
                  type="email"
                  required
                  placeholder="seller@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="app-seller-login-page-password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input id="app-seller-login-page-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded bg-card border-border text-primary focus:ring-primary" />
                Remember this device
              </label>
              <a href="#" className="text-primary hover:text-primary transition">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Seller Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            Don't have a seller account?{' '}
            <a href="/seller/register" className="text-primary font-semibold hover:text-primary transition">
              Register as Seller Partner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
