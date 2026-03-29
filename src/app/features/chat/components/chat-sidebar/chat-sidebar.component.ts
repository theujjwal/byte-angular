import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { ChatService } from '../../../../services/chat.service';
import { Chat } from '../../../../core/models';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-logo">⚡</div>
          <div class="brand-name">BYTE</div>
        </div>
        <button class="new-chat-btn" (click)="newChat()">＋ New Chat</button>
        <select class="mode-select" [(ngModel)]="selectedMode" [ngModelOptions]="{standalone:true}">
          <option value="DSA">🧩 DSA Problem</option>
          <option value="LLD">🏗 LLD Design</option>
          <option value="HLD">🌐 HLD Design</option>
          <option value="WORK">💼 Work Decision</option>
        </select>
      </div>

      <div class="chat-list">
        <div class="list-label mono">RECENT CHATS</div>
        @if (chat.chats().length === 0) {
          <div class="empty-list mono">No chats yet</div>
        }
        @for (c of chat.chats(); track c.id) {
          <div class="chat-item" [class.active]="chat.activeChatId() === c.id" (click)="loadChat(c)">
            <span class="byte-badge" [class]="c.mode.toLowerCase()">{{ c.mode }}</span>
            <div class="chat-title">{{ c.title }}</div>
            <div class="chat-preview mono">{{ c.last_message || 'Empty chat' }}</div>
            <button class="del-btn" (click)="deleteChat($event, c.id)">✕</button>
          </div>
        }
      </div>

      <div class="sidebar-footer">
        <a routerLink="/dashboard" class="dashboard-link mono">📊 Dashboard</a>
        <button class="signout-btn mono" (click)="signOut()">Sign out</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .sidebar { height: 100%; display: flex; flex-direction: column; background: var(--surface); border-right: 1px solid var(--border); }
    .sidebar-header { padding: 14px 12px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .brand-logo { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#78350f,var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .brand-name { font-size: 14px; font-weight: 800; letter-spacing: 2px; background: linear-gradient(90deg,var(--accent),#fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .new-chat-btn { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-family: var(--font-sans); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
    .new-chat-btn:hover { border-color: var(--accent); color: var(--accent); }
    .mode-select { width: 100%; margin-top: 8px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-family: var(--font-mono); font-size: 10px; cursor: pointer; outline: none; }
    .chat-list { flex: 1; overflow-y: auto; padding: 8px; }
    .list-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; padding: 4px 6px 6px; }
    .empty-list { font-size: 11px; color: var(--muted); padding: 8px 6px; }
    .chat-item { padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all .15s; margin-bottom: 2px; position: relative; }
    .chat-item:hover { background: var(--surface2); }
    .chat-item.active { background: var(--surface3); border: 1px solid var(--border); }
    .chat-title { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 3px 0; }
    .chat-item.active .chat-title { color: var(--accent); }
    .chat-preview { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .del-btn { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); opacity: 0; background: var(--accent2); border: none; color: white; width: 18px; height: 18px; border-radius: 4px; cursor: pointer; font-size: 10px; }
    .chat-item:hover .del-btn { opacity: 1; }
    .sidebar-footer { padding: 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; }
    .dashboard-link { font-size: 11px; color: var(--muted); text-decoration: none; padding: 6px; border-radius: 6px; border: 1px solid var(--border); text-align: center; transition: all .2s; }
    .dashboard-link:hover { border-color: var(--accent); color: var(--accent); }
    .signout-btn { width: 100%; padding: 6px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 9px; cursor: pointer; transition: all .2s; letter-spacing: .5px; }
    .signout-btn:hover { border-color: var(--accent2); color: var(--accent2); }
  `]
})
export class ChatSidebarComponent {
  chat   = inject(ChatService);
  private auth   = inject(AuthService);
  private router = inject(Router);

  selectedMode: 'DSA'|'LLD'|'HLD'|'WORK' = 'DSA';

  async newChat(): Promise<void> {
    await this.chat.newChat(this.selectedMode);
    this.router.navigate(['/chat']);
  }

  async loadChat(c: Chat): Promise<void> {
    await this.chat.loadChat(c.id);
    this.router.navigate(['/chat', c.id]);
  }

  async deleteChat(e: Event, id: string): Promise<void> {
    e.stopPropagation();
    await this.chat.deleteChat(id);
  }

  signOut(): void { this.auth.signOut(); }
}
