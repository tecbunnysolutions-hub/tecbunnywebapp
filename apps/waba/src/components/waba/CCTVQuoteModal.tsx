"use client";

import React, { useState, useMemo } from 'react';
import {
  CameraType, Resolution, RecorderType, Channels, StorageSize,
  InstallType, Validity, AddonKey,
  ADDON_LIST, CCTVQuoteConfig,
  calcBreakdown, formatRM, genRef, buildQuoteText,
} from '../../lib/cctvQuoteUtils';

interface CCTVQuoteModalProps {
  customerName: string;
  onClose: () => void;
  onShare: (text: string) => void;
}

export function CCTVQuoteModal({ customerName, onClose, onShare }: CCTVQuoteModalProps) {
  const [site, setSite] = useState('');
  const [cameraCount, setCameraCount] = useState(4);
  const [cameraType, setCameraType] = useState<CameraType>('Dome');
  const [resolution, setResolution] = useState<Resolution>('4MP');
  const [recorder, setRecorder] = useState<RecorderType>('NVR');
  const [channels, setChannels] = useState<Channels>(8);
  const [storage, setStorage] = useState<StorageSize>('2TB');
  const [cableRun, setCableRun] = useState(50);
  const [installType, setInstallType] = useState<InstallType>('New Install');
  const [addons, setAddons] = useState<Set<AddonKey>>(new Set());
  const [validity, setValidity] = useState<Validity>(14);
  const [notes, setNotes] = useState('');
  const [quoteRef] = useState(genRef);

  const toggleAddon = (key: AddonKey) => {
    setAddons(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const cfg: CCTVQuoteConfig = {
    site, cameraCount, cameraType, resolution, recorder,
    channels, storage, cableRun, installType, addons, validity, notes,
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const breakdown = useMemo(() => calcBreakdown(cfg), [
    cameraCount, cameraType, resolution, recorder, channels,
    storage, cableRun, installType, addons,
  ]);

  const handleShare = () => {
    onShare(buildQuoteText(cfg, breakdown, quoteRef, customerName));
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid rgba(148, 163, 184, 0.22)',
    borderRadius: '8px',
    background: 'rgba(2, 6, 23, 0.55)',
    color: '#e2e8f0',
    padding: '0.5rem 0.7rem',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
  };

  const labelStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
    display: 'block',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  };

  const fieldStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '120px',
    marginBottom: '0.85rem',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CCTV Quotation Builder"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700 }}>📷 CCTV Quotation Builder</h2>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.75rem' }}>Ref: {quoteRef}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close CCTV quotation builder"
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0.25rem' }}
          >
            ×
          </button>
        </div>

        {/* Site */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Installation Site / Address</label>
          <input
            type="text"
            value={site}
            onChange={e => setSite(e.target.value)}
            placeholder="e.g. Taman Desa, Kuala Lumpur"
            style={inputStyle}
          />
        </div>

        {/* Cameras */}
        <div style={{ marginBottom: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Cameras
        </div>
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Count</label>
            <input
              type="number"
              min={1}
              max={64}
              value={cameraCount}
              onChange={e => setCameraCount(Math.max(1, Math.min(64, Number(e.target.value))))}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <select value={cameraType} onChange={e => setCameraType(e.target.value as CameraType)} style={inputStyle}>
              {(['Bullet', 'Dome', 'PTZ', 'Fisheye'] as CameraType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Resolution</label>
            <select value={resolution} onChange={e => setResolution(e.target.value as Resolution)} style={inputStyle}>
              {(['2MP', '4MP', '8MP', '4K'] as Resolution[]).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recorder */}
        <div style={{ marginBottom: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Recorder & Storage
        </div>
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <select value={recorder} onChange={e => setRecorder(e.target.value as RecorderType)} style={inputStyle}>
              <option value="NVR">NVR (IP)</option>
              <option value="DVR">DVR (Analog)</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Channels</label>
            <select value={channels} onChange={e => setChannels(Number(e.target.value) as Channels)} style={inputStyle}>
              {([4, 8, 16, 32] as Channels[]).map(c => (
                <option key={c} value={c}>{c}-Channel</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>HDD Storage</label>
            <select value={storage} onChange={e => setStorage(e.target.value as StorageSize)} style={inputStyle}>
              {(['1TB', '2TB', '4TB', '8TB'] as StorageSize[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Installation */}
        <div style={{ marginBottom: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Installation
        </div>
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <select value={installType} onChange={e => setInstallType(e.target.value as InstallType)} style={inputStyle}>
              {(['New Install', 'Upgrade', 'Add-on'] as InstallType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Cable Run (metres)</label>
            <input
              type="number"
              min={0}
              max={2000}
              value={cableRun}
              onChange={e => setCableRun(Math.max(0, Number(e.target.value)))}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Quote Valid (days)</label>
            <select value={validity} onChange={e => setValidity(Number(e.target.value) as Validity)} style={inputStyle}>
              {([7, 14, 30] as Validity[]).map(v => (
                <option key={v} value={v}>{v} days</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ marginBottom: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Add-ons
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
          {ADDON_LIST.map(a => (
            <label
              key={a.key}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                border: `1px solid ${addons.has(a.key) ? 'rgba(96, 165, 250, 0.45)' : 'rgba(148, 163, 184, 0.15)'}`,
                background: addons.has(a.key) ? 'rgba(96, 165, 250, 0.1)' : 'rgba(2, 6, 23, 0.4)',
                borderRadius: '8px', padding: '0.45rem 0.6rem', cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={addons.has(a.key)}
                onChange={() => toggleAddon(a.key)}
                style={{ accentColor: '#3b82f6' }}
                aria-label={a.label}
              />
              <span style={{ color: '#cbd5e1', fontSize: '0.78rem', flex: 1 }}>{a.label}</span>
              <span style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                {a.price === -1 ? `RM 150/cam` : a.price === 0 ? 'Free' : formatRM(a.price)}
              </span>
            </label>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Additional Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Includes 1-year warranty. Installation by certified technicians."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Price Summary */}
        <div style={{
          border: '1px solid rgba(96, 165, 250, 0.3)',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Price Estimate
          </div>
          {[
            [`${cameraCount}× ${resolution} ${cameraType}`, breakdown.cameraTotal],
            [`${recorder} ${channels}ch Recorder`, breakdown.recorderTotal],
            [`${storage} Storage`, breakdown.storageTotal],
            [`Cable Run (${cableRun}m)`, breakdown.cableTotal],
            [installType, breakdown.installTotal],
            ...breakdown.addonBreakdown.map(a => [a.label, a.price] as [string, number]),
          ].map(([label, price]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
              <span>{label}</span>
              <span style={{ color: price as number === 0 ? '#64748b' : '#e2e8f0' }}>
                {price as number === 0 ? 'Included' : formatRM(price as number)}
              </span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', marginTop: '0.6rem', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span style={{ color: '#f1f5f9' }}>Estimated Total</span>
            <span style={{ color: '#60a5fa', fontSize: '1rem' }}>{formatRM(breakdown.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.25)', background: 'transparent',
              color: '#94a3b8', borderRadius: '10px', padding: '0.65rem 1.2rem',
              fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              border: '1px solid rgba(96, 165, 250, 0.5)',
              background: 'rgba(59, 130, 246, 0.25)',
              color: '#bfdbfe', borderRadius: '10px', padding: '0.65rem 1.4rem',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            📤 Share to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
