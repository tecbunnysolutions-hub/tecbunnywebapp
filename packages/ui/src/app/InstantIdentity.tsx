"use client";
import { createClient } from '@tecbunny/database';

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { mapHumanError } from "@tecbunny/core/errorMapper";

interface InstantIdentityProps {
  onSuccess?: () => void;
}

export function InstantIdentity({ onSuccess }: InstantIdentityProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState("");
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setStatus('SENDING');
    setErrorMessage("");

    // Send magic link. By redirecting back to the current checkout/verification URL,
    // the frontend state (if stored securely in sessionStorage or via URL params) is preserved.
    // This allows the guest user to convert to a verified user without losing their cart payload.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/checkout/verify`,
      }
    });

    if (error) {
      setErrorMessage(mapHumanError(error.status || 500));
      setStatus('ERROR');
    } else {
      setStatus('SENT');
      if (onSuccess) onSuccess();
    }
  };

  if (status === 'SENT') {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center bg-success/10/50 border border-success/10 rounded-3xl animate-in zoom-in-95">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
        <h3 className="text-xl font-bold text-success mb-2">Check your inbox!</h3>
        <p className="text-success">
          We sent a secure magic link to <strong>{email}</strong>. Click it to seamlessly log in and complete your order without needing a password.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-3xl shadow-sm border border-border text-center animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-foreground">Where should we send your receipt?</h2>
      <p className="text-muted-foreground mt-2 mb-6">Drop your email below and we'll save your progress instantly.</p>

      <form onSubmit={handleMagicLink} className="space-y-4 text-left">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            required
            placeholder="name@example.com"
            className={`w-full h-14 pl-12 pr-4 bg-muted/50 border rounded-xl text-lg transition-all outline-none focus:bg-card ${
              status === 'ERROR' ? "border-destructive focus:ring-2 focus:ring-destructive" : "border-border focus:ring-2 focus:ring-primary"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {status === 'ERROR' && (
          <p className="text-sm text-destructive animate-in slide-in-from-top-1">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'SENDING'}
          className="w-full rounded-xl h-14 text-lg font-bold bg-card text-foreground hover:bg-card transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center"
        >
          {status === 'SENDING' ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-border/30 border-t-white rounded-full animate-spin" />
              Securing connection...
            </span>
          ) : (
            "Continue Securely"
          )}
        </button>
      </form>
    </div>
  );
}
