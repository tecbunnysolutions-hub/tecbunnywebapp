'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

type Email = {
  id: string;
  subject: string;
  from_name: string | null;
  from_address: string;
  is_read: boolean;
  received_at: string;
};

export default function WebmailInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webmail/messages?folder=inbox');
      if (res.status === 401) {
        window.location.href = '/webmail/login';
        return;
      }
      const data = await res.json();
      if (res.ok) setEmails(data.messages || []);
    } catch (err) {
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading} className="text-zinc-400 hover:text-zinc-100">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100" disabled>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center w-full max-w-md ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search in mail" 
              className="pl-9 bg-zinc-800/50 border-zinc-700 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p>Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>Your inbox is empty.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {emails.map((email) => (
              <div 
                key={email.id} 
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-zinc-800/30 ${
                  !email.is_read ? 'bg-zinc-900/50' : ''
                }`}
              >
                <div className="w-48 flex-shrink-0">
                  <span className={`text-sm truncate block ${!email.is_read ? 'font-semibold text-zinc-100' : 'text-zinc-300'}`}>
                    {email.from_name || email.from_address}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm truncate block ${!email.is_read ? 'font-semibold text-zinc-100' : 'text-zinc-300'}`}>
                    {email.subject || '(No subject)'}
                  </span>
                </div>
                <div className="w-24 text-right flex-shrink-0">
                  <span className={`text-xs ${!email.is_read ? 'font-semibold text-zinc-100' : 'text-zinc-500'}`}>
                    {format(new Date(email.received_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
