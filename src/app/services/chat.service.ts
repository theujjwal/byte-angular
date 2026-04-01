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
  streaming     = signal(false);
  error         = signal<string | null>(null);
  currentMode   = signal<'DSA' | 'LLD' | 'HLD' | 'WORK'>('DSA');

  private _streamTimer: ReturnType<typeof setTimeout> | null = null;

  setChats(chats: Chat[]): void { this.chats.set(chats); }

  async loadChat(chatId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.get<{ chat: Chat; messages: Message[] }>(`/chats/${chatId}`, { skipLoader: true });
      this.activeChatId.set(chatId);
      this.currentMode.set(data.chat.mode as any);
      this.messages.set(data.messages);
    } finally { this.loading.set(false); }
  }

  async sendMessage(message: string): Promise<SendMessageResponse | null> {
    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await this.api.post<SendMessageResponse>('/chat', {
        chat_id: this.activeChatId(),
        message,
        mode: this.currentMode(),
      }, { skipLoader: true });

      if (!this.activeChatId()) {
        this.activeChatId.set(res.chat_id);
        await this.refreshChats();
      } else {
        this.chats.update(chats =>
          chats.map(c => c.id === res.chat_id ? { ...c, last_message: message.slice(0, 80) } : c)
        );
      }

      await this.streamReply(res.reply);
      return res;
    } catch (e: any) {
      if (e?.status !== 401) {
        this.error.set(e?.error?.message || e?.message || 'Failed to send message. Try again.');
      }
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  private streamReply(fullText: string): Promise<void> {
    return new Promise(resolve => {
      // Split into tokens preserving whitespace/newlines for natural pacing
      const tokens = fullText.match(/\S+\s*/g) || [fullText];
      this.messages.update(msgs => [...msgs, { role: 'assistant', content: '' }]);
      this.streaming.set(true);
      let idx = 0;
      const tick = () => {
        // Reveal 2-4 words per tick for natural speed
        const chunk = tokens.slice(idx, idx + 3).join('');
        idx += 3;
        this.messages.update(msgs => {
          const updated = [...msgs];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
        if (idx < tokens.length) {
          this._streamTimer = setTimeout(tick, 30);
        } else {
          this._streamTimer = null;
          this.streaming.set(false);
          resolve();
        }
      };
      this._streamTimer = setTimeout(tick, 30);
    });
  }

  private cancelStream(): void {
    if (this._streamTimer) {
      clearTimeout(this._streamTimer);
      this._streamTimer = null;
      this.streaming.set(false);
    }
  }

  async newChat(mode: 'DSA' | 'LLD' | 'HLD' | 'WORK'): Promise<void> {
    this.cancelStream();
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
    const data = await this.api.get<{ chats: Chat[] }>('/chats', { skipLoader: true });
    this.chats.set(data.chats);
  }
}
