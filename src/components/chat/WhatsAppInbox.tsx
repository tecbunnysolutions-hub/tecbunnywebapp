'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Phone, MapPin, Search, Send, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppInboxProps {
  userId?: string; // If provided, filter to only this user's assigned chats
}

export function WhatsAppInbox({ userId }: WhatsAppInboxProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch conversations
    const fetchConversations = async () => {
      let query = supabase.from('whatsapp_conversations').select(`
        *,
        whatsapp_contacts(name, phone_number)
      `).order('last_message_at', { ascending: false });
      
      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data } = await query;
      if (data) setConversations(data);
    };
    fetchConversations();

    // 2. Subscribe to new conversations/updates
    const channel = supabase.channel('whatsapp_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_conversations' }, (payload) => {
        fetchConversations(); // Naive refresh for now
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' }, (payload) => {
        if (activeChat && payload.new.conversation_id === activeChat.id) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeChat]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [activeChat]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    // Optimistic UI update could go here. 
    // Real implementation would call a Next.js server action to send via Meta API.
    // For now, we just insert into DB, assuming a backend trigger or action handles the rest.
    const messageText = newMessage.trim();
    setNewMessage('');

    // In a full implementation, you'd call a server action here to hit the WhatsApp API directly.
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: activeChat.whatsapp_contacts.phone_number,
        message: messageText,
        conversationId: activeChat.id
      })
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full border border-border rounded-xl overflow-hidden bg-background">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" /> WhatsApp Inbox
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors flex flex-col gap-2 ${activeChat?.id === chat.id ? 'bg-muted/80' : ''}`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold">{chat.whatsapp_contacts?.name || 'Unknown Contact'}</span>
                <span className="text-[10px] text-muted-foreground uppercase bg-border px-2 py-0.5 rounded-full">
                  {chat.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" /> {chat.whatsapp_contacts?.phone_number}
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-muted/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold">{activeChat.whatsapp_contacts?.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {activeChat.whatsapp_contacts?.phone_number}
                  </p>
                </div>
              </div>
              {activeChat.location_data?.raw && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-border/50 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeChat.location_data.raw}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map(msg => {
                const isMine = msg.sender_type === 'agent' || msg.sender_type === 'bot';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMine ? 'self-end' : 'self-start'}`}>
                    <span className={`text-[10px] mb-1 opacity-70 ${isMine ? 'text-right' : 'text-left'}`}>
                      {msg.sender_type.toUpperCase()}
                    </span>
                    <div className={`p-3 rounded-2xl ${isMine ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-muted rounded-bl-none border border-border'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-border bg-muted/10 shrink-0 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-12 rounded-xl bg-background border border-border px-4 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <Button type="submit" className="h-12 w-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-0 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
