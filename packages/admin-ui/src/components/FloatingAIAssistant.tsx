'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { cn } from "@tecbunny/core/utils";
import { Button } from "@tecbunny/ui";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@tecbunny/ui";

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105",
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* AI Assistant Drawer/Widget */}
      <div 
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] transition-all duration-300 transform origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-2xl border-indigo-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                <div className="bg-indigo-600 p-1.5 rounded-md text-white">
                  <Bot className="w-4 h-4" />
                </div>
                Ask AI Assistant
              </CardTitle>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] p-0 flex flex-col bg-slate-50">
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Mock welcome message */}
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm text-slate-700">
                  <p>Hi! I can help you navigate the system, summarize data, or generate content.</p>
                  <p className="mt-2 text-slate-500 text-xs">Try asking:</p>
                  <ul className="mt-1 space-y-1">
                    <li className="text-indigo-600 cursor-pointer hover:underline">"Show me pending payments"</li>
                    <li className="text-indigo-600 cursor-pointer hover:underline">"Create a quote for TechCorp"</li>
                    <li className="text-indigo-600 cursor-pointer hover:underline">"Summarize today's revenue"</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 bg-white border-t border-slate-100">
            <form 
              className="flex items-center gap-2 w-full"
              onSubmit={(e) => { e.preventDefault(); setQuery(''); }}
            >
              <input
                type="text"
                placeholder="Ask me anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-50 border-none focus:ring-0 rounded-full px-4 py-2 text-sm outline-none"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                disabled={!query.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
