"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AnalyticsPayload = {
  metrics: Record<string, number>;
  recentCampaigns: Array<Record<string, string | null>>;
  recentEvents: Array<Record<string, string | null>>;
  generatedAt: string;
};

const metricLabels: Record<string, string> = {
  messagesToday: 'Messages today',
  inboundToday: 'Inbound today',
  outboundToday: 'Outbound today',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
  deliveryRate: 'Delivery rate',
  readRate: 'Read rate',
  optedIn: 'Opted-in contacts',
  optedOut: 'Opted-out contacts',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load analytics')))
      .then(setData)
      .catch((analyticsError) => setError(analyticsError instanceof Error ? analyticsError.message : 'Unable to load analytics'));
  }, []);

  return (
    <div className="dashboard-container" style={{ padding: '2rem', overflowY: 'auto', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>WABA Analytics</h1>
          <p style={{ color: '#94a3b8' }}>Delivery, read, campaign, and consent signals from live platform data.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/contacts" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Consent</Link>
          <Link href="/campaigns" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Campaigns</Link>
          <Link href="/" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Inbox</Link>
        </div>
      </div>

      {error ? <div role="alert" style={{ color: '#fecaca', marginBottom: '1rem' }}>{error}</div> : null}
      {!data ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(metricLabels).map(([key, label]) => (
              <div key={key} className="glass-panel" style={{ padding: '1.25rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</span>
                <strong style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.8rem' }}>{data.metrics[key] ?? 0}{key.endsWith('Rate') ? '%' : ''}</strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            <section className="glass-panel" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Recent Campaign Events</h2>
              {data.recentCampaigns.length === 0 ? <p style={{ color: '#94a3b8' }}>No campaign events yet.</p> : data.recentCampaigns.map((event, index) => (
                <div key={`${event.campaign_id}-${event.phone}-${index}`} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <strong>{event.phone}</strong>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{event.status} · {event.message_id || 'no provider id'}</p>
                </div>
              ))}
            </section>

            <section className="glass-panel" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Recent Status Callbacks</h2>
              {data.recentEvents.length === 0 ? <p style={{ color: '#94a3b8' }}>No provider status callbacks yet.</p> : data.recentEvents.map((event, index) => (
                <div key={`${event.message_id}-${index}`} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <strong>{event.status}</strong>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{event.message_id} · {event.occurred_at}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}