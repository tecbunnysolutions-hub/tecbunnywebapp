"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutSchema } from "@/lib/validation";
import { z } from "zod";

export function InstantIdentity({ onIdentified }: { onIdentified: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Human-first validation via Zod
      checkoutSchema.pick({ email: true }).parse({ email });
      
      setIsLoading(true);
      // Simulate background magic link send & identity resolution
      setTimeout(() => {
        setIsLoading(false);
        onIdentified(email);
      }, 1200);

    } catch (err) {
      if (err instanceof z.ZodError) {
        const zodErr = err as z.ZodError;
        setError(zodErr.issues[0].message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-gray-900">Where should we send your receipt?</h2>
      <p className="text-gray-500 mt-2 mb-6">Drop your email below and we'll save your progress instantly.</p>
      
      <form onSubmit={handleContinue} className="space-y-4 text-left">
        <div>
          <Input 
            type="email" 
            placeholder="name@example.com" 
            className={`h-14 rounded-xl bg-gray-50/50 transition-all text-lg ${error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200 focus:bg-white"}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2 animate-in slide-in-from-top-1">{error}</p>}
        </div>
        
        <Button 
          type="submit"
          className="w-full rounded-xl h-14 text-lg font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Securing connection...
            </span>
          ) : (
            "Continue Securely"
          )}
        </Button>
      </form>
    </div>
  );
}
