"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Lock } from "lucide-react";

export function ProgressiveCheckout() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => setStep(4), 2000); // Move to success
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress Header */}
      <div className="flex justify-between items-center px-8 py-6 bg-gray-50/50 border-b border-gray-100">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= num ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
            {num < 3 && <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full transition-colors ${step > num ? "bg-gray-900" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">What are the details?</h2>
            <div className="grid gap-4">
              <label className="flex items-center p-4 border-2 border-indigo-500 rounded-xl bg-indigo-50/30 cursor-pointer">
                <input type="radio" name="plan" className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span className="ml-4 font-medium text-gray-900">Standard Package</span>
                <span className="ml-auto font-bold text-gray-900">$299</span>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-100 rounded-xl bg-white hover:border-gray-200 cursor-pointer transition-all">
                <input type="radio" name="plan" className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-4 font-medium text-gray-900">Premium Package</span>
                <span className="ml-auto font-bold text-gray-900">$499</span>
              </label>
            </div>
            <Button className="w-full h-14 text-lg rounded-xl mt-4" onClick={() => setStep(2)}>Continue to Summary</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Here's the plan.</h2>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Standard Package</span>
                <span>$299.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>$299.00</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-14 rounded-xl px-8" onClick={() => setStep(1)}>Back</Button>
              <Button className="w-full h-14 text-lg rounded-xl" onClick={() => setStep(3)}>Looks good, let's pay</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">How would you like to pay?</h2>
            <div className="p-6 border border-gray-200 rounded-2xl space-y-4 bg-white">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Lock className="w-4 h-4 mr-2" /> Encrypted & Secure
              </div>
              {/* Placeholder for Stripe Element / Apple Pay */}
              <div className="h-14 bg-gray-50 rounded-xl border border-gray-200 flex items-center px-4 text-gray-400">
                <CreditCard className="w-5 h-5 mr-3" /> Card details (Mocked)
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-14 rounded-xl px-8 disabled:opacity-50" disabled={isProcessing} onClick={() => setStep(2)}>Back</Button>
              <Button 
                className="w-full h-14 text-lg rounded-xl" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Securing your order..." : "Pay $299.00"}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">All set! We're on it.</h2>
            <p className="text-gray-500">Your order has been placed. You can track it right away.</p>
            <Button className="mt-8 h-12 rounded-xl px-8" onClick={() => {}}>View Order Status</Button>
          </div>
        )}
      </div>
    </div>
  );
}
