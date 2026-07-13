'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { QRCodeSVG } from 'qrcode.react';

export default function MFASetupPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Note: Replace with proper env usage in production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    async function setupMFA() {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });
        if (error) throw error;
        
        if (data.type === 'totp') {
          setQr(data.totp.qr_code);
          setFactorId(data.id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize MFA enrollment');
      }
    }
    setupMFA();
  }, [supabase]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code
      });
      if (verify.error) throw verify.error;
      
      setSuccess(true);
      // Wait a moment and redirect to dashboard
      setTimeout(() => {
        window.location.href = '/superadmin';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">MFA Enrollment Successful!</h2>
          <p className="text-gray-600">Your account is now secured. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Setup Multi-Factor Authentication</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Scan this QR code with your authenticator app (like Google Authenticator or Authy).
          </p>
          {qr ? (
            <div className="p-4 bg-white border rounded-lg">
              <QRCodeSVG value={qr} size={200} />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
              Loading QR...
            </div>
          )}
        </div>

        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              pattern="[0-9]{6}"
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !factorId || code.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify & Enable MFA'}
          </button>
        </form>
      </div>
    </div>
  );
}
