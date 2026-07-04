'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Loader2, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function WebmailAdminPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Domain Form
  const [newDomain, setNewDomain] = useState('');
  
  // New Account Form
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webmail/accounts');
      const data = await res.json();
      if (res.ok) {
        setDomains(data.domains || []);
        setAccounts(data.accounts || []);
        if (data.domains?.length > 0) setSelectedDomain(data.domains[0].domain);
      }
    } catch (err: any) {
      toast({ title: "Error", description: 'Failed to load webmail data', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    try {
      const res = await fetch('/api/webmail/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_domain', domain: newDomain })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create domain. Did you run the Supabase migration?');
      }
      toast({ title: "Success", description: 'Domain added!' });
      setNewDomain('');
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountEmail || !newAccountPassword || !selectedDomain) return;
    try {
      const res = await fetch('/api/webmail/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_account', 
          domain: selectedDomain,
          email: `${newAccountEmail}@${selectedDomain}`,
          password: newAccountPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account. Did you run the Supabase migration?');
      toast({ title: "Success", description: 'Account created successfully!' });
      setNewAccountEmail('');
      setNewAccountPassword('');
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webmail Management</h1>
          <p className="text-muted-foreground mt-2">Manage your custom domains and email accounts for the independent mail server.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Domains Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              Domains
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateDomain} className="flex gap-2">
              <Input 
                placeholder="e.g., tecbunny.com" 
                value={newDomain} 
                onChange={(e) => setNewDomain(e.target.value)} 
              />
              <Button type="submit"><Plus className="w-4 h-4 mr-2" /> Add</Button>
            </form>

            <div className="rounded-md border mt-4">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : domains.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No domains configured.</div>
              ) : (
                <ul className="divide-y">
                  {domains.map(d => (
                    <li key={d.id} className="p-3 flex justify-between items-center">
                      <span className="font-medium">{d.domain}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${d.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Email Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="username" 
                  value={newAccountEmail} 
                  onChange={(e) => setNewAccountEmail(e.target.value)} 
                  className="flex-1"
                />
                <div className="flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground">
                  @
                </div>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  {domains.map(d => (
                    <option key={d.id} value={d.domain}>{d.domain}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="password"
                  placeholder="Password" 
                  value={newAccountPassword} 
                  onChange={(e) => setNewAccountPassword(e.target.value)} 
                />
                <Button type="submit"><Plus className="w-4 h-4 mr-2" /> Create</Button>
              </div>
            </form>

            <div className="rounded-md border mt-4">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : accounts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No accounts created.</div>
              ) : (
                <ul className="divide-y">
                  {accounts.map(a => (
                    <li key={a.id} className="p-3 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{a.email}</span>
                        <span className="text-xs text-muted-foreground">Quota: {(a.storage_used_bytes / 1024 / 1024).toFixed(1)} MB / {(a.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${a.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {a.active ? 'Active' : 'Disabled'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
