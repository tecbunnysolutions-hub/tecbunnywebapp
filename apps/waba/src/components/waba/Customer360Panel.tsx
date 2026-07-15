import React, { useState } from 'react';
import { Conversation } from './types';

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
  crmNotes, setCrmNotes, crmAssignedTo, setCrmAssignedTo,
  crmDepartment, setCrmDepartment, crmAiActive, setCrmAiActive,
  crmDealValue, setCrmDealValue, crmActiveFlow, setCrmActiveFlow,
  isSavingCrm, saveCrmData
}: Customer360PanelProps) {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'FINANCIALS' | 'SERVICE' | 'CRM'>('PROFILE');

  return (
    <div className={`crm-panel ${!showCrm ? 'hidden' : ''}`} style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="crm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Customer 360°</h3>
        <button className="mobile-toggle" onClick={() => setShowCrm(false)}>✕</button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {['PROFILE', 'FINANCIALS', 'SERVICE', 'CRM'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="crm-field">
              <label>AI Autopilot</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={crmAiActive} onChange={e => setCrmAiActive(e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                <span style={{ color: crmAiActive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{crmAiActive ? 'Active' : 'Paused'}</span>
              </label>
            </div>
            <div className="crm-field">
              <label>Name</label>
              <input type="text" className="crm-input" value={crmName} onChange={e => setCrmName(e.target.value)} placeholder="E.g. John Doe"/>
            </div>
            <div className="crm-field">
              <label>Phone Number</label>
              <input type="text" className="crm-input" value={activeConvObj?.sender_number || ''} disabled style={{ opacity: 0.7 }}/>
            </div>
            <div className="crm-field">
              <label>Active Flow</label>
              <select className="crm-select" value={crmActiveFlow} onChange={e => setCrmActiveFlow(e.target.value)}>
                <option value="">-- No Flow --</option>
                <option value="Property Inquiry Flow">Property Inquiry Flow</option>
                <option value="Support Intake Flow">Support Intake Flow</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'CRM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="crm-field">
              <label>Assign To Agent</label>
              <input type="text" className="crm-input" value={crmAssignedTo} onChange={e => setCrmAssignedTo(e.target.value)} placeholder="e.g. Alice" />
            </div>
            <div className="crm-field">
              <label>Agent Mode / Department</label>
              <select className="crm-select" value={crmDepartment} onChange={e => setCrmDepartment(e.target.value)}>
                <option value="UNASSIGNED">Unassigned Mode</option>
                <option value="SUPPORT">Support</option>
                <option value="SALES">Sales</option>
                <option value="MARKETING">Marketing</option>
                <option value="BILLING">Billing</option>
              </select>
            </div>
            <div className="crm-field">
              <label>Pipeline Stage</label>
              <select className="crm-select" value={crmStatus} onChange={e => setCrmStatus(e.target.value)}>
                <option value="NEW">New</option>
                <option value="LEAD">Lead</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <div className="crm-field">
              <label>Deal Value</label>
              <input type="text" className="crm-input" value={crmDealValue} onChange={e => setCrmDealValue(e.target.value)} placeholder="₹0.00"/>
            </div>
            <div className="crm-field">
              <label>Internal Notes</label>
              <textarea className="crm-textarea" value={crmNotes} onChange={e => setCrmNotes(e.target.value)} placeholder="Private notes about this lead..."/>
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
          <div style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
            <p>Fetching Orders & Invoices...</p>
            {/* Phase 3 placeholder */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer' }}>Generate Quotation</button>
              <button style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer' }}>Send Payment Link</button>
            </div>
          </div>
        )}

        {activeTab === 'SERVICE' && (
          <div style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
            <p>Fetching AMC & Tickets...</p>
            {/* Phase 3 placeholder */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}>Create Support Ticket</button>
              <button style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '4px', cursor: 'pointer' }}>Assign Engineer</button>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          className="save-btn" 
          onClick={saveCrmData} 
          disabled={isSavingCrm}
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
