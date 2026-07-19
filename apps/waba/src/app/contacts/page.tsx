"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConsentContact = {
  phone: string;
  opted_in: boolean;
  source: string;
  last_opt_in_at?: string | null;
  opted_out_at?: string | null;
  updated_at: string;
};

export default function ContactsConsentPage() {
  const [contacts, setContacts] = useState<ConsentContact[]>([]);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const loadContacts = (query = '') => {
    fetch(`/api/contacts/consent${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load contacts')))
      .then((payload) => setContacts(Array.isArray(payload.contacts) ? payload.contacts : []))
      .catch((error) => setNotice(error instanceof Error ? error.message : 'Unable to load contacts'));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const updateConsent = async (targetPhone: string, optedIn: boolean) => {
    setNotice(null);
    const response = await fetch('/api/contacts/consent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetPhone, optedIn, source: 'manual_admin' }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(payload.error || 'Unable to update consent');
      return;
    }
    setNotice(`${targetPhone} ${optedIn ? 'opted in' : 'opted out'}.`);
    setPhone('');
    loadContacts(search);
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', overflowY: 'auto', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Consent Ledger</h1>
          <p style={{ color: '#94a3b8' }}>Manage WhatsApp opt-in and opt-out state before broadcasts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/analytics" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Analytics</Link>
          <Link href="/campaigns" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Campaigns</Link>
          <Link href="/" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Inbox</Link>
        </div>
      </div>

      {notice ? <div role="status" style={{ marginBottom: '1rem', color: '#bfdbfe' }}>{notice}</div> : null}

      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'grid', gap: '1rem' }}>
        <label className="crm-field">
          <span>Phone</span>
          <input className="crm-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="919876543210" />
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => phone && updateConsent(phone, true)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer' }}>Mark Opted In</button>
          <button type="button" onClick={() => phone && updateConsent(phone, false)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer' }}>Mark Opted Out</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input className="crm-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search phone" />
          <button type="button" onClick={() => loadContacts(search)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer' }}>Search</button>
        </div>
        {contacts.length === 0 ? <p style={{ color: '#94a3b8' }}>No consent records found.</p> : contacts.map((contact) => (
          <div key={contact.phone} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <strong>{contact.phone}</strong>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{contact.source} · Updated {new Date(contact.updated_at).toLocaleString()}</p>
            </div>
            <span style={{ color: contact.opted_in && !contact.opted_out_at ? '#bbf7d0' : '#fecaca', fontWeight: 700 }}>{contact.opted_in && !contact.opted_out_at ? 'OPTED IN' : 'OPTED OUT'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}