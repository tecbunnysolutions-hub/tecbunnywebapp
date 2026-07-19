"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

import { Sidebar } from '../components/waba/Sidebar';
import { ChatMain, type ChatNotice } from '../components/waba/ChatMain';
import { Customer360Panel } from '../components/waba/Customer360Panel';
import { Conversation, Message, Template, User } from '../components/waba/types';

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile Responsiveness States
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCrm, setShowCrm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatNotice, setChatNotice] = useState<ChatNotice | null>(null);

  // CRM Panel State
  const [crmName, setCrmName] = useState("");
  const [crmStatus, setCrmStatus] = useState("NEW");
  const [crmNotes, setCrmNotes] = useState("");
  const [crmAssignedTo, setCrmAssignedTo] = useState("");
  const [crmDepartment, setCrmDepartment] = useState("UNASSIGNED");
  const [crmAiActive, setCrmAiActive] = useState(true);
  const [crmDealValue, setCrmDealValue] = useState("");
  const [crmActiveFlow, setCrmActiveFlow] = useState("");
  const [isSavingCrm, setIsSavingCrm] = useState(false);
  const [globalAiOverride, setGlobalAiOverride] = useState(false);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(sender: string) {
    try {
      const res = await fetch(`/api/messages?conversation=${sender}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) { console.error(err); }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    // 1. Authenticate Agent
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.user) {
        router.push('/login');
      } else {
        setCurrentUser(data.user);
        fetchConversations();
        fetchTemplates();
      }
    });
  }, []);

  // 2. Realtime subscription: replace conversation polling (was setInterval 5 s)
  useEffect(() => {
    const supabaseRt = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const channel = supabaseRt
      .channel('waba-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Conversation' },
        () => { fetchConversations(); }
      )
      .subscribe();
    return () => { supabaseRt.removeChannel(channel); };

  }, []);

  // 3. Realtime subscription: replace message polling (was setInterval 3 s)
  useEffect(() => {
    if (!activeConversation) return;
    const supabaseRt = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const channel = supabaseRt
      .channel(`waba-messages-${activeConversation}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `sender_number=eq.${activeConversation}` },
        () => { fetchMessages(activeConversation); }
      )
      .subscribe();
    return () => { supabaseRt.removeChannel(channel); };

  }, [activeConversation]);

  useEffect(() => {
    if (activeConversation) {
      const activeObj = conversations.find(c => c.sender_number === activeConversation);
      if (activeObj) {
        setTimeout(() => {
          fetchMessages(activeConversation);
          setCrmName(activeObj.contact_name || "");
          setCrmStatus(activeObj.status || "NEW");
          setCrmNotes(activeObj.notes || "");
          setCrmAssignedTo(activeObj.assigned_to || "");
          setCrmDepartment(activeObj.department || "UNASSIGNED");
          setCrmAiActive(activeObj.ai_active !== false); // default true
          setCrmDealValue(activeObj.deal_value || "");
          setCrmActiveFlow(activeObj.active_flow || "");
        }, 0);
      }
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const textToSend = inputText;
    setInputText("");
    setChatNotice(null);

    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_number: activeConversation,
      direction: 'OUTBOUND',
      message_content: textToSend,
      timestamp: new Date().toISOString(),
      status: 'SENDING',
      sent_by: 'ADMIN'
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeConversation, text: textToSend })
      });
      if (res.ok) {
        fetchMessages(activeConversation);
      } else {
        const data = await res.json();
        // Remove the temporary message since it failed to send
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));

        if (data.is_ai_clarification) {
          setChatNotice({ tone: 'error', message: `AI Editor needs clarification: ${data.error || 'Please add more details to your draft.'}` });
          setInputText(textToSend); // Restore their draft so they don't have to retype it
        } else {
          setChatNotice({ tone: 'error', message: `Error sending message: ${data.error || 'Unknown error'}` });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setChatNotice({ tone: 'error', message: 'Message could not be sent. Please check the connection and try again.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || !e.target.files[0] || !activeConversation) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setChatNotice(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('to', activeConversation);
    formData.append('type', type);

    try {
      const res = await fetch('/api/messages/media', {
        method: 'POST',
        body: formData
      });
      if (res.ok) fetchMessages(activeConversation);
      else setChatNotice({ tone: 'error', message: 'Failed to send media. Please try again.' });
    } catch {
      setChatNotice({ tone: 'error', message: 'Upload error. Please check the file and try again.' });
    }
    setIsUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const saveCrmData = async () => {
    if (!activeConversation) return;
    setIsSavingCrm(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_number: activeConversation,
          contact_name: crmName,
          status: crmStatus,
          notes: crmNotes,
          assigned_to: crmAssignedTo,
          department: crmDepartment,
          ai_active: crmAiActive,
          deal_value: crmDealValue,
          active_flow: crmActiveFlow
        })
      });
      if (res.ok) fetchConversations();
    } catch (err) { console.error(err); }
    setIsSavingCrm(false);
    setShowCrm(false); // hide on mobile after save
  };

  if (!currentUser) {
    return <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner"></div></div>;
  }

  const activeConvObj = conversations.find(c => c.sender_number === activeConversation);
  const displayName = activeConvObj?.contact_name || activeConversation || '';

  // 24-Hour Guardrail Logic
  const lastInteraction = activeConvObj?.last_interaction_timestamp ? new Date(activeConvObj.last_interaction_timestamp) : new Date(0);
  const hoursSinceLastInteraction = (new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
  const isOutsideWindow = hoursSinceLastInteraction > 24;

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv.sender_number);
    setCrmName(conv.contact_name || "");
    setCrmStatus(conv.status || "NEW");
    setCrmNotes(conv.notes || "");
    setCrmAssignedTo(conv.assigned_to || "");
    setCrmDepartment(conv.department || "UNASSIGNED");
    setCrmAiActive(conv.ai_active !== false);
    setCrmDealValue(conv.deal_value || "");
    setCrmActiveFlow(conv.active_flow || "");
    setShowSidebar(false);
  };

  return (
    <div className="dashboard-container">
      <nav aria-label="WABA operations" style={{ position: 'fixed', top: '0.85rem', right: '1.5rem', zIndex: 20, display: 'flex', gap: '0.85rem', fontSize: '0.85rem' }}>
        <Link href="/analytics" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Analytics</Link>
        <Link href="/contacts" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Consent</Link>
        <Link href="/campaigns" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Campaigns</Link>
        <Link href="/templates" style={{ color: '#bfdbfe', textDecoration: 'none' }}>Templates</Link>
      </nav>
      {/* PANE 1: Sidebar / Conversation List */}
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        currentUser={currentUser}
        globalAiOverride={globalAiOverride}
        setGlobalAiOverride={setGlobalAiOverride}
        loading={loading}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
      />

      {/* PANE 2 & 3: Chat Area + CRM Details */}
      <div className="glass-panel chat-area">
        {activeConversation ? (
          <>
            {/* PANE 2: Chat Main */}
            <ChatMain
              activeConversation={activeConversation}
              activeConvObj={activeConvObj}
              displayName={displayName}
              messages={messages}
              messagesEndRef={messagesEndRef}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              showCrm={showCrm}
              setShowCrm={setShowCrm}
              isOutsideWindow={isOutsideWindow}
              templates={templates}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              inputText={inputText}
              setInputText={setInputText}
              isUploading={isUploading}
              notice={chatNotice}
              onNoticeClear={() => setChatNotice(null)}
              handleSendMessage={handleSendMessage}
              handleFileUpload={handleFileUpload}
            />

            {/* PANE 3: Customer 360 Details Panel */}
            <Customer360Panel
              showCrm={showCrm}
              setShowCrm={setShowCrm}
              activeConvObj={activeConvObj}
              crmName={crmName}
              setCrmName={setCrmName}
              crmStatus={crmStatus}
              setCrmStatus={setCrmStatus}
              crmNotes={crmNotes}
              setCrmNotes={setCrmNotes}
              crmAssignedTo={crmAssignedTo}
              setCrmAssignedTo={setCrmAssignedTo}
              crmDepartment={crmDepartment}
              setCrmDepartment={setCrmDepartment}
              crmAiActive={crmAiActive}
              setCrmAiActive={setCrmAiActive}
              crmDealValue={crmDealValue}
              setCrmDealValue={setCrmDealValue}
              crmActiveFlow={crmActiveFlow}
              setCrmActiveFlow={setCrmActiveFlow}
              isSavingCrm={isSavingCrm}
              saveCrmData={saveCrmData}
            />
          </>
        ) : (
          <div className="empty-state" style={{ width: '100%', position: 'relative' }}>
            <button className="mobile-toggle" type="button" onClick={() => setShowSidebar(true)} aria-label="Show inbox" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Inbox</button>
            <div className="empty-icon">💬</div>
            <h2>Select a conversation</h2>
            <p>Choose a contact from the sidebar to view your message history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
