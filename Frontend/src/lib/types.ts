export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface ChatChannel {
  id: number;
  name: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  channel: number;
  sender: number;
  sender_username: string;
  text: string;
  attachment?: string | null;
  created_at: string;
}

export interface WsChatMessage {
  id: number;
  text: string;
  sender: { id: number; username: string };
  created_at: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
