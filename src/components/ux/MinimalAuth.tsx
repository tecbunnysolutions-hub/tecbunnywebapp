"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Chrome } from "lucide-react";

export function MinimalAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"magic" | "password">("magic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Welcome in
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Let's get you set up in seconds.
        </p>
      </div>

      <div className="space-y-4">
        <Button variant="outline" className="w-full rounded-xl h-12 text-md font-medium" onClick={() => {}}>
          <Chrome className="w-5 h-5 mr-3" /> Continue with Google
        </Button>
        <Button variant="outline" className="w-full rounded-xl h-12 text-md font-medium" onClick={() => {}}>
          <Github className="w-5 h-5 mr-3" /> Continue with GitHub
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium">Or use email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email" 
            placeholder="name@example.com" 
            className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
            required
          />
          {authMode === "password" && (
            <Input 
              type="password" 
              placeholder="Your password" 
              className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              required
            />
          )}
          
          <Button 
            className="w-full rounded-xl h-12 text-md font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                Just a moment...
              </span>
            ) : (
              authMode === "magic" ? "Send Magic Link" : "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => setAuthMode(m => m === "magic" ? "password" : "magic")}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {authMode === "magic" ? "I'd rather use a password" : "Use a magic link instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
