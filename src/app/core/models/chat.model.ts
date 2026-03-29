export interface Chat {
  id: string;
  title: string;
  mode: 'DSA' | 'LLD' | 'HLD' | 'WORK';
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface SendMessageResponse {
  reply: string;
  chat_id: string;
  patterns: string[];
  user_id: string;
  progression: any;
  session_complete?: any;
}
