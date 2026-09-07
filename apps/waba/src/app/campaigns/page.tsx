"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

type Recipient = { name: string; phone: string; offer?: string };
type Template = { name: string; content?: string; status?: string; provider_status?: string };
type Preview = { uploaded: number; eligible: number; invalid: number; duplicates: number; optedOut: number; sample: Recipient[] };

function getColumn(row: Record<string, unknown>, names: string[]) {
  const key = Object.keys(row).find((candidate) => names.includes(candidate.trim().toLowerCase()));
  return key ? row[key] : "";
}

export default function CampaignsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fileName, setFileName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [offer, setOffer] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((response) => response.json())
      .then((data) => {
        const approved = (data.templates ?? []).filter((template: Template) => template.status === "APPROVED" && template.provider_status === "APPROVED");
        setTemplates(approved);
        if (approved[0]) setTemplateName(approved[0].name);
      })
      .catch(() => setMessage("Could not load approved WhatsApp templates."));
  }, []);

  const selectedTemplate = templates.find((template) => template.name === templateName);
  const previewText = useMemo(() => {
    const sample = preview?.sample[0];
    if (!selectedTemplate?.content || !sample) return "Upload contacts and validate to preview the exact message.";
    return selectedTemplate.content.replace(/\{\{1\}\}/g, sample.name).replace(/\{\{2\}\}/g, sample.offer || offer || "your offer");
  }, [offer, preview, selectedTemplate]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setPreview(null);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
      const mapped = rows.map((row) => ({
        name: String(getColumn(row, ["name", "full name", "contact name"])).trim(),
        phone: String(getColumn(row, ["mobile number", "mobile", "phone", "phone number", "whatsapp"])).trim(),
        offer: String(getColumn(row, ["offer", "promotion", "promo"])).trim(),
      }));
      setRecipients(mapped);
      setFileName(file.name);
      if (!mapped.length) setMessage("The workbook has no data rows.");
    } catch (error) {
      setMessage(`Could not read workbook: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const validateContacts = async () => {
    if (!templateName) return setMessage("Select an approved WhatsApp template first.");
    if (!recipients.length) return setMessage("Upload an Excel or CSV file first.");
    setIsBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus: "IMPORTED", templateName, offer, recipients, preview: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Validation failed");
      setPreview(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBusy(false);
    }
  };

  const startCampaign = async () => {
    if (!preview?.eligible) return setMessage("There are no consented contacts eligible for this campaign.");
    setIsBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus: "IMPORTED", templateName, offer, recipients }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Campaign failed");
      setMessage(`Campaign queued for ${data.queued} eligible contacts. ${data.skipped} skipped by daily send limit.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBusy(false);
    }
  };

  const sendTest = async () => {
    if (!testPhone.trim()) return setMessage("Enter a consented test phone number first.");
    if (!templateName) return setMessage("Select an approved WhatsApp template first.");
    setIsBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus: "IMPORTED", templateName, offer, recipients: [{ name: "Test contact", phone: testPhone }] }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Test send failed");
      setMessage(`Test message queued for ${testPhone}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "760px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>WhatsApp campaign</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.5rem" }}>Upload consented contacts, validate eligibility, preview the approved message, then queue the campaign.</p>
        </div>

        <label style={{ border: "1px dashed rgba(96,165,250,0.55)", borderRadius: "8px", padding: "1.5rem", cursor: "pointer", color: "#bfdbfe" }}>
          <strong>{fileName || "Choose Excel or CSV file"}</strong>
          <span style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.35rem" }}>Required columns: Name and Mobile Number. Optional: Offer.</span>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
            Approved WhatsApp template
            <select className="crm-select" value={templateName} onChange={(event) => setTemplateName(event.target.value)}>
              <option value="">Select template</option>
              {templates.map((template) => <option key={template.name} value={template.name}>{template.name}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
            Promotion or offer
            <input className="crm-input" value={offer} onChange={(event) => setOffer(event.target.value)} placeholder="Optional fallback for {{2}}" />
          </label>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" onClick={validateContacts} disabled={isBusy || !recipients.length} className="crm-button">{isBusy ? "Checking..." : "Validate contacts"}</button>
          {preview && <button type="button" onClick={startCampaign} disabled={isBusy || !preview.eligible} className="crm-button" style={{ background: "#f59e0b", color: "#111827" }}>{isBusy ? "Starting..." : "Start campaign"}</button>}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#94a3b8", fontSize: "0.85rem", flex: "1 1 240px" }}>
            Test phone number
            <input className="crm-input" value={testPhone} onChange={(event) => setTestPhone(event.target.value)} placeholder="+15551234567" />
          </label>
          <button type="button" onClick={sendTest} disabled={isBusy} className="crm-button">Send test</button>
        </div>

        {preview && <div role="status" style={{ padding: "1rem", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#d1fae5" }}>
          <strong>{preview.uploaded} uploaded -&gt; {preview.eligible} eligible</strong>
          <div style={{ color: "#a7f3d0", fontSize: "0.85rem", marginTop: "0.4rem" }}>Invalid: {preview.invalid} | Duplicates: {preview.duplicates} | Opted out or no consent: {preview.optedOut}</div>
          <div style={{ marginTop: "0.75rem", color: "#f8fafc" }}>{previewText}</div>
        </div>}

        {message && <div role="alert" style={{ padding: "1rem", borderRadius: "8px", background: "rgba(239,68,68,0.1)", color: "#fecaca", border: "1px solid rgba(239,68,68,0.2)" }}>{message}</div>}

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <Link href="/analytics" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "0.9rem" }}>Analytics</Link>
          <Link href="/contacts" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "0.9rem" }}>Consent ledger</Link>
          <Link href="/" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "0.9rem" }}>Back to inbox</Link>
        </div>
      </div>
    </div>
  );
}