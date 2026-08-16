
'use client';

import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Label } from "@tecbunny/ui";
import { Textarea } from "@tecbunny/ui";
import { Switch } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { usePaymentMethods } from '@tecbunny/core/hooks';

export default function PaymentApiPage() {
  const { toast } = useToast();
  const { paymentMethods, loading, updatePaymentMethod } = usePaymentMethods();

  const [formData, setFormData] = React.useState({
    payu: {
      enabled: false,
      merchantKey: '',
      merchantSalt: '',
      merchantId: '',
      environment: 'production'
    },
    cashfree: {
      enabled: true,
      environment: 'production'
    },
    cod: {
      enabled: true,
      minOrderAmount: '',
      maxOrderAmount: '',
      instructions: ''
    },
    upi: {
      enabled: true,
      upiId: '',
      upiName: '',
      instructions: ''
    }
  });

  const [savingStates, setSavingStates] = React.useState({
    payu: false,
    cashfree: false,
    cod: false,
    upi: false
  });

  // Update form data when payment methods are loaded
  React.useEffect(() => {
    if (!loading && paymentMethods) {
      setFormData({
        payu: {
          enabled: paymentMethods.payu?.enabled || false,
          merchantKey: paymentMethods.payu?.config?.merchantKey || '',
          merchantSalt: paymentMethods.payu?.config?.merchantSalt || '',
          merchantId: paymentMethods.payu?.config?.merchantId || '',
          environment: paymentMethods.payu?.config?.environment || 'production'
        },
        cashfree: {
          enabled: paymentMethods.cashfree?.enabled ?? true,
          environment: paymentMethods.cashfree?.config?.environment || 'production'
        },
        cod: {
          enabled: paymentMethods.cod?.enabled ?? true,
          minOrderAmount: paymentMethods.cod?.config?.minOrderAmount || '',
          maxOrderAmount: paymentMethods.cod?.config?.maxOrderAmount || '',
          instructions: paymentMethods.cod?.config?.instructions || ''
        },
        upi: {
          enabled: paymentMethods.upi?.enabled ?? true,
          upiId: paymentMethods.upi?.config?.upiId || '',
          upiName: paymentMethods.upi?.config?.upiName || '',
          instructions: paymentMethods.upi?.config?.instructions || ''
        }
      });
    }
  }, [loading, paymentMethods]);

  const handleSavePayu = async () => {
    setSavingStates(prev => ({ ...prev, payu: true }));
    try {
      const result = await updatePaymentMethod('payu', {
        enabled: formData.payu.enabled,
        config: {
          merchantKey: formData.payu.merchantKey,
          merchantSalt: formData.payu.merchantSalt,
          merchantId: formData.payu.merchantId,
          environment: formData.payu.environment
        }
      });

      toast(result?.success
        ? { title: 'Saved', description: 'PayU gateway updated.' }
        : { title: 'Error', description: result?.error || 'Save failed.', variant: 'destructive' }
      );
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSavingStates(prev => ({ ...prev, payu: false }));
    }
  };

  const handleSaveCashfree = async () => {
    setSavingStates(prev => ({ ...prev, cashfree: true }));
    try {
      const result = await updatePaymentMethod('cashfree', {
        enabled: formData.cashfree.enabled,
        config: { environment: formData.cashfree.environment },
      });

      toast(result?.success
        ? { title: 'Saved', description: 'Cashfree gateway updated.' }
        : { title: 'Error', description: result?.error || 'Save failed.', variant: 'destructive' }
      );
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSavingStates(prev => ({ ...prev, cashfree: false }));
    }
  };

  const handleSaveCOD = async () => {
    setSavingStates(prev => ({ ...prev, cod: true }));
    try {
      const result = await updatePaymentMethod('cod', {
        enabled: formData.cod.enabled,
        config: {
          minOrderAmount: formData.cod.minOrderAmount,
          maxOrderAmount: formData.cod.maxOrderAmount,
          instructions: formData.cod.instructions
        }
      });

      toast(result?.success
        ? { title: 'Saved', description: 'COD settings updated.' }
        : { title: 'Error', description: result?.error || 'Save failed.', variant: 'destructive' }
      );
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSavingStates(prev => ({ ...prev, cod: false }));
    }
  };

  const handleSaveUPI = async () => {
    setSavingStates(prev => ({ ...prev, upi: true }));
    try {
      const result = await updatePaymentMethod('upi', {
        enabled: formData.upi.enabled,
        config: {
          upiId: formData.upi.upiId,
          upiName: formData.upi.upiName,
          instructions: formData.upi.instructions
        }
      });

      toast(result?.success
        ? { title: 'Saved', description: 'UPI settings updated.' }
        : { title: 'Error', description: result?.error || 'Save failed.', variant: 'destructive' }
      );
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSavingStates(prev => ({ ...prev, upi: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Payment API Settings</h1>
          <p className="text-muted-foreground">Loading payment configuration...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payment Gateway Settings</h1>
        <p className="text-muted-foreground">
          Toggle gateways on/off. Enabled state is saved to the database. Credentials must be set as server environment variables.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PayU</CardTitle>
          <CardDescription>
            Configure PayU (India) merchant credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Enable PayU</Label>
              <p className="text-xs text-muted-foreground">Allow customers to pay using PayU.</p>
            </div>
            <Switch
              checked={formData.payu.enabled}
              onCheckedChange={(checked) =>
                setFormData(prev => ({
                  ...prev,
                  payu: { ...prev.payu, enabled: checked }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payu-merchant-key">Merchant Key</Label>
            <Input
              id="payu-merchant-key"
              placeholder="e.g., gtKFFx"
              value={formData.payu.merchantKey}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  payu: { ...prev.payu, merchantKey: e.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payu-merchant-salt">Merchant Salt</Label>
            <Input
              id="payu-merchant-salt"
              type="password"
              placeholder="Enter your salt"
              value={formData.payu.merchantSalt}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  payu: { ...prev.payu, merchantSalt: e.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payu-merchant-id">Merchant ID (optional)</Label>
            <Input
              id="payu-merchant-id"
              placeholder="Enter Merchant ID if provided"
              value={formData.payu.merchantId}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  payu: { ...prev.payu, merchantId: e.target.value }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payu-environment">Environment</Label>
            <select
              id="payu-environment"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.payu.environment}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  payu: { ...prev.payu, environment: e.target.value }
                }))
              }
            >
              <option value="test">Test (Sandbox)</option>
              <option value="production">Production (Live)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Use the Test environment until PayU activates your live credentials.
            </p>
          </div>
          <Button onClick={handleSavePayu} disabled={savingStates.payu}>
            {savingStates.payu ? 'Saving...' : 'Save PayU Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Cashfree Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cashfree</CardTitle>
          <CardDescription>
            Cashfree Payment Gateway — supports 120+ payment methods including UPI, cards, net banking, and wallets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Enable Cashfree</Label>
              <p className="text-xs text-muted-foreground">Allow customers to pay via Cashfree checkout.</p>
            </div>
            <Switch
              checked={formData.cashfree.enabled}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, cashfree: { ...prev.cashfree, enabled: checked } }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cf-environment">Environment</Label>
            <select
              id="cf-environment"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.cashfree.environment}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, cashfree: { ...prev.cashfree, environment: e.target.value } }))
              }
            >
              <option value="sandbox">Sandbox (Test)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>
          <div className="rounded-lg border border-dashed p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Required environment variables (API app)</p>
            <p className="text-muted-foreground mb-1">Set both pairs — the active one is chosen by <span className="font-mono text-blue-500">CASHFREE_ENV</span>.</p>
            <ul className="space-y-1 font-mono">
              <li className="text-yellow-600 font-semibold">Sandbox credentials</li>
              <li>CASHFREE_SANDBOX_APP_ID</li>
              <li>CASHFREE_SANDBOX_SECRET_KEY</li>
              <li className="mt-2 text-emerald-600 font-semibold">Production credentials</li>
              <li>CASHFREE_PROD_APP_ID</li>
              <li>CASHFREE_PROD_SECRET_KEY</li>
              <li className="mt-2">CASHFREE_ENV — <span className="text-yellow-600">sandbox</span> | <span className="text-emerald-600">production</span></li>
              <li>NEXT_PUBLIC_CASHFREE_ENV — same value (public app)</li>
            </ul>
          </div>
          <Button onClick={handleSaveCashfree} disabled={savingStates.cashfree}>
            {savingStates.cashfree ? 'Saving...' : 'Save Cashfree Settings'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cash on Delivery (COD)</CardTitle>
          <CardDescription>
            Configure cash on delivery payment option for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Enable Cash on Delivery</Label>
              <p className="text-xs text-muted-foreground">Allow customers to pay with cash upon delivery.</p>
            </div>
            <Switch 
              checked={formData.cod.enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  cod: { ...prev.cod, enabled: checked }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cod-min-amount">Minimum Order Amount (₹)</Label>
            <Input 
              id="cod-min-amount" 
              type="number"
              placeholder="e.g., 0 (optional)"
              value={formData.cod.minOrderAmount}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  cod: { ...prev.cod, minOrderAmount: e.target.value }
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no minimum order amount
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cod-max-amount">Maximum Order Amount (₹)</Label>
            <Input 
              id="cod-max-amount" 
              type="number"
              placeholder="e.g., 50000 (optional)"
              value={formData.cod.maxOrderAmount}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  cod: { ...prev.cod, maxOrderAmount: e.target.value }
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no maximum order amount
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cod-instructions">Instructions for Customers</Label>
            <Textarea 
              id="cod-instructions" 
              placeholder="e.g., Please keep exact change ready. Our delivery partner will collect the payment."
              value={formData.cod.instructions}
              rows={3}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  cod: { ...prev.cod, instructions: e.target.value }
                }))
              }
            />
          </div>
          <Button onClick={handleSaveCOD} disabled={savingStates.cod}>
            {savingStates.cod ? 'Saving...' : 'Save COD Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* UPI Section */}
      <Card>
        <CardHeader>
          <CardTitle>UPI / QR Code Payment</CardTitle>
          <CardDescription>
            Configure UPI payment option for manual QR code payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Enable UPI Payments</Label>
              <p className="text-xs text-muted-foreground">Allow customers to pay via UPI/QR code.</p>
            </div>
            <Switch 
              checked={formData.upi.enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  upi: { ...prev.upi, enabled: checked }
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upi-id">UPI ID</Label>
            <Input 
              id="upi-id" 
              placeholder="e.g., yourstore@paytm or 9876543210@ybl"
              value={formData.upi.upiId}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  upi: { ...prev.upi, upiId: e.target.value }
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Your UPI ID for receiving payments (e.g., merchantname@paytm)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="upi-name">Account Holder Name</Label>
            <Input 
              id="upi-name" 
              placeholder="e.g., TecBunny Solutions"
              value={formData.upi.upiName}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  upi: { ...prev.upi, upiName: e.target.value }
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Name that appears on the UPI account
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="upi-instructions">Payment Instructions</Label>
            <Textarea 
              id="upi-instructions" 
              placeholder="e.g., Scan the QR code and complete the payment. Share the transaction screenshot/ID with us."
              value={formData.upi.instructions}
              rows={3}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  upi: { ...prev.upi, instructions: e.target.value }
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Instructions shown to customers during UPI payment
            </p>
          </div>
          <Button onClick={handleSaveUPI} disabled={savingStates.upi}>
            {savingStates.upi ? 'Saving...' : 'Save UPI Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
