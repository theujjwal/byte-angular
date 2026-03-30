import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../services/chat.service';
import { ProfileService } from '../../../../services/profile.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { SessionCompleteCardComponent } from '../session-complete-card/session-complete-card.component';
import { AuthService } from '../../../../services/auth.service';
import { SessionComplete } from '../../../../core/models';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [FormsModule, MessageBubbleComponent, SessionCompleteCardComponent],
  template: `
    <div class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
        <div style="font-size:18px">⚡</div>
        <div>
          <div class="header-title">BYTE</div>
          <div class="header-sub mono">Strict Mentor Mode</div>
        </div>
        <div class="mentor-badge">⚔ MENTOR</div>
      </div>

      <!-- Pattern tracker -->
      <div class="tracker-bar">
        <span class="tracker-label mono">SESSION PATTERNS:</span>
        @if (sessionPatterns().length === 0) {
          <span class="mono" style="font-size:10px;color:var(--muted)">None yet</span>
        }
        @for (p of sessionPatterns(); track p.type) {
          <span class="pattern-tag" [class]="p.type">{{ p.label }} ×{{ p.count }}</span>
        }
      </div>

      <!-- Messages -->
      <div class="chat-area" #chatArea>
        @if (chat.messages().length === 0 && !chat.activeChatId()) {
          <div class="empty-state">
            <div class="empty-logo">⚡</div>
            <div class="empty-title">Start a session</div>
            <div class="empty-sub mono">Pick a mode and bring your raw thinking.<br>No polished answers — just how you actually think.</div>
            <div class="empty-actions">
              <button class="byte-btn" (click)="quickStart('DSA')">🧩 DSA Problem</button>
              <button class="byte-btn" (click)="quickStart('LLD')">🏗 LLD Design</button>
              <button class="byte-btn" (click)="quickStart('HLD')">🌐 HLD Design</button>
              <button class="byte-btn" (click)="quickStart('WORK')">💼 Work Decision</button>
            </div>
          </div>
        }
        @for (msg of chat.messages(); track $index) {
          <app-message-bubble [message]="msg" [userName]="auth.user()?.name || 'You'" />
        }
        @if (chat.loading()) {
          <div class="typing-row">
            <div class="msg-avatar bot">⚡</div>
            <div class="typing"><span></span><span></span><span></span></div>
          </div>
        }
        @if (sessionComplete()) {
          <app-session-complete-card [sc]="sessionComplete()!" />
        }
      </div>

      <!-- Template -->
      <div class="template-section">
        <div class="template-toggle mono" (click)="templateOpen.set(!templateOpen())">
          {{ templateOpen() ? '▼' : '▶' }} THINKING TEMPLATE — click to expand &amp; copy
        </div>
        @if (templateOpen()) {
          <div class="template-box mono" (click)="copyTemplate()">{{ currentTemplate }}</div>
        }
      </div>

      <!-- Code Input -->
      @if (codeMode()) {
        <div class="code-input-wrap" style="margin: 0 16px 8px">
          <div class="code-input-bar">
            <select class="code-input-lang" [(ngModel)]="codeLang">
              <option value="python">python</option>
              <option value="javascript">javascript</option>
              <option value="typescript">typescript</option>
              <option value="java">java</option>
              <option value="cpp">cpp</option>
              <option value="text">text</option>
            </select>
            <button class="code-input-close" (click)="codeMode.set(false)">close</button>
          </div>
          <textarea
            [(ngModel)]="codeText"
            placeholder="Paste or write your code here..."
            (keydown.tab)="handleTab($event)"
          ></textarea>
        </div>
      }

      <!-- Input -->
      <div class="input-area">
        <button class="code-toggle" [class.active]="codeMode()" (click)="codeMode.set(!codeMode())" title="Attach code">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
        </button>
        <div class="input-wrap" [class.focused]="focused">
          <textarea
            [(ngModel)]="inputText"
            (keydown)="handleKey($event)"
            (focus)="focused=true"
            (blur)="focused=false"
            (input)="autoResize($event)"
            rows="1"
            placeholder="Bring your raw thinking..."
          ></textarea>
        </div>
        <button class="send-btn" (click)="send()" [disabled]="chat.loading() || !inputText.trim() && !codeText.trim()">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .chat-panel { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .chat-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
    .header-title { font-size: 15px; font-weight: 700; }
    .header-sub { font-size: 10px; color: var(--muted); }
    .mentor-badge { margin-left: auto; font-size: 9px; font-family: var(--font-mono); color: var(--accent2); border: 1px solid var(--accent2); padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; animation: glow 2s ease-in-out infinite; }
    .tracker-bar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 6px 16px; display: flex; gap: 8px; align-items: center; flex-shrink: 0; overflow-x: auto; scrollbar-width: none; }
    .tracker-bar::-webkit-scrollbar { display: none; }
    .tracker-label { font-size: 10px; color: var(--muted); white-space: nowrap; }
    .chat-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
    .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px; text-align: center; }
    .empty-logo { font-size: 48px; opacity: .3; }
    .empty-title { font-size: 22px; font-weight: 800; color: var(--muted); }
    .empty-sub { font-size: 13px; color: var(--muted); line-height: 1.8; }
    .empty-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
    .typing-row { display: flex; gap: 8px; }
    .msg-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; align-self: flex-end; }
    .msg-avatar.bot { background: linear-gradient(135deg,#78350f,var(--accent)); }
    .typing { display: flex; align-items: center; gap: 5px; padding: 10px 13px; background: var(--bot-bubble); border: 1px solid var(--border); border-radius: 14px; border-bottom-left-radius: 3px; }
    .typing span { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: .2s; }
    .typing span:nth-child(3) { animation-delay: .4s; }
    .template-section { padding: 8px 16px; border-top: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
    .template-toggle { font-size: 10px; color: var(--accent); cursor: pointer; user-select: none; }
    .template-box { margin-top: 6px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; font-size: 11px; color: var(--muted); line-height: 1.8; cursor: pointer; white-space: pre-wrap; max-height: 120px; overflow-y: auto; }
    .code-toggle { background: transparent; border: 1px solid var(--border); border-radius: 8px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; flex-shrink: 0; }
    .code-toggle:hover { color: var(--text); border-color: var(--text); }
    .code-toggle.active { color: var(--accent); border-color: var(--accent); background: rgba(245,158,11,.08); }
    .input-area { padding: 12px 16px; border-top: 1px solid var(--border); background: var(--surface); display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
    .input-wrap { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 8px 11px; transition: border-color .2s; }
    .input-wrap.focused { border-color: var(--accent); }
    textarea { width: 100%; background: transparent; border: none; outline: none; color: var(--text); font-family: var(--font-sans); font-size: 14px; resize: none; max-height: 100px; line-height: 1.6; }
    textarea::placeholder { color: var(--muted); }
    .send-btn { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg,#78350f,var(--accent)); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform .15s; }
    .send-btn:hover { transform: scale(1.05); }
    .send-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }
  `]
})
export class ChatWindowComponent implements AfterViewChecked {
  chat    = inject(ChatService);
  auth    = inject(AuthService);
  private profile = inject(ProfileService);

