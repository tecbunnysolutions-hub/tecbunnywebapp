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
  showSidebar, setShowSidebar, currentUser, globalAiOverride, setGlobalAiOverride,
  loading, conversations, activeConversation, onSelectConversation
}: SidebarProps) {
  return (
    <div className={`glass-panel sidebar ${!showSidebar ? 'hidden' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Inbox <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>({currentUser.name})</span></h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setGlobalAiOverride(!globalAiOverride)}
            style={{ fontSize: '0.85rem', color: globalAiOverride ? '#ef4444' : '#10b981', textDecoration: 'none', background: globalAiOverride ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${globalAiOverride ? '#ef4444' : '#10b981'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Global AI Override (shuts down AI for all)"
          >
            {globalAiOverride ? '🛑 AI Overridden' : '🤖 AI Active'}
          </button>
          <a href="/templates" style={{ fontSize: '0.85rem', color: 'var(--template-color)', textDecoration: 'none', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>📑 Templates</a>
          <a href="/campaigns" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>🚀 Ads</a>
          <button className="mobile-toggle" onClick={() => setShowSidebar(false)}>✕</button>
        </div>
      </div>
      <div className="conversation-list">
        {loading ? (
          <div className="spinner"></div>
        ) : (
          conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`conversation-item ${activeConversation === conv.sender_number ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="avatar">{(conv.contact_name || conv.sender_number).substring(0, 2).toUpperCase()}</div>
              <div className="conversation-details">
                <span className="sender">{conv.contact_name || conv.sender_number}</span>
                <span className="last-msg">
                  {conv.messages?.[0]?.message_content || 'No messages'}
                </span>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
