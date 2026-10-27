'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@tecbunny/ui';

// The previous widget displayed a mock chat and cleared messages without sending
// them. Offer the working command palette without claiming an AI connection.
export function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('tecbunny:workspace-help', show);
    return () => window.removeEventListener('tecbunny:workspace-help', show);
  }, []);
  const openCommands = () => {
    setOpen(false);
    window.dispatchEvent(new Event('tecbunny:command-palette'));
  };
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><button type="button" aria-label="Open workspace help" className="fixed bottom-24 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md"><Sparkles size={21} aria-hidden="true" /></button></DialogTrigger>
    <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-border bg-card text-foreground">
      <DialogTitle className="pr-8 text-2xl">Find your next action.</DialogTitle>
      <DialogDescription>Search the available workspace commands to reach orders, invoices, inventory and other tasks. Access still depends on your role.</DialogDescription>
      <p className="text-sm text-muted-foreground">Use Ctrl/⌘ K from your keyboard, or open the command search below.</p>
      <button type="button" onClick={openCommands} className="tb-button">Open command search</button>
    </DialogContent>
  </Dialog>;
}