  @ViewChild('chatArea') chatAreaRef!: ElementRef;

  inputText      = '';
  codeText       = '';
  codeLang       = 'python';
  focused        = false;
  codeMode       = signal(false);
  templateOpen   = signal(false);
  sessionComplete = signal<SessionComplete | null>(null);
  sessionPatterns = signal<{ type: string; label: string; count: number }[]>([]);

  private patternLabels: Record<string, string> = {
    assumption_errors: 'Assumption', incomplete_reasoning: 'Incomplete',
    surface_thinking: 'Surface', wrong_abstraction: 'Abstraction', blind_spots: 'Blind Spot'
  };

  private templates: Record<string, string> = {
    DSA:  `[DSA PROBLEM]\nProblem: <paste here>\n\n1. My understanding:\n2. My approach:\n3. Why this approach:\n4. Alternatives considered:\n5. Where I feel unsure:`,
    LLD:  `[LLD PROBLEM]\nProblem: <e.g. Design Parking Lot>\n\n1. My understanding:\n2. Entities/Classes:\n3. Relationships:\n4. Design patterns & why:\n5. Alternatives:\n6. Where I feel unsure:`,
    HLD:  `[HLD PROBLEM]\nSystem: <e.g. Design URL Shortener>\n\n1. Requirements:\n2. Architecture:\n3. Why this:\n4. Trade-offs:\n5. Failure points:\n6. Where I feel unsure:`,
    WORK: `[WORK DECISION]\nSituation: <describe>\n\n1. My understanding:\n2. Proposed decision:\n3. Why:\n4. Alternatives:\n5. Risks:\n6. Where I feel unsure:`
  };

  get currentTemplate(): string { return this.templates[this.chat.currentMode()] || this.templates['DSA']; }

  ngAfterViewChecked(): void {
    if (this.chatAreaRef) {
      const el = this.chatAreaRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  quickStart(mode: 'DSA'|'LLD'|'HLD'|'WORK'): void {
    this.chat.newChat(mode);
    this.inputText = this.templates[mode];
  }

  handleKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  autoResize(e: Event): void {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  copyTemplate(): void {
    navigator.clipboard.writeText(this.currentTemplate);
  }

  handleTab(e: Event): void {
    e.preventDefault();
    const ta = e.target as HTMLTextAreaElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    this.codeText = this.codeText.substring(0, start) + '    ' + this.codeText.substring(end);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
  }

  async send(): Promise<void> {
    const hasCode = this.codeText.trim();
    let text = this.inputText.trim();
    if (hasCode) {
      const codeBlock = '```' + this.codeLang + '\n' + this.codeText.trim() + '\n```';
      text = text ? text + '\n\n' + codeBlock : codeBlock;
    }
    if (!text || this.chat.loading()) return;
    this.inputText = '';
    this.codeText = '';
    this.codeMode.set(false);
    this.sessionComplete.set(null);

    const res = await this.chat.sendMessage(text);

    // Handle patterns
    if (res.patterns?.length) {
      res.patterns.forEach(pt => {
        const existing = this.sessionPatterns().find(p => p.type === pt);
        if (existing) {
          this.sessionPatterns.update(ps => ps.map(p => p.type === pt ? { ...p, count: p.count + 1 } : p));
        } else {
          this.sessionPatterns.update(ps => [...ps, { type: pt, label: this.patternLabels[pt] || pt, count: 1 }]);
        }
      });
    }

    // Handle session complete
    if (res.session_complete) {
      this.sessionComplete.set(res.session_complete);
      this.sessionPatterns.set([]);
    }

    // Refresh profile
    if (res.progression) {
      this.profile.setProgression(res.progression);
    }
    await this.profile.refresh();
  }
}
