"use client";

import { useState } from "react";
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.3Z" />
      <path d="M12 22c2.7 0 5-.9 6.7-2.5L15.4 17c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z" />
      <path d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3a10 10 0 0 0 0 8.8l3.4-2.6Z" />
      <path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-9 5.6l3.4 2.6C7.2 7.9 9.4 6.1 12 6.1Z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.2 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.7 1 .7 2v2.5c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

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
          <GoogleIcon className="w-5 h-5 mr-3" /> Continue with Google
        </Button>
        <Button variant="outline" className="w-full rounded-xl h-12 text-md font-medium" onClick={() => {}}>
          <GitHubIcon className="w-5 h-5 mr-3" /> Continue with GitHub
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
