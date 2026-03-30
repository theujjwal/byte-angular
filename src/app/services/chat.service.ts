import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Chat, Message, SendMessageResponse } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);

  chats         = signal<Chat[]>([]);
  activeChatId  = signal<string | null>(null);
  messages      = signal<Message[]>([]);
  loading       = signal(false);
  currentMode   = signal<'DSA' | 'LLD' | 'HLD' | 'WORK'>('DSA');

  setChats(chats: Chat[]): void { this.chats.set(chats); }

  async loadChat(chatId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.get<{ chat: Chat; messages: Message[] }>(`/chats/${chatId}`);
      this.activeChatId.set(chatId);
      this.currentMode.set(data.chat.mode as any);
      this.messages.set(data.messages);
    } finally { this.loading.set(false); }
  }

  async sendMessage(message: string): Promise<SendMessageResponse> {
    this.loading.set(true);
    try {
      const res = await this.api.post<SendMessageResponse>('/chat', {
        chat_id: this.activeChatId(),
        message,
        mode: this.currentMode(),
      });

      // Set active chat if new
      if (!this.activeChatId()) {
        this.activeChatId.set(res.chat_id);
        await this.refreshChats();
      } else {
        // Update last message in list
        this.chats.update(chats =>
          chats.map(c => c.id === res.chat_id ? { ...c, last_message: message.slice(0, 80) } : c)
        );
      }

      // Add messages to local state
      this.messages.update(msgs => [
        ...msgs,
        { role: 'user', content: message },
        { role: 'assistant', content: res.reply }
      ]);

      return res;
    } finally {
      this.loading.set(false);
    }
  }

  async newChat(mode: 'DSA' | 'LLD' | 'HLD' | 'WORK'): Promise<void> {
    this.currentMode.set(mode);
    this.activeChatId.set(null);
    this.messages.set([]);
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.api.delete(`/chats/${chatId}`);
    this.chats.update(chats => chats.filter(c => c.id !== chatId));
    if (this.activeChatId() === chatId) {
      this.activeChatId.set(null);
      this.messages.set([]);
    }
  }

  async refreshChats(): Promise<void> {
    const data = await this.api.get<{ chats: Chat[] }>('/chats');
    this.chats.set(data.chats);
  }
}
