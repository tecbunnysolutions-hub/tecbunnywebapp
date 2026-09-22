import React, { useEffect, useState } from 'react';
import type { Conversation, User } from './types';

const CUSTOMER_360_TABS = [
  { id: 'PROFILE', label: 'Profile' },
  { id: 'LEADS', label: 'Leads' },
  { id: 'SERVICE', label: 'Service' },
  { id: 'CRM', label: 'CRM' },
] as const;

type Customer360Tab = typeof CUSTOMER_360_TABS[number]['id'];
type LeadSummary = {
  id: string;
  domain: string;
  sub_category: string;
  status: string;
  pincode?: string | null;
  created_at: string;
};
type TicketSummary = {
  id: string;
  title: string;
  status: string;
  priority: string;
  department: string;
  created_at: string;
  sla_breach_at?: string | null;
};
type Customer360Data = { leads: LeadSummary[]; tickets: TicketSummary[] };

interface Customer360PanelProps {
  showCrm: boolean;
  setShowCrm: (show: boolean) => void;
  activeConvObj?: Conversation;
  workspaceUsers: User[];
  crmName: string;
  setCrmName: (name: string) => void;
  crmStatus: string;
  setCrmStatus: (status: string) => void;
  crmNotes: string;
  setCrmNotes: (notes: string) => void;
  crmAssignedTo: string;
  setCrmAssignedTo: (val: string) => void;
  crmDepartment: string;
  setCrmDepartment: (val: string) => void;
  crmAiActive: boolean;
  setCrmAiActive: (val: boolean) => void;
  crmDealValue: string;
  setCrmDealValue: (val: string) => void;
  crmActiveFlow: string;
  setCrmActiveFlow: (val: string) => void;
  isSavingCrm: boolean;
  saveCrmData: () => Promise<void>;
}

