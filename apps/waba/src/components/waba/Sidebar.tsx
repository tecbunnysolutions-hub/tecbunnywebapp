import React from 'react';
import { Conversation, User } from './types';

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  currentUser: User;
  globalAiOverride: boolean;
  setGlobalAiOverride: (val: boolean) => void;
  loading: boolean;
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (conv: Conversation) => void;
}

export function Sidebar({
  showSidebar, setShowSidebar, currentUser, globalAiOverride,
  loading, conversations, activeConversation, onSelectConversation
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState('queue'); // 'queue' or 'team'
  const [activeQueue, setActiveQueue] = React.useState('unassigned'); // unassigned, assigned, waiting, urgent, vip, resolved, closed
  const [activeTeam, setActiveTeam] = React.useState('sales'); // sales, support, accounts, marketing, engineers

  // Filter conversations based on selected queue or team
  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'queue') {
      switch(activeQueue) {
        case 'unassigned': return !conv.assigned_to;
        case 'assigned': return !!conv.assigned_to && conv.status !== 'RESOLVED' && conv.status !== 'CLOSED';
        case 'waiting': return conv.status === 'PENDING_HUMAN_AGENT';
        case 'urgent': return conv.status === 'URGENT';
        case 'vip': return conv.deal_value && parseInt(conv.deal_value) > 100000;
        case 'resolved': return conv.status === 'RESOLVED';
        case 'closed': return conv.status === 'CLOSED';
        default: return true;
      }
    } else {
      switch(activeTeam) {
        case 'sales': return conv.department === 'SALES';
        case 'support': return conv.department === 'SUPPORT';
        case 'accounts': return conv.department === 'ACCOUNTS';
        case 'marketing': return conv.department === 'MARKETING';
        case 'engineers': return conv.department === 'ENGINEERS';
        default: return true;
      }
    }
  });

  return (
    <div className={`glass-panel sidebar ${!showSidebar ? 'hidden' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Workspace <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>({currentUser.name})</span></h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="mobile-toggle" onClick={() => setShowSidebar(false)} aria-label="Close conversation list">Close</button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div role="tablist" aria-label="Conversation workspace view" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'queue'}
            onClick={() => setActiveTab('queue')}
            style={{ flex: 1, padding: '8px', background: activeTab === 'queue' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeTab === 'queue' ? '2px solid var(--accent)' : 'none' }}
          >
            Queues
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'team'}
            onClick={() => setActiveTab('team')}
            style={{ flex: 1, padding: '8px', background: activeTab === 'team' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeTab === 'team' ? '2px solid var(--accent)' : 'none' }}
          >
            Team View
          </button>
        </div>

        {/* Sub-navigation */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
          {activeTab === 'queue' ? (
            ['unassigned', 'assigned', 'waiting', 'urgent', 'vip'].map(q => (
              <button
                key={q}
                type="button"
                aria-pressed={activeQueue === q}
                onClick={() => setActiveQueue(q)}
                style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: activeQueue === q ? 'var(--accent)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))
          ) : (
            ['sales', 'support', 'accounts', 'engineers'].map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={activeTeam === t}
                onClick={() => setActiveTeam(t)}
                style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: activeTeam === t ? 'var(--accent)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="conversation-list" style={{ marginTop: '12px' }}>
        {loading ? (
          <div className="spinner"></div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No chats in this view</div>
        ) : (
          filteredConversations.map(conv => (
            <button
              type="button"
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.sender_number ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
              aria-current={activeConversation === conv.sender_number ? 'true' : undefined}
              aria-label={`Open conversation with ${conv.contact_name || conv.sender_number}`}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', color: 'inherit' }}
            >
              <div className="avatar">{(conv.contact_name || conv.sender_number).substring(0, 2).toUpperCase()}</div>
              <div className="conversation-details">
                <span className="sender">{conv.contact_name || conv.sender_number}</span>
                <span className="last-msg">
                  {conv.messages?.[0]?.message_content || 'No messages'}
                </span>

                {/* SLA / Countdown mockup */}
                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: conv.status === 'URGENT' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                  ⏳ SLA: {conv.status === 'URGENT' ? '15m' : '2h 10m'} left
                </div>

                <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                  {conv.ai_active !== false && !globalAiOverride ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--ai-accent)', border: '1px solid var(--ai-accent)', padding: '2px 4px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)' }}>AI Active</span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 4px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)' }}>{globalAiOverride ? 'AI Overridden' : 'Paused (Human)'}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {conv.status && (
                    <span className={`crm-status-badge status-${conv.status}`}>
                      {conv.status}
                    </span>
                  )}
                  {conv.department && conv.department !== 'UNASSIGNED' && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>🏢 {conv.department}</span>
                  )}
                  {conv.assigned_to && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>👤 {conv.assigned_to}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
