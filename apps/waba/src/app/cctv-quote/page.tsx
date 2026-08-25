"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import {
  CameraType, Resolution, RecorderType, Channels, StorageSize,
  InstallType, Validity, AddonKey,
  ADDON_LIST, CCTVQuoteConfig,
  calcBreakdown, formatRM, genRef, buildQuoteText,
} from '../../lib/cctvQuoteUtils';

export default function CCTVQuotePage() {
  const [customerName, setCustomerName] = useState('');
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
  const [copied, setCopied] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
  const bd = useMemo(() => calcBreakdown(cfg), [
    cameraCount, cameraType, resolution, recorder, channels,
    storage, cableRun, installType, addons,
  ]);

  const quoteText = buildQuoteText(cfg, bd, quoteRef, customerName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    setPdfError(null);
    setIsPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const margin = 18;
      const cW = W - margin * 2;
      let y = 0;

      // header band
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, 36, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      doc.text('CCTV Security System Quotation', margin, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Powered by Tecbunny', margin, 24);
      doc.text(`Ref: ${quoteRef}`, W - margin, 24, { align: 'right' });
      const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.text(`Date: ${dateStr}   Valid: ${cfg.validity} days`, W - margin, 30, { align: 'right' });
      y = 46;

      // customer / site block
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, cW, 22, 'F');
      doc.setTextColor(96, 165, 250);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('PREPARED FOR', margin + 5, y + 7);
      doc.text('INSTALLATION SITE', margin + cW / 2 + 5, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.setFontSize(10);
      doc.text(customerName || '-', margin + 5, y + 15);
      doc.text(cfg.site || '-', margin + cW / 2 + 5, y + 15);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8.5);
      doc.text(`Installation Type: ${cfg.installType}`, margin + 5, y + 21);
      y += 30;

      const section = (title: string) => {
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, y, 3, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(96, 165, 250);
        doc.text(title, margin + 6, y + 5);
        y += 11;
      };

      // breakdown table
      section('SYSTEM BREAKDOWN');
      const rows: [string, string, string, string][] = [
        [`${cfg.cameraCount}x ${cfg.resolution} ${cfg.cameraType} Camera`, `${formatRM(bd.cameraUnit)} each`, `${cfg.cameraCount} unit${cfg.cameraCount > 1 ? 's' : ''}`, formatRM(bd.cameraTotal)],
        [`${cfg.recorder} ${cfg.channels}-Channel Recorder`, '', '1 unit', formatRM(bd.recorderTotal)],
        [`${cfg.storage} HDD Storage`, '', '1 unit', formatRM(bd.storageTotal)],
        [`Cabling & Conduit (${cfg.cableRun}m)`, 'RM 2/m', `${cfg.cableRun}m`, formatRM(bd.cableTotal)],
        [`${cfg.installType} Labour`, '', '1 job', formatRM(bd.installTotal)],
      ];
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, cW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('ITEM', margin + 3, y + 5);
      doc.text('UNIT PRICE', margin + 90, y + 5);
      doc.text('QTY', margin + 120, y + 5);
      doc.text('AMOUNT', W - margin - 3, y + 5, { align: 'right' });
      y += 7;
      rows.forEach((row, i) => {
        if (i % 2 === 0) { doc.setFillColor(15, 23, 42); doc.rect(margin, y, cW, 8, 'F'); }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        doc.text(row[0], margin + 3, y + 5.5);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(row[1], margin + 90, y + 5.5);
        doc.text(row[2], margin + 120, y + 5.5);
        doc.setTextColor(226, 232, 240);
        doc.setFontSize(9);
        doc.text(row[3], W - margin - 3, y + 5.5, { align: 'right' });
        y += 8;
      });
      y += 4;

      // add-ons
      if (bd.addonBreakdown.length > 0) {
        section('ADD-ONS & EXTRAS');
        bd.addonBreakdown.forEach((addon, i) => {
          if (i % 2 === 0) { doc.setFillColor(15, 23, 42); doc.rect(margin, y, cW, 8, 'F'); }
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(203, 213, 225);
          doc.text(addon.label, margin + 3, y + 5.5);
          doc.setTextColor(226, 232, 240);
          doc.text(addon.price === 0 ? 'Included' : formatRM(addon.price), W - margin - 3, y + 5.5, { align: 'right' });
          y += 8;
        });
        y += 4;
      }

      // total
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, cW, 14, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, cW, 14, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(226, 232, 240);
      doc.text('ESTIMATED TOTAL', margin + 5, y + 9);
      doc.setTextColor(96, 165, 250);
      doc.setFontSize(13);
      doc.text(formatRM(bd.total), W - margin - 5, y + 9.5, { align: 'right' });
      y += 20;

      // notes
      if (cfg.notes.trim()) {
        section('NOTES');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        const wrapped = doc.splitTextToSize(cfg.notes.trim(), cW - 6);
        doc.text(wrapped, margin + 3, y);
      }

      // footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, W, 15, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`This is an estimated quotation valid for ${cfg.validity} days. Prices subject to site survey confirmation.`, W / 2, 288, { align: 'center' });
      doc.text('Tecbunny Sdn Bhd  |  www.tecbunny.com', W / 2, 293, { align: 'center' });

      doc.save(`CCTV-Quote-${quoteRef}.pdf`);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF generation failed. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: '8px',
    background: 'rgba(2,6,23,0.55)',
    color: '#e2e8f0',
    padding: '0.5rem 0.7rem',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
  };
  const labelStyle: React.CSSProperties = {
    color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '0.3rem', display: 'block',
  };
  const sectionLabel: React.CSSProperties = {
    color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '0.6rem', marginTop: '0.25rem',
    borderLeft: '3px solid #3b82f6', paddingLeft: '0.5rem',
  };
  const card: React.CSSProperties = {
    background: 'rgba(15,23,42,0.85)',
    border: '1px solid rgba(148,163,184,0.14)',
    borderRadius: '14px',
    padding: '1.25rem',
    marginBottom: '1rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#020617 0%,#0f172a 60%,#1e1b4b 100%)', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(148,163,184,0.12)', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Back to Chat
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>📷 CCTV Custom Setup &amp; Quotation</h1>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Ref: {quoteRef}</p>
        </div>
        {pdfError && (
          <span role="alert" style={{ fontSize: '0.78rem', color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '0.3rem 0.6rem', maxWidth: '220px' }}>
            ⚠ {pdfError}
          </span>
        )}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isPdfLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(96,165,250,0.5)', background: isPdfLoading ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.2)', color: '#bfdbfe', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: isPdfLoading ? 'not-allowed' : 'pointer' }}
          aria-label="Download PDF quotation"
        >
          {isPdfLoading ? '⏳ Generating...' : '⬇ Download PDF'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: `1px solid ${copied ? 'rgba(16,185,129,0.5)' : 'rgba(148,163,184,0.25)'}`, background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.7)', color: copied ? '#6ee7b7' : '#94a3b8', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
          aria-label="Copy quote text to clipboard"
        >
          {copied ? '✓ Copied' : '📋 Copy Text'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,0.8fr)', gap: '1.5rem', padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* ── LEFT: Configuration form ──────────────────────────── */}
        <div>

          {/* Customer */}
          <div style={card}>
            <div style={sectionLabel}>Customer Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Customer / Recipient Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Ahmad bin Abdullah" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Installation Site / Address</label>
                <input type="text" value={site} onChange={e => setSite(e.target.value)} placeholder="e.g. Taman Desa, KL" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Cameras */}
          <div style={card}>
            <div style={sectionLabel}>Camera Configuration</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Camera Count</label>
                <input type="number" min={1} max={64} value={cameraCount} onChange={e => setCameraCount(Math.max(1, Math.min(64, Number(e.target.value))))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Camera Type</label>
                <select value={cameraType} onChange={e => setCameraType(e.target.value as CameraType)} style={inputStyle}>
                  {(['Bullet', 'Dome', 'PTZ', 'Fisheye'] as CameraType[]).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Resolution</label>
                <select value={resolution} onChange={e => setResolution(e.target.value as Resolution)} style={inputStyle}>
                  {(['2MP', '4MP', '8MP', '4K'] as Resolution[]).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.78rem' }}>
              Unit price: <span style={{ color: '#93c5fd' }}>{formatRM(bd.cameraUnit)}</span> each · Subtotal: <span style={{ color: '#93c5fd' }}>{formatRM(bd.cameraTotal)}</span>
            </div>
          </div>

          {/* Recorder + Storage */}
          <div style={card}>
            <div style={sectionLabel}>Recorder &amp; Storage</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Recorder Type</label>
                <select value={recorder} onChange={e => setRecorder(e.target.value as RecorderType)} style={inputStyle}>
                  <option value="NVR">NVR (IP Cameras)</option>
                  <option value="DVR">DVR (Analog)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Channel Count</label>
                <select value={channels} onChange={e => setChannels(Number(e.target.value) as Channels)} style={inputStyle}>
                  {([4, 8, 16, 32] as Channels[]).map(c => <option key={c} value={c}>{c}-Channel</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>HDD Storage</label>
                <select value={storage} onChange={e => setStorage(e.target.value as StorageSize)} style={inputStyle}>
                  {(['1TB', '2TB', '4TB', '8TB'] as StorageSize[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Installation */}
          <div style={card}>
            <div style={sectionLabel}>Installation &amp; Cabling</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Installation Type</label>
                <select value={installType} onChange={e => setInstallType(e.target.value as InstallType)} style={inputStyle}>
                  {(['New Install', 'Upgrade', 'Add-on'] as InstallType[]).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cable Run (metres)</label>
                <input type="number" min={0} max={2000} value={cableRun} onChange={e => setCableRun(Math.max(0, Number(e.target.value)))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Quote Validity</label>
                <select value={validity} onChange={e => setValidity(Number(e.target.value) as Validity)} style={inputStyle}>
                  {([7, 14, 30] as Validity[]).map(v => <option key={v} value={v}>{v} days</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div style={card}>
            <div style={sectionLabel}>Add-ons &amp; Extras</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {ADDON_LIST.map(a => (
                <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', border: `1px solid ${addons.has(a.key) ? 'rgba(96,165,250,0.5)' : 'rgba(148,163,184,0.15)'}`, background: addons.has(a.key) ? 'rgba(59,130,246,0.12)' : 'rgba(2,6,23,0.4)', borderRadius: '9px', padding: '0.6rem 0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addons.has(a.key)} onChange={() => toggleAddon(a.key)} style={{ accentColor: '#3b82f6', width: '15px', height: '15px' }} aria-label={a.label} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.82rem', flex: 1 }}>{a.label}</span>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {a.price === -1 ? `RM 150/cam` : a.price === 0 ? 'Free' : formatRM(a.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={card}>
            <div style={sectionLabel}>Notes &amp; Terms</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Includes 1-year hardware warranty. Installation by certified technicians. Site survey required before finalising."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
              aria-label="Additional notes for the quotation"
            />
          </div>
        </div>

        {/* ── RIGHT: Summary + Preview ──────────────────────────── */}
        <div style={{ position: 'sticky', top: '70px', alignSelf: 'start' }}>

          {/* Price breakdown */}
          <div style={{ ...card, border: '1px solid rgba(96,165,250,0.25)' }}>
            <div style={sectionLabel}>Price Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                [`${cameraCount}× ${resolution} ${cameraType}`, bd.cameraTotal],
                [`${recorder} ${channels}ch Recorder`, bd.recorderTotal],
                [`${storage} Storage`, bd.storageTotal],
                [`Cable Run (${cableRun}m)`, bd.cableTotal],
                [installType, bd.installTotal],
                ...bd.addonBreakdown.map(a => [a.label, a.price] as [string, number]),
              ].map(([label, price]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>{label}</span>
                  <span style={{ color: (price as number) === 0 ? '#475569' : '#e2e8f0' }}>
                    {(price as number) === 0 ? 'Included' : formatRM(price as number)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.18)', marginTop: '0.85rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Estimated Total</span>
              <span style={{ color: '#60a5fa', fontWeight: 800, fontSize: '1.4rem' }}>{formatRM(bd.total)}</span>
            </div>
          </div>

          {/* WhatsApp preview */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={sectionLabel}>WhatsApp Preview</div>
              <button type="button" onClick={handleCopy} style={{ border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(148,163,184,0.2)'}`, background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.5)', color: copied ? '#6ee7b7' : '#94a3b8', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.78rem', lineHeight: '1.6', color: '#cbd5e1', background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '8px', padding: '0.85rem', margin: 0, maxHeight: '380px', overflowY: 'auto' }}>
              {quoteText}
            </pre>
          </div>

          {/* Download button (bottom) */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isPdfLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(96,165,250,0.5)', background: isPdfLoading ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.22)', color: '#bfdbfe', borderRadius: '12px', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, cursor: isPdfLoading ? 'not-allowed' : 'pointer' }}
          >
            {isPdfLoading ? '⏳ Generating PDF...' : '⬇ Download PDF Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
}
