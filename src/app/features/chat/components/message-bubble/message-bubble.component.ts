import { Component, Input, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Message } from '../../../../core/models';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  template: `
    <div class="msg-row fade-up" [class.user]="message.role === 'user'">
      <div class="msg-avatar" [class.bot]="message.role === 'assistant'" [class.user]="message.role === 'user'">
        {{ message.role === 'assistant' ? '⚡' : '🧑' }}
      </div>
      <div class="msg-col">
        <div class="sender-name mono">{{ message.role === 'assistant' ? 'BYTE — STRICT MENTOR' : userName }}</div>
        <div class="bubble" [class.bot]="message.role === 'assistant'" [class.user]="message.role === 'user'">
          <div [innerHTML]="formattedContent"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .msg-row { display: flex; gap: 8px; animation: fadeUp .3s ease; }
    .msg-row.user { flex-direction: row-reverse; }
    .msg-avatar {
      width: 30px; height: 30px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; font-size: 13px;
      flex-shrink: 0; align-self: flex-end;
    }
    .msg-avatar.bot { background: linear-gradient(135deg, #78350f, var(--accent)); }
    .msg-avatar.user { background: var(--user-bubble); border: 1px solid #2d5a2d; }
    .msg-col { display: flex; flex-direction: column; gap: 3px; max-width: 82%; }
    .msg-row.user .msg-col { align-items: flex-end; }
    .sender-name { font-size: 10px; color: var(--muted); letter-spacing: .5px; font-family: var(--font-mono); }
    .bubble { padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.75; }
    .bubble.bot { background: var(--bot-bubble); border: 1px solid var(--border); border-bottom-left-radius: 3px; }
    .bubble.user { background: var(--user-bubble); border: 1px solid #2d5a2d; border-bottom-right-radius: 3px; }
  `]
})
export class MessageBubbleComponent implements OnInit {
  @Input() message!: Message;
  @Input() userName = 'You';
  private sanitizer = inject(DomSanitizer);
  formattedContent!: SafeHtml;

  ngOnInit(): void {
    const html = this.message.role === 'assistant'
      ? this.formatBot(this.message.content)
      : this.esc(this.message.content).replace(/\n/g, '<br>');
    this.formattedContent = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  private formatBot(text: string): string {
    text = text.replace(/<session_complete>[\s\S]*?<\/session_complete>/g, '');
    text = text.replace(/<patterns>[\s\S]*?<\/patterns>/g, '');
    const dm: Record<string,string> = {'ASSUMPTION ERROR':'error','INCOMPLETE REASONING':'warn','SURFACE-LEVEL THINKING':'warn','WRONG ABSTRACTION':'warn','BLIND SPOT':'error'};
    for (const [t,c] of Object.entries(dm)) {
      text = text.replace(new RegExp(`❌ ${t}:[\\s\\S]*?(?=❌|✅|\\*\\*[^*]|$)`,'g'),
        m=>`<div class="diag-block"><div class="diag-header ${c}">❌ ${t}</div><div class="diag-body">${m.replace(`❌ ${t}:`,'').trim().replace(/\n/g,'<br>')}</div></div>`);
    }
    text = text.replace(/✅ ([^\n]+)/g,(_,b)=>`<div class="diag-block"><div class="diag-header good">✅ GOOD REASONING</div><div class="diag-body">${b.trim()}</div></div>`);
    text = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g,(_,lang,code)=>{
      const l = lang || 'text';
      return `<div class="byte-code-block"><div class="code-header"><span class="code-lang">${l}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.byte-code-block').querySelector('pre').textContent)">copy</button></div><pre class="byte-code">${this.highlight(this.esc(code.trim()),lang)}</pre></div>`;
    });
    text = text.replace(/`([^`]+)`/g,'<code class="byte-inline">$1</code>');
    text = text.replace(/\n/g,'<br>');
    return text;
  }

  private highlight(code: string, lang?: string): string {
    if (!lang || lang === 'text') return code;

    if (['python', 'py'].includes(lang)) {
      // strings (triple-quoted first, then single/double)
      code = code.replace(/(&#39;&#39;&#39;[\s\S]*?&#39;&#39;&#39;|&quot;&quot;&quot;[\s\S]*?&quot;&quot;&quot;)/g, '<span class="str">$1</span>');
      code = code.replace(/(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;)/g, '<span class="str">$1</span>');
      // comments
      code = code.replace(/(#[^\n<]*)/g, '<span class="cm">$1</span>');
      // decorators
      code = code.replace(/(@\w+)/g, '<span class="dec">$1</span>');
      // keywords
      code = code.replace(/\b(def|class|return|if|else|elif|for|while|in|not|and|or|import|from|True|False|None|with|as|try|except|finally|raise|yield|lambda|self|cls|pass|break|continue|assert|del|is|global|nonlocal|async|await)\b/g, '<span class="kw">$1</span>');
      // builtins / type hints
      code = code.replace(/\b(int|str|float|bool|list|dict|set|tuple|Optional|List|Dict|Set|Tuple|Any|Union|Type|Callable)\b/g, '<span class="type">$1</span>');
      // class names (PascalCase)
      code = code.replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, '<span class="cls">$1</span>');
      // function calls
      code = code.replace(/\b([a-z_]\w*)\b(?=\()/g, '<span class="fn">$1</span>');
      // numbers
      code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
      // operators
      code = code.replace(/(==|!=|&lt;=|&gt;=|&lt;|&gt;|\+=|-=|\*=|\/=|-&gt;|=)/g, '<span class="op">$1</span>');
    }

    if (['js', 'ts', 'javascript', 'typescript'].includes(lang)) {
      code = code.replace(/(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;|`[^`]*?`)/g, '<span class="str">$1</span>');
      code = code.replace(/(\/\/[^\n<]*)/g, '<span class="cm">$1</span>');
      code = code.replace(/\b(const|let|var|function|class|return|if|else|for|while|import|export|async|await|new|this|true|false|null|undefined|typeof|instanceof|interface|type|extends|implements|readonly|enum|abstract)\b/g, '<span class="kw">$1</span>');
      code = code.replace(/\b(string|number|boolean|void|any|never|unknown|Promise|Array|Record|Partial|Required|Pick|Omit)\b/g, '<span class="type">$1</span>');
      code = code.replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, '<span class="cls">$1</span>');
      code = code.replace(/\b([a-z_]\w*)\b(?=\()/g, '<span class="fn">$1</span>');
      code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
      code = code.replace(/(===|!==|==|!=|&lt;=|&gt;=|=&gt;|&lt;|&gt;|\+=|-=|\*=|\/=|=)/g, '<span class="op">$1</span>');
    }

    return code;
  }
}
