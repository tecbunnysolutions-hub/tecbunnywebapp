import React, { useState, useRef } from 'react';
import { Message, Conversation, Template } from './types';

export type ChatNotice = { tone: 'error' | 'info'; message: string };

type InternalNote = {
  id: string;
  text: string;
  authorName?: string | null;
  createdAt: string;
};

function emitProductTelemetry(event: string, payload: Record<string, string | number | boolean | null | undefined>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tecbunny:product-telemetry', {
    detail: { event, payload, timestamp: new Date().toISOString() },
  }));
}

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
  notice?: ChatNotice | null;
  onNoticeClear?: () => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => Promise<void>;
}

export function ChatMain({
  activeConversation, activeConvObj, displayName, messages, messagesEndRef,
  showSidebar, setShowSidebar, showCrm, setShowCrm, isOutsideWindow,
  templates, selectedTemplate, setSelectedTemplate, inputText, setInputText,
  isUploading, notice, onNoticeClear, handleSendMessage, handleFileUpload
}: ChatMainProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Slash Command State
  const [showCommands, setShowCommands] = useState(false);
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [inlineNotice, setInlineNotice] = useState<{ tone: 'error' | 'info'; message: string } | null>(null);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const COMMANDS = [
    { cmd: '/summary', desc: 'Summarize the conversation' },
    { cmd: '/customer', desc: 'Display customer profile summary' },
    { cmd: '/orders', desc: 'List recent orders' },
    { cmd: '/invoice', desc: 'Show unpaid invoices' },
    { cmd: '/tickets', desc: 'List open service tickets' },
    { cmd: '/recommend', desc: 'Suggest the next best action' },
    { cmd: '/reply', desc: 'Generate a professional reply draft' }
  ];

  const CANNED_REPLIES = [
    {
      label: 'Acknowledge',
      text: 'Thanks for reaching out. I am checking this now and will update you shortly.',
    },
    {
      label: 'Need Details',
      text: 'Could you please share the order number, location, and any photos or screenshots related to this request?',
    },
    {
      label: 'Visit Follow-up',
      text: 'Our team can help with this. Please confirm your preferred visit date and time window.',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    setInlineNotice(null);
    onNoticeClear?.();
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
        setInlineNotice({ tone: 'error', message: `Copilot error: ${result.error || 'Unable to complete this command.'}` });
      }
    } catch (err) {
      console.error(err);
      setInlineNotice({ tone: 'error', message: 'Failed to execute AI command. Please try again.' });
    }
    setIsCopilotThinking(false);
  };

  const applyCannedReply = (text: string) => {
    setInputText(text);
    emitProductTelemetry('waba_canned_reply_inserted', { conversationId: activeConversation, draftLength: text.length });
    setInlineNotice({ tone: 'info', message: 'Canned reply inserted. Review and edit before sending.' });
    onNoticeClear?.();
  };

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      fetch(`/api/conversations/${encodeURIComponent(activeConversation)}/notes`)
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load notes')))
        .then((payload) => setInternalNotes(Array.isArray(payload.notes) ? payload.notes : []))
        .catch(() => setInternalNotes([]));
      setNoteDraft('');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeConversation]);

  const saveInternalNote = async () => {
    const text = noteDraft.trim();
    if (!text) return;
    setIsSavingNote(true);
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(activeConversation)}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to save note');
      setInternalNotes((notes) => [payload.note, ...notes].slice(0, 20));
      setNoteDraft('');
      setInlineNotice({ tone: 'info', message: 'Internal note saved for this conversation.' });
      onNoticeClear?.();
    } catch (error) {
      setInlineNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to save note' });
    } finally {
      setIsSavingNote(false);
    }
  };

  const allMessages = [...messages, ...systemMessages].filter(m => m.sender_number === activeConversation).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const visibleNotice = inlineNotice ?? notice;
  const lastInteractionAge = activeConvObj?.last_interaction_timestamp
    ? Math.max(0, Math.floor((Date.now() - new Date(activeConvObj.last_interaction_timestamp).getTime()) / 60000))
    : null;
  const slaTone = lastInteractionAge == null
    ? '#94a3b8'
    : lastInteractionAge >= 30
      ? '#fecaca'
      : lastInteractionAge >= 15
        ? '#fde68a'
        : '#bbf7d0';
  const slaLabel = lastInteractionAge == null
    ? 'SLA unavailable'
    : lastInteractionAge < 60
      ? `${lastInteractionAge}m since last touch`
      : `${Math.floor(lastInteractionAge / 60)}h ${lastInteractionAge % 60}m since last touch`;

  return (
    <div className="chat-main">
      <div className="chat-header">
        <button
          className="mobile-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
          style={{ marginRight: '1rem' }}
          aria-label={showSidebar ? 'Hide conversation list' : 'Show conversation list'}
          aria-expanded={showSidebar}
        >
          Menu
        </button>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0 }}>{displayName}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }} aria-label="Conversation assignment and SLA">
            <span style={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '999px', padding: '0.2rem 0.5rem', color: '#cbd5e1', fontSize: '0.72rem' }}>
              Owner: {activeConvObj?.assigned_to || 'Unassigned'}
            </span>
            <span style={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '999px', padding: '0.2rem 0.5rem', color: '#cbd5e1', fontSize: '0.72rem' }}>
              Dept: {activeConvObj?.department || 'General'}
            </span>
            <span style={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '999px', padding: '0.2rem 0.5rem', color: slaTone, fontSize: '0.72rem' }}>
              {slaLabel}
            </span>
          </div>
        </div>
        <button
          className="mobile-toggle"
          onClick={() => setShowCrm(!showCrm)}
          aria-label={showCrm ? 'Hide customer profile panel' : 'Show customer profile panel'}
          aria-expanded={showCrm}
        >
          Profile
        </button>
      </div>
      <div className="messages-container" role="log" aria-live="polite" aria-label="Conversation messages">
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

      <section aria-label="Internal conversation notes" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.16)', borderBottom: '1px solid rgba(148, 163, 184, 0.16)', padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.72)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Add an internal note for the next agent..."
            aria-label="Internal conversation note"
            disabled={isSavingNote}
            style={{ flex: 1, border: '1px solid rgba(148, 163, 184, 0.22)', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.55)', color: '#e2e8f0', padding: '0.65rem 0.8rem', outline: 'none' }}
          />
          <button
            type="button"
            onClick={saveInternalNote}
            disabled={!noteDraft.trim() || isSavingNote}
            style={{ border: '1px solid rgba(59, 130, 246, 0.35)', background: noteDraft.trim() && !isSavingNote ? 'rgba(59, 130, 246, 0.18)' : 'rgba(148, 163, 184, 0.12)', color: noteDraft.trim() && !isSavingNote ? '#bfdbfe' : '#94a3b8', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: noteDraft.trim() && !isSavingNote ? 'pointer' : 'not-allowed' }}
          >
            {isSavingNote ? 'Saving...' : 'Save Note'}
          </button>
        </div>
        {internalNotes.length > 0 && (
          <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {internalNotes.map((note) => (
              <span key={note.id} style={{ maxWidth: '100%', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '999px', background: 'rgba(2, 6, 23, 0.45)', color: '#cbd5e1', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{note.authorName ? ` · ${note.authorName}` : ''}: {note.text}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ATTACHMENT TOOLBAR & INPUT */}
      <div style={{ position: 'relative' }}>
        {visibleNotice && (
          <div
            role={visibleNotice.tone === 'error' ? 'alert' : 'status'}
            style={{
              margin: '0 1.5rem 0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: visibleNotice.tone === 'error' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
              background: visibleNotice.tone === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
              color: visibleNotice.tone === 'error' ? '#fecaca' : '#bfdbfe',
              fontSize: '0.85rem'
            }}
          >
            {visibleNotice.message}
          </div>
        )}
        {isUploading && <div role="status" aria-live="polite" style={{ position: 'absolute', top: '-30px', left: '20px', background: 'rgba(59,130,246,0.8)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>Uploading media...</div>}
        {isCopilotThinking && <div role="status" aria-live="polite" style={{ position: 'absolute', top: '-30px', left: '20px', background: 'rgba(16,185,129,0.8)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>Copilot is thinking...</div>}

        {!isOutsideWindow && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0 1.5rem 0.75rem' }} aria-label="Canned replies">
            {CANNED_REPLIES.map((reply) => (
              <button
                key={reply.label}
                type="button"
                onClick={() => applyCannedReply(reply.text)}
                style={{ border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(15, 23, 42, 0.75)', color: '#cbd5e1', borderRadius: '999px', padding: '0.4rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        {/* SLASH COMMAND PALETTE */}
        {showCommands && (
          <div id="waba-command-menu" style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px 8px 0 0', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ padding: '8px', fontSize: '0.8rem', color: '#94a3b8', borderBottom: '1px solid #334155' }}>AI Copilot Commands</div>
            {COMMANDS.filter(c => c.cmd.startsWith(inputText)).map(cmd => (
              <button
                type="button"
                key={cmd.cmd}
                onClick={() => executeCommand(cmd.cmd)}
                style={{ width: '100%', padding: '8px 12px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', background: 'transparent', border: 'none', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>{cmd.cmd}</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{cmd.desc}</span>
              </button>
            ))}
          </div>
        )}

        <form className="message-input-area" onSubmit={handleSendMessage} style={{ background: isOutsideWindow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.1)' }}>
          {isOutsideWindow ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ Outside 24-Hour Window (Template Required)</span>
              <select
                className="crm-select"
                aria-label="Approved message template"
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
                <button type="button" onClick={() => fileInputRef.current?.click()} title="Send image or video" aria-label="Attach image or video">Image</button>
                <button type="button" onClick={() => docInputRef.current?.click()} title="Send document" aria-label="Attach document">Document</button>
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} accept="image/*,video/*" style={{ display: 'none' }} aria-label="Image or video upload" />
                <input type="file" ref={docInputRef} onChange={(e) => handleFileUpload(e, 'document')} accept=".pdf,.doc,.docx" style={{ display: 'none' }} aria-label="Document upload" />
              </div>

              <input
                type="text"
                placeholder="Type a message or use / for AI commands..."
                value={inputText}
                onChange={handleInputChange}
                autoFocus
                aria-label="Message text"
                aria-controls={showCommands ? 'waba-command-menu' : undefined}
              />
            </>
          )}

          <button type="submit" disabled={(!inputText.trim() && !isUploading) || (isOutsideWindow && !selectedTemplate)} aria-label="Send message">
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
