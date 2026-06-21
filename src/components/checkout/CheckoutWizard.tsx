"use client";

import { useCheckoutMachine } from "@/hooks/useCheckoutMachine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Calendar, CreditCard, MapPin, Lock } from "lucide-react";
import { InstantIdentity } from "@/components/auth/InstantIdentity";

export function CheckoutWizard() {
  const { state, dispatch } = useCheckoutMachine();

  const handleMockSubmit = () => {
    dispatch({ type: "START_PROCESSING" });
    setTimeout(() => {
      dispatch({ type: "TRANSITION", to: "SUCCESS" });
    }, 2000);
  };

  const getStepNumber = (step: string) => {
    switch (step) {
      case 'CONFIG': return 1;
      case 'IDENTITY': return 2;
      case 'PAYMENT': return 3;
      case 'PROCESSING': return 3;
      case 'SUCCESS': return 4;
      case 'ERROR': return 3;
      default: return 1;
    }
  };

  const currentStepNum = getStepNumber(state.step);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-between px-4 mb-8">
        {[1, 2, 3].map((num) => {
          const isActive = currentStepNum === num;
          const isPassed = currentStepNum > num;
          return (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? "bg-gray-900 text-white ring-4 ring-gray-100" : isPassed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                {isPassed ? <Check className="w-5 h-5" /> : num}
              </div>
              {num < 3 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-500 ${isPassed ? "bg-green-100" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Global Error Banner */}
      {state.errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl animate-in slide-in-from-top-2">
          {state.errorMessage}
        </div>
      )}

      {/* Steps Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {state.step === 'CONFIG' && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-6">Lock in your deployment window.</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <label className="border-2 border-indigo-500 bg-indigo-50/30 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center">
                <input type="radio" name="time" className="sr-only" defaultChecked onChange={() => dispatch({ type: "UPDATE_PAYLOAD", data: { plan: "Morning" } })}/>
                <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="font-bold text-gray-900">Morning</span>
                <span className="text-sm text-gray-500">8 AM - 12 PM</span>
              </label>
              <label className="border-2 border-gray-100 bg-white hover:border-gray-200 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all">
                <input type="radio" name="time" className="sr-only" onChange={() => dispatch({ type: "UPDATE_PAYLOAD", data: { plan: "Afternoon" } })}/>
                <Calendar className="w-6 h-6 text-gray-400 mb-2" />
                <span className="font-bold text-gray-900">Afternoon</span>
                <span className="text-sm text-gray-500">12 PM - 4 PM</span>
              </label>
            </div>
            <Button className="w-full h-14 rounded-xl text-lg" onClick={() => dispatch({ type: "TRANSITION", to: "IDENTITY" })}>
              Confirm Window
            </Button>
          </div>
        )}

        {state.step === 'IDENTITY' && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 bg-gray-50/50">
             <InstantIdentity onSuccess={() => dispatch({ type: "TRANSITION", to: "PAYMENT" })} />
             <div className="mt-4 flex justify-center">
                <Button variant="ghost" onClick={() => dispatch({ type: "TRANSITION", to: "CONFIG" })}>Go back</Button>
             </div>
          </div>
        )}

        {(state.step === 'PAYMENT' || state.step === 'PROCESSING' || state.step === 'ERROR') && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-6">Final step. Secure your deployment.</h2>
            
            <div className="space-y-4 mb-8">
              <div className="relative">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                   <MapPin className="w-5 h-5" />
                 </div>
                 <Input className="h-14 pl-12 rounded-xl bg-gray-50" placeholder="Your Address" defaultValue={state.payload?.address} onChange={(e) => dispatch({ type: "UPDATE_PAYLOAD", data: { address: e.target.value }})} />
              </div>
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                 <Lock className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                 <div>
                   <p className="font-semibold text-sm">Secure Payment Gateway</p>
                   <p className="text-xs text-emerald-600/80 mt-1">
                     Your payment will be processed securely via our PCI-DSS compliant partner. We do not store or transmit your card details.
                   </p>
                 </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="h-14 rounded-xl px-8" onClick={() => dispatch({ type: "TRANSITION", to: "IDENTITY" })} disabled={state.isLocked}>Back</Button>
              <Button 
                className="w-full h-14 text-lg rounded-xl" 
                onClick={handleMockSubmit}
                disabled={state.isLocked}
              >
                {state.isLocked ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 animate-pulse" /> Locking your deployment...
                  </span>
                ) : (
                  "Secure My Slot • $99"
                )}
              </Button>
            </div>
          </div>
        )}

        {state.step === 'SUCCESS' && (
          <div className="p-12 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Deployment Locked.</h2>
            <p className="text-gray-500 mt-2 mb-8">Confirmation and next steps sent to {state.payload?.email || "your email"}</p>
            <Button className="h-12 rounded-xl px-8">Track Deployment</Button>
          </div>
        )}

      </div>
    </div>
  );
}
