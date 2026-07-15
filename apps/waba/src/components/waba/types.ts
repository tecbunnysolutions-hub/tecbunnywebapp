export type Message = {
  id: string;
  sender_number: string;
  direction: 'INBOUND' | 'OUTBOUND';
  message_content: string;
  timestamp: string;
  status: string;
  media_url?: string;
  media_type?: string;
  sent_by?: 'AI' | 'ADMIN';
};

export type Conversation = {
  id: number;
  sender_number: string;
  last_interaction_timestamp: string;
  contact_name?: string;
  status: string;
  tags: string[];
  notes?: string;
  ad_source?: string;
  assigned_to?: string;
  department?: string;
  ai_active?: boolean;
  active_flow?: string;
  deal_value?: string;
  messages?: Message[];
};

export type Template = {
  id: string;
  name: string;
  content: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};
