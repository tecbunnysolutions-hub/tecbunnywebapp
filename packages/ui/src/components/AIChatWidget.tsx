'use client';

import * as React from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export interface AIChatWidgetProps {
  onTrackEvent?: (eventType: string, metadata?: Record<string, any>) => void;
}

export function AIChatWidget({ onTrackEvent }: AIChatWidgetProps = {}) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Hi! I am the TecBunny AI Assistant. What kind of IT or Security solution are you looking for today?' }
  ]);
  const [input, setInput] = React.useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    if (onTrackEvent) onTrackEvent('ai_chat_message', { content: input });
    setInput('');

    // Mocking the AI qualification call
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Thanks for sharing! What is your estimated budget and timeline for this requirement?' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card className="w-80 h-[400px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-semibold text-sm">TecBunny AI</h3>
              <p className="text-xs text-primary">Online & ready to help</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-foreground hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-muted">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-foreground border rounded-bl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-card border-t flex gap-2 shrink-0">
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Type your requirement..."
              className="flex-1"
            />
            <Button type="submit" size="icon" className="shrink-0 bg-primary hover:bg-primary text-primary-foreground">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      )}

      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            if (onTrackEvent) onTrackEvent('opened_ai_chat');
          }}
          className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 transition-transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
