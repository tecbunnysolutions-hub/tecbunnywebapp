"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  language: string;
  content: string;
  status: string;
  category?: string;
  provider_status?: string;
  variable_count?: number;
  rejection_reason?: string;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  
  // New Template Form
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLang, setNewLang] = useState("en");

  const router = useRouter();

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.user) router.push('/login');
      else fetchTemplates();
    });
  }, []);



  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContent) return;
    setNotice(null);
    
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, content: newContent, language: newLang })
      });
      if (res.ok) {
        setNewName("");
        setNewContent("");
        setIsCreating(false);
        setNotice({ tone: 'success', message: 'Template saved as pending. Sync provider approval before broadcasting.' });
        fetchTemplates();
      } else {
        setNotice({ tone: 'error', message: 'Failed to create template. Please check the details and try again.' });
      }
    } catch (err) {
      console.error(err);
      setNotice({ tone: 'error', message: 'Template could not be submitted. Please check the connection and try again.' });
    }
  };

  const handleSyncTemplates = async () => {
    setIsSyncing(true);
    setNotice(null);
    try {
      const response = await fetch('/api/templates/sync', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: 'error', message: payload.error || 'Provider template sync failed.' });
      } else {
        setNotice({ tone: 'success', message: `Provider sync complete. ${payload.synced ?? 0} templates refreshed.` });
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
      setNotice({ tone: 'error', message: 'Provider template sync could not be started.' });
    }
    setIsSyncing(false);
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Template Library</h1>
          <p style={{ color: '#94a3b8' }}>Manage WhatsApp templates and provider approval status</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/analytics" style={{ color: '#bfdbfe', textDecoration: 'none', alignSelf: 'center' }}>Analytics</Link>
          <Link href="/contacts" style={{ color: '#bfdbfe', textDecoration: 'none', alignSelf: 'center' }}>Consent</Link>
          <button onClick={handleSyncTemplates} disabled={isSyncing} style={{ background: isSyncing ? 'rgba(59,130,246,0.5)' : '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{isSyncing ? 'Syncing...' : 'Sync Provider'}</button>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>← Back to Inbox</button>
          <button onClick={() => setIsCreating(!isCreating)} style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ New Template</button>
        </div>
      </div>

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: notice.tone === 'error' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            background: notice.tone === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: notice.tone === 'error' ? '#fecaca' : '#bbf7d0',
            fontSize: '0.9rem'
          }}
        >
          {notice.message}
        </div>
      )}

      {isCreating && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Create New Template</h2>
          <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <div className="crm-field">
              <label>Template Name (e.g. welcome_message)</label>
              <input type="text" className="crm-input" value={newName} onChange={e => setNewName(e.target.value.toLowerCase().replace(/\s+/g, '_'))} required />
            </div>
            <div className="crm-field">
              <label>Language Code</label>
              <select className="crm-select" value={newLang} onChange={e => setNewLang(e.target.value)}>
                <option value="en">English (en)</option>
                <option value="es">Spanish (es)</option>
                <option value="pt">Portuguese (pt)</option>
              </select>
            </div>
            <div className="crm-field">
              <label>Message Content (Use {"{{1}}"} for variables)</label>
              <textarea className="crm-textarea" value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Hi {{1}}, your order {{2}} has shipped!" required />
            </div>
            <button type="submit" style={{ background: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit for Approval</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {templates.map(t => (
            <div key={t.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.name}</h3>
                <span className={`crm-status-badge status-WON`} style={{ margin: 0 }}>{t.provider_status || t.status}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Language: {t.language} · Category: {t.category || 'MARKETING'} · Variables: {t.variable_count ?? 0}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem', lineHeight: 1.5, minHeight: '100px' }}>
                {t.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
