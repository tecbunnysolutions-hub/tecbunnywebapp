import React, { useState } from 'react';
import { Conversation } from './types';

const CUSTOMER_360_TABS = ['PROFILE', 'FINANCIALS', 'SERVICE', 'CRM'] as const;
type Customer360Tab = typeof CUSTOMER_360_TABS[number];

interface Customer360PanelProps {
  showCrm: boolean;
  setShowCrm: (show: boolean) => void;
  activeConvObj?: Conversation;
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

export function Customer360Panel({
  showCrm, setShowCrm, activeConvObj,
  crmName, setCrmName, crmStatus, setCrmStatus,
  crmAssignedTo, setCrmAssignedTo,
  crmDepartment, setCrmDepartment, crmAiActive, setCrmAiActive,
  crmDealValue, setCrmDealValue, crmActiveFlow, setCrmActiveFlow,
  isSavingCrm, saveCrmData
}: Customer360PanelProps) {
  const [activeTab, setActiveTab] = useState<Customer360Tab>('PROFILE');

  return (
    <div className={`crm-panel ${!showCrm ? 'hidden' : ''}`} style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="crm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Customer 360°</h3>
        <button className="mobile-toggle" type="button" onClick={() => setShowCrm(false)} aria-label="Close customer profile panel">Close</button>
      </div>

      <div role="tablist" aria-label="Customer 360 sections" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {CUSTOMER_360_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`customer-360-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? '#3b82f6' : '#94a3b8',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="crm-body" style={{ flexGrow: 1, overflowY: 'auto' }}>
        {activeTab === 'PROFILE' && (
          <div id="customer-360-profile" role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="crm-field">
              <label id="ai-autopilot-label">AI Autopilot</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={crmAiActive} onChange={e => setCrmAiActive(e.target.checked)} style={{ width: '18px', height: '18px' }} aria-labelledby="ai-autopilot-label" />
                <span style={{ color: crmAiActive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{crmAiActive ? 'Active' : 'Paused'}</span>
              </label>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-name">Name</label>
              <input id="customer-360-name" type="text" className="crm-input" value={crmName} onChange={e => setCrmName(e.target.value)} placeholder="E.g. John Doe"/>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-phone">Phone Number</label>
              <input id="customer-360-phone" type="text" className="crm-input" value={activeConvObj?.sender_number || ''} disabled style={{ opacity: 0.7 }}/>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-active-flow">Active Flow</label>
              <select id="customer-360-active-flow" className="crm-select" value={crmActiveFlow} onChange={e => setCrmActiveFlow(e.target.value)}>
                <option value="">-- No Flow --</option>
                <option value="Property Inquiry Flow">Property Inquiry Flow</option>
                <option value="Support Intake Flow">Support Intake Flow</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'CRM' && (
          <div id="customer-360-crm" role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="crm-field">
              <label htmlFor="customer-360-assigned-to">Assign To Agent</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input id="customer-360-assigned-to" type="text" className="crm-input" value={crmAssignedTo} onChange={e => setCrmAssignedTo(e.target.value)} placeholder="e.g. Alice" style={{ flex: 1 }} />
                <button type="button" style={{ padding: '0 8px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Assign</button>
              </div>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-department">Agent Mode / Department</label>
              <select id="customer-360-department" className="crm-select" value={crmDepartment} onChange={e => setCrmDepartment(e.target.value)}>
                <option value="UNASSIGNED">Unassigned Mode</option>
                <option value="SUPPORT">Support</option>
                <option value="SALES">Sales</option>
                <option value="MARKETING">Marketing</option>
                <option value="BILLING">Billing</option>
              </select>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-status">Pipeline Stage</label>
              <select id="customer-360-status" className="crm-select" value={crmStatus} onChange={e => setCrmStatus(e.target.value)}>
                <option value="NEW">New</option>
                <option value="LEAD">Lead</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <div className="crm-field">
              <label htmlFor="customer-360-deal-value">Deal Value</label>
              <input id="customer-360-deal-value" type="text" className="crm-input" value={crmDealValue} onChange={e => setCrmDealValue(e.target.value)} placeholder="₹0.00"/>
            </div>

            {/* Slack Style Internal Notes */}
            <div className="crm-field" style={{ marginTop: '12px' }}>
              <label>Internal Notes & Mentions</label>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', minHeight: '120px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {/* Mockup for slack style notes */}
                  <div style={{ marginBottom: '4px' }}><strong style={{ color: '#3b82f6' }}>@Rahul</strong> Please check the invoice for this.</div>
                  <div style={{ marginBottom: '4px', color: '#94a3b8' }}>Rahul: Done, sent the new link.</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input type="text" placeholder="Type @ to mention..." style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }} />
                  <button type="button" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            </div>

            {/* Customer Timeline Placeholder */}
            <div className="crm-field" style={{ marginTop: '12px' }}>
               <label>Customer Timeline</label>
               <div style={{ padding: '8px', borderLeft: '2px solid #3b82f6', marginLeft: '4px' }}>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
                   <strong>Today, 10:00 AM</strong> - Visited Pricing Page
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
                   <strong>Yesterday</strong> - Completed Setup Flow
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                   <strong>Oct 12</strong> - Created Account
                 </div>
               </div>
            </div>

            {activeConvObj?.ad_source && (
              <div className="crm-field" style={{ marginTop: '0.5rem' }}>
                <label>Ad Source</label>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.75rem', borderRadius: '8px', color: '#60a5fa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> {activeConvObj.ad_source}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'FINANCIALS' && (
          <div id="customer-360-financials" role="tabpanel" style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
            <p>Fetching Orders & Invoices...</p>
            {/* Phase 3 placeholder */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button type="button" style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer' }}>Generate Quotation</button>
              <button type="button" style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer' }}>Send Payment Link</button>
            </div>
          </div>
        )}

        {activeTab === 'SERVICE' && (
          <div id="customer-360-service" role="tabpanel" style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
            <p>Fetching AMC & Tickets...</p>
            {/* Phase 3 placeholder */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button type="button" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}>Create Support Ticket</button>
              <button type="button" style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '4px', cursor: 'pointer' }}>Assign Engineer</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          type="button"
          className="save-btn"
          onClick={saveCrmData}
          disabled={isSavingCrm}
          aria-busy={isSavingCrm}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: isSavingCrm ? 0.7 : 1
          }}
        >
          {isSavingCrm ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
