'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';

import { createClient } from '@tecbunny/database';
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@tecbunny/ui';

interface NativeMfaSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

/**
 * Staff second factor using Supabase Auth MFA. Verifying a factor raises the
 * session to AAL2, which the gateway and every privileged route guard require.
 */
export function NativeMfaSetup({ onComplete, onCancel }: NativeMfaSetupProps) {
  const [supabase] = useState(() => createClient());
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [existingFactorId, setExistingFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verified = factors?.totp?.find((factor: { id: string; status: string }) => factor.status === 'verified');
      if (verified) {
        // Already enrolled: this session only needs to complete the challenge.
        setExistingFactorId(verified.id);
        return;
      }

      // Abandoned enrollments block new ones; remove them before starting over.
      for (const factor of (factors?.all ?? []) as Array<{ id: string; status: string }>) {
        if (factor.status !== 'verified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `TecBunny staff ${new Date().toISOString()}`,
      });
      if (enrollError) throw enrollError;
      setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start two-factor setup');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void start();
  }, [start]);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    const factorId = existingFactorId ?? enrollment?.factorId;
    if (!factorId) return;

    setIsLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (verifyError) throw verifyError;
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {existingFactorId ? 'Two-factor verification' : 'Set up two-factor authentication'}
          </CardTitle>
          <CardDescription>
            {existingFactorId
              ? 'Enter the code from your authenticator app to continue.'
              : 'Administrator access requires an authenticator app. Scan the code, then enter the 6-digit code it shows.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {enrollment && (
            <div className="space-y-3 text-center">
              {/* Supabase returns the QR code as an SVG data URL. */}
              <img src={enrollment.qrCode} alt="Authenticator QR code" className="mx-auto h-48 w-48 rounded bg-white p-2" />
              <p className="text-xs text-muted-foreground break-all">
                Manual entry key: <span className="font-mono">{enrollment.secret}</span>
              </p>
            </div>
          )}

          {(enrollment || existingFactorId) && (
            <form onSubmit={verify} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="mfa-code">Verification code</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading ? 'Verifying…' : 'Verify'}
              </Button>
            </form>
          )}

          {!enrollment && !existingFactorId && !isLoading && (
            <Button onClick={() => void start()} className="w-full">Try again</Button>
          )}

          <Button variant="outline" onClick={onCancel} className="w-full">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