function formatDate(value?: string | null): string {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function initials(value: string): string {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';
}

export function Customer360Panel({
  showCrm, setShowCrm, activeConvObj, workspaceUsers,
  crmName, setCrmName, crmStatus, setCrmStatus, crmNotes, setCrmNotes,
  crmAssignedTo, setCrmAssignedTo, crmDepartment, setCrmDepartment,
  crmAiActive, setCrmAiActive, crmDealValue, setCrmDealValue,
  crmActiveFlow, setCrmActiveFlow, isSavingCrm, saveCrmData,
}: Customer360PanelProps) {
  const [activeTab, setActiveTab] = useState<Customer360Tab>('PROFILE');
  const [customerData, setCustomerData] = useState<Customer360Data>({ leads: [], tickets: [] });
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(false);
  const [customerDataError, setCustomerDataError] = useState('');
  const senderNumber = activeConvObj?.sender_number;
  const displayName = crmName.trim() || activeConvObj?.contact_name || senderNumber || 'Customer';

  useEffect(() => {
    if (!senderNumber) {
      setCustomerData({ leads: [], tickets: [] });
      return;
    }

    const controller = new AbortController();
    setIsLoadingCustomerData(true);
    setCustomerDataError('');
    fetch(`/api/customer-360?phone=${encodeURIComponent(senderNumber)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load customer records.');
        return result.data as Customer360Data;
      })
      .then((data) => setCustomerData({ leads: data?.leads ?? [], tickets: data?.tickets ?? [] }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setCustomerDataError(error instanceof Error ? error.message : 'Could not load customer records.');
      })
      .finally(() => setIsLoadingCustomerData(false));

    return () => controller.abort();
  }, [senderNumber]);

  const statusOptions = ['NEW', 'PROCESSING', 'LEAD', 'HIGH_INTENT', 'PENDING_HUMAN_AGENT', 'ASSIGNED', 'RESOLVED', 'CLOSED', 'URGENT'];

  return (
    <aside className={`crm-panel ${!showCrm ? 'hidden' : ''}`} aria-label="Customer 360 panel">
      <header className="crm-header">
        <div>
          <p className="customer-panel-eyebrow">CONTACT RECORD</p>
          <h3>Customer 360</h3>
        </div>
        <button className="mobile-toggle crm-close" type="button" onClick={() => setShowCrm(false)} aria-label="Close customer profile panel">×</button>
      </header>

      <section className="customer-summary" aria-label="Customer summary">
        <div className="customer-summary-avatar">{initials(displayName)}</div>
        <div className="customer-summary-copy">
          <strong title={displayName}>{displayName}</strong>
          <span>{senderNumber || 'Select a conversation'}</span>
        </div>
        <span className={`customer-ai-indicator ${crmAiActive ? 'is-active' : 'is-paused'}`} title={crmAiActive ? 'AI autopilot active' : 'AI autopilot paused'} aria-label={crmAiActive ? 'AI active' : 'AI paused'} />
      </section>

      <div className="customer-360-tabs" role="tablist" aria-label="Customer details">
        {CUSTOMER_360_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`customer-tab-${tab.id.toLowerCase()}`}
            className={`customer-360-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`customer-360-${tab.id.toLowerCase()}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'LEADS' && customerData.leads.length > 0 && <span className="customer-tab-count">{customerData.leads.length}</span>}
            {tab.id === 'SERVICE' && customerData.tickets.length > 0 && <span className="customer-tab-count">{customerData.tickets.length}</span>}
          </button>
        ))}
      </div>

      <div className="crm-body">
        {activeTab === 'PROFILE' && (
          <section id="customer-360-profile" className="customer-tab-panel" role="tabpanel" aria-labelledby="customer-tab-profile">
            <div className="customer-fact-grid">
              <div className="customer-fact">
                <span>Conversation status</span>
                <strong>{(activeConvObj?.status || 'NEW').replaceAll('_', ' ')}</strong>
              </div>
              <div className="customer-fact">
                <span>Department</span>
                <strong>{(activeConvObj?.department || 'UNASSIGNED').replaceAll('_', ' ')}</strong>
              </div>
            </div>
            <div className="customer-section-heading">Contact details</div>
            <div className="crm-field">
              <label htmlFor="customer-360-name">Customer name</label>
              <input id="customer-360-name" type="text" className="crm-input" value={crmName} onChange={(event) => setCrmName(event.target.value)} placeholder="Add a customer name" />
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-phone">WhatsApp number</label>
              <input id="customer-360-phone" type="text" className="crm-input" value={senderNumber || ''} readOnly />
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-active-flow">Active flow</label>
              <select id="customer-360-active-flow" className="crm-select" value={crmActiveFlow} onChange={(event) => setCrmActiveFlow(event.target.value)}>
                <option value="">No active flow</option>
                <option value="Property Inquiry Flow">Property inquiry</option>
                <option value="Support Intake Flow">Support intake</option>
              </select>
            </div>
            <div className="customer-ai-card">
              <div>
                <strong>AI autopilot</strong>
                <span>{crmAiActive ? 'Handling eligible replies' : 'Paused for human support'}</span>
              </div>
              <label className="customer-switch" aria-label="Toggle AI autopilot">
                <input type="checkbox" checked={crmAiActive} onChange={(event) => setCrmAiActive(event.target.checked)} />
                <span />
              </label>
            </div>
            {activeConvObj?.ad_source && <div className="customer-source">Ad source <strong>{activeConvObj.ad_source}</strong></div>}
          </section>
        )}

        {activeTab === 'LEADS' && (
          <section id="customer-360-leads" className="customer-tab-panel" role="tabpanel" aria-labelledby="customer-tab-leads">
            <div className="customer-section-heading">Sales opportunities</div>
            {customerDataError ? <p className="customer-load-error">{customerDataError}</p> : isLoadingCustomerData ? <p className="customer-loading">Loading customer records…</p> : customerData.leads.length === 0 ? (
              <div className="customer-empty-state"><span>◇</span><strong>No leads yet</strong><p>Leads linked to this WhatsApp number will appear here.</p></div>
            ) : customerData.leads.map((lead) => (
              <article key={lead.id} className="customer-record-card">
                <div className="customer-record-top"><strong>{lead.sub_category.replaceAll('_', ' ')}</strong><span className="customer-record-status">{lead.status.replaceAll('_', ' ')}</span></div>
                <p>{lead.domain.replaceAll('_', ' ')}{lead.pincode ? ` · ${lead.pincode}` : ''}</p>
                <small>Created {formatDate(lead.created_at)}</small>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'SERVICE' && (
          <section id="customer-360-service" className="customer-tab-panel" role="tabpanel" aria-labelledby="customer-tab-service">
            <div className="customer-section-heading">Support tickets</div>
            {customerDataError ? <p className="customer-load-error">{customerDataError}</p> : isLoadingCustomerData ? <p className="customer-loading">Loading customer records…</p> : customerData.tickets.length === 0 ? (
              <div className="customer-empty-state"><span>＋</span><strong>No support tickets</strong><p>Tickets associated with this customer will appear here.</p></div>
            ) : customerData.tickets.map((ticket) => (
              <article key={ticket.id} className="customer-record-card">
                <div className="customer-record-top"><strong>{ticket.title}</strong><span className="customer-record-status">{ticket.status.replaceAll('_', ' ')}</span></div>
                <p>{ticket.department.replaceAll('_', ' ')} · {ticket.priority} priority</p>
                <small>Created {formatDate(ticket.created_at)}{ticket.sla_breach_at ? ` · SLA ${formatDate(ticket.sla_breach_at)}` : ''}</small>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'CRM' && (
          <section id="customer-360-crm" className="customer-tab-panel" role="tabpanel" aria-labelledby="customer-tab-crm">
            <div className="customer-section-heading">Ownership & pipeline</div>
            <div className="crm-field">
              <label htmlFor="customer-360-assigned-to">Assigned agent</label>
              <select id="customer-360-assigned-to" className="crm-select" value={crmAssignedTo} onChange={(event) => setCrmAssignedTo(event.target.value)}>
                <option value="">Unassigned</option>
                {workspaceUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role.replaceAll('_', ' ')}</option>)}
              </select>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-department">Department</label>
              <select id="customer-360-department" className="crm-select" value={crmDepartment} onChange={(event) => setCrmDepartment(event.target.value)}>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="SUPPORT">Support</option>
                <option value="SALES">Sales</option>
                <option value="MARKETING">Marketing</option>
                <option value="ACCOUNTS">Accounts</option>
                <option value="ENGINEERS">Engineering</option>
                <option value="BILLING">Billing</option>
              </select>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-status">Conversation status</label>
              <select id="customer-360-status" className="crm-select" value={crmStatus} onChange={(event) => setCrmStatus(event.target.value)}>
                {!statusOptions.includes(crmStatus) && crmStatus && <option value={crmStatus}>{crmStatus.replaceAll('_', ' ')}</option>}
                {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </select>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-deal-value">Potential value</label>
              <input id="customer-360-deal-value" type="text" inputMode="decimal" className="crm-input" value={crmDealValue} onChange={(event) => setCrmDealValue(event.target.value)} placeholder="e.g. ₹25,000" />
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-notes">Internal notes</label>
              <textarea id="customer-360-notes" className="crm-textarea" value={crmNotes} onChange={(event) => setCrmNotes(event.target.value)} placeholder="Add context for your team…" rows={5} />
              <span className="customer-field-hint">Visible to your team only.</span>
            </div>
          </section>
        )}
      </div>

      <footer className="customer-panel-footer">
        <button type="button" className="save-btn" onClick={saveCrmData} disabled={isSavingCrm || !activeConvObj} aria-busy={isSavingCrm}>
          {isSavingCrm ? 'Saving changes…' : 'Save customer details'}
        </button>
      </footer>
    </aside>
  );
}
