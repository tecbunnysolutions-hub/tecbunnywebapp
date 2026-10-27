'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, Download, Phone, Shield } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

export default function LazyInvoiceBuilder() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    businessName: '',
    clientName: '',
    amount: '1000'
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const windowSize = useWindowSize();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-12 px-4 sm:px-6">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">

        {/* Left Column: Form & Modal */}
        <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border relative">

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Your First Invoice</h2>
                <p className="text-muted-foreground text-sm">Experience how fast billing can be. No account needed yet.</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label htmlFor="components-onboarding-LazyInvoiceBuilder-your-business-name" className="block text-sm font-medium text-foreground mb-1">Your Business Name</label>
                  <input id="components-onboarding-LazyInvoiceBuilder-your-business-name"
                    required
                    type="text"
                    placeholder="e.g. Acme Agency"
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="components-onboarding-LazyInvoiceBuilder-client-name" className="block text-sm font-medium text-foreground mb-1">Client Name</label>
                  <input id="components-onboarding-LazyInvoiceBuilder-client-name"
                    required
                    type="text"
                    placeholder="e.g. Stark Industries"
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="components-onboarding-LazyInvoiceBuilder-amount" className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
                  <input id="components-onboarding-LazyInvoiceBuilder-amount"
                    required
                    type="number"
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-card hover:bg-card text-foreground font-bold py-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  Generate PDF & Send
                </button>
              </form>
            </div>
          ) : (
            // Soft Gate Modal (Step 2)
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
              <div className="bg-success/10 text-success rounded-full p-4 mb-4">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Tech Service Invoice is Ready!</h2>
              <p className="text-muted-foreground text-center mb-8 px-4 text-sm">
                Create a free account to download this PDF, track payment status, and save client details for next time.
              </p>

              <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    className="w-full pl-10 p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button className="w-full bg-primary hover:bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex justify-center items-center gap-2">
                  <Download className="w-4 h-4" /> Save & Download PDF
                </button>
              </form>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" /> Takes 10 seconds. No credit card ever required.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview & Viral Vector */}
        <div className="sticky top-8 border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-muted p-3 border-b border-border flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <div className="flex gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-destructive text-destructive-foreground"></div>
              <div className="w-3 h-3 rounded-full bg-warning text-warning-foreground"></div>
              <div className="w-3 h-3 rounded-full bg-success text-success-foreground"></div>
            </div>
            Live Preview
          </div>

          <div className="flex-1 p-8 bg-card relative flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-3xl font-serif text-foreground">INVOICE</h1>
                <p className="text-sm text-muted-foreground mt-1">INV-2024-001</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">{formData.businessName || 'Your Business Name'}</p>
                <p className="text-sm text-muted-foreground">GSTIN: 27AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-foreground">{formData.clientName || 'Client Name'}</p>
            </div>

            <table className="w-full mb-8 text-sm">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-2 font-bold text-foreground">Description</th>
                  <th className="py-2 text-right font-bold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 text-muted-foreground">Professional Services</td>
                  <td className="py-3 text-right text-foreground">₹{formData.amount || '1000'}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end mt-auto">
              <div className="w-1/2">
                <div className="flex justify-between py-2 text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{formData.amount || '1000'}</span>
                </div>
                <div className="flex justify-between py-2 text-sm text-muted-foreground border-b border-border">
                  <span>IGST (18%)</span>
                  <span>₹{Number(formData.amount || 1000) * 0.18}</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>₹{Number(formData.amount || 1000) * 1.18}</span>
                </div>
              </div>
            </div>

            {/* VIRAL VECTOR: Public-Facing Artifact Badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-muted border-t border-border p-3 text-center">
              <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                ⚡ Generated in 30 seconds via <strong className="text-foreground">Tecbunny</strong>.
                <span className="text-primary hover:underline cursor-pointer ml-1">Create your service invoice now</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
