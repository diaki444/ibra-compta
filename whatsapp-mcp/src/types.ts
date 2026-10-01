export interface StoredMessage {
  id: string;
  chatJid: string;
  fromMe: boolean;
  senderName?: string;
  text: string;
  timestamp: number; // unix seconds
}

export interface StoredContact {
  jid: string;
  name?: string;
  notify?: string; // push name as seen in WhatsApp
}

export interface ChatSummary {
  jid: string;
  name: string;
  isGroup: boolean;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
}
