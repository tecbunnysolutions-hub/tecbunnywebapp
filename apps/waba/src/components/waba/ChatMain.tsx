import React, { useState, useRef, useEffect } from 'react';
import { Message, Conversation, Template } from './types';

interface ChatMainProps {
  activeConversation: string;
  activeConvObj?: Conversation;
  displayName: string;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showCrm: boolean;
  setShowCrm: (show: boolean) => void;
  isOutsideWindow: boolean;
  templates: Template[];
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  isUploading: boolean;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => Promise<void>;
}

export function ChatMain({
  activeConversation, activeConvObj, displayName, messages, messagesEndRef,
  showSidebar, setShowSidebar, showCrm, setShowCrm, isOutsideWindow,
  templates, selectedTemplate, setSelectedTemplate, inputText, setInputText,
  isUploading, handleSendMessage, handleFileUpload
}: ChatMainProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  // Slash Command State
  const [showCommands, setShowCommands] = useState(false);
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  
  const COMMANDS = [
    { cmd: '/summary', desc: 'Summarize the conversation' },
    { cmd: '/customer', desc: 'Display customer profile summary' },
    { cmd: '/orders', desc: 'List recent orders' },
    { cmd: '/invoice', desc: 'Show unpaid invoices' },
    { cmd: '/tickets', desc: 'List open service tickets' },
    { cmd: '/recommend', desc: 'Suggest the next best action' },
    { cmd: '/reply', desc: 'Generate a professional reply draft' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (val === '/') {
      setShowCommands(true);
    } else if (!val.startsWith('/')) {
      setShowCommands(false);
    }
  };

  const executeCommand = async (cmd: string) => {
    setShowCommands(false);
    setInputText("");
    setIsCopilotThinking(true);
    
    try {
      const res = await fetch('/api/copilot/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation,
          command: cmd
        })
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        if (result.data.type === 'INPUT_REPLACEMENT') {
          setInputText(result.data.response);
        } else {
          setSystemMessages(prev => [...prev, {
            id: 'sys_' + Date.now(),
            sender_number: activeConversation,
            direction: 'INBOUND', // Or OUTBOUND to align right? Inbound aligns left which is good for system.
            message_content: result.data.response,
            timestamp: new Date().toISOString(),
            status: 'SYSTEM',
            sent_by: 'AI'
          }]);
        }
      } else {
        alert('Copilot Error: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to execute AI command.');
    }
    setIsCopilotThinking(false);
  };

  const allMessages = [...messages, ...systemMessages].filter(m => m.sender_number === activeConversation).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="chat-main">
      <div className="chat-header">
        <button className="mobile-toggle" onClick={() => setShowSidebar(!showSidebar)} style={{ marginRight: '1rem' }}>☰</button>
        <h3 style={{ flexGrow: 1 }}>{displayName}</h3>
        <button className="mobile-toggle" onClick={() => setShowCrm(!showCrm)}>👤</button>
      </div>
      <div className="messages-container">
        {allMessages.map(msg => {
          if (msg.status === 'SYSTEM') {
            return (
              <div key={msg.id} style={{ margin: '12px 0', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#3b82f6', fontWeight: 'bold' }}>
                  <span>✨</span> AI Copilot
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message_content}</div>
              </div>
            );
          }

          const isLocation = msg.message_content && msg.message_content.startsWith('📍 Location: https://maps.google.com/?q=');
          let locationCoords = '', locationAddress = '', locationUrl = '';
          if (isLocation) {
            const parts = msg.message_content.split('?q=');
            if (parts.length > 1) {
              const coordsAndAddress = parts[1].split(' ');
              locationCoords = coordsAndAddress[0];
              locationAddress = coordsAndAddress.slice(1).join(' ');
              locationUrl = msg.message_content.replace('📍 Location: ', '').split(' ')[0];
            }
          }

          return (
          <div key={msg.id} className={`message-wrapper ${msg.direction.toLowerCase()}`}>
            <div className="message-bubble">
              {msg.media_url && msg.media_type === 'IMAGE' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={msg.media_url} alt="Attached image" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
              )}
              {msg.media_url && msg.media_type === 'VIDEO' && (
                <video src={msg.media_url} controls style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
              )}
              {msg.media_url && msg.media_type === 'AUDIO' && (
                <audio src={msg.media_url} controls style={{ maxWidth: '100%', marginBottom: '8px' }} />
              )}
              {msg.media_url && msg.media_type === 'DOCUMENT' && (
                <a href={msg.media_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '8px', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
                  <span>📄</span> View Document
                </a>
              )}
              
              {isLocation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                  <iframe width="100%" height="150" style={{ borderRadius: '8px', border: 0, backgroundColor: '#f0f0f0' }} src={`https://maps.google.com/maps?q=${locationCoords}&z=15&output=embed`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
                  <a href={locationUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007AFF', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span> Open in Maps {locationAddress}
                  </a>
                </div>
              ) : (
                msg.message_content && msg.message_content !== '[Media]' && <p>{msg.message_content}</p>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                {msg.direction === 'OUTBOUND' && msg.sent_by && (
                  <span style={{ fontSize: '0.7rem', color: msg.sent_by === 'AI' ? '#9ca3af' : '#60a5fa', marginRight: '4px' }}>
                    Sent by {msg.sent_by === 'AI' ? 'AI Agent' : 'Admin'}
                  </span>
                )}
                <span className="time" style={{ margin: 0 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.direction === 'OUTBOUND' && (
                  <span style={{ fontSize: '0.8rem', color: msg.status === 'READ' ? '#3b82f6' : '#94a3b8' }}>
                    {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : msg.status === 'FAILED' ? '❌' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ATTACHMENT TOOLBAR & INPUT */}
      <div style={{ position: 'relative' }}>
        {isUploading && <div style={{ position: 'absolute', top: '-30px', left: '20px', background: 'rgba(59,130,246,0.8)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>Uploading media...</div>}
        {isCopilotThinking && <div style={{ position: 'absolute', top: '-30px', left: '20px', background: 'rgba(16,185,129,0.8)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>✨ Copilot is thinking...</div>}
        
        {/* SLASH COMMAND PALETTE */}
        {showCommands && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px 8px 0 0', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ padding: '8px', fontSize: '0.8rem', color: '#94a3b8', borderBottom: '1px solid #334155' }}>AI Copilot Commands</div>
            {COMMANDS.filter(c => c.cmd.startsWith(inputText)).map(cmd => (
              <div 
                key={cmd.cmd}
                onClick={() => executeCommand(cmd.cmd)}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>{cmd.cmd}</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{cmd.desc}</span>
              </div>
            ))}
          </div>
        )}

        <form className="message-input-area" onSubmit={handleSendMessage} style={{ background: isOutsideWindow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.1)' }}>
          {isOutsideWindow ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ Outside 24-Hour Window (Template Required)</span>
              <select 
                className="crm-select" 
                style={{ border: '1px solid #ef4444', background: 'rgba(255,255,255,0.05)' }}
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  const t = templates.find(t => t.id === e.target.value);
                  if (t) setInputText(t.content);
                }}
              >
                <option value="">-- Select an Approved Template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="attachment-toolbar">
                <button type="button" onClick={() => fileInputRef.current?.click()} title="Send Image">📷</button>
                <button type="button" onClick={() => docInputRef.current?.click()} title="Send Document">📄</button>
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} accept="image/*,video/*" style={{ display: 'none' }} />
                <input type="file" ref={docInputRef} onChange={(e) => handleFileUpload(e, 'document')} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
              </div>

              <input 
                type="text" 
                placeholder="Type a message or use / for AI commands..." 
                value={inputText}
                onChange={handleInputChange}
                autoFocus
              />
            </>
          )}

          <button type="submit" disabled={(!inputText.trim() && !isUploading) || (isOutsideWindow && !selectedTemplate)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
