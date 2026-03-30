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
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
      const l = lang || 'text';
      const highlighted = this.highlight(code.trim(), lang);
      return `<div class="code-block"><div class="code-bar"><span class="code-lang">${l}</span><div class="code-actions"><button class="code-action" onclick="const b=this;navigator.clipboard.writeText(this.closest('.code-block').querySelector('pre').textContent).then(()=>{b.textContent='copied!';b.classList.add('copied');setTimeout(()=>{b.textContent='copy';b.classList.remove('copied')},1500)})">copy</button></div></div><pre>${highlighted}</pre></div>`;
    });
    text = text.replace(/`([^`]+)`/g,'<code class="byte-inline">$1</code>');
    text = text.replace(/\n/g,'<br>');
    return text;
  }

  private highlight(raw: string, lang?: string): string {
    if (!lang || lang === 'text') return raw;

    const PY_KW = new Set('def,class,return,if,else,elif,for,while,in,not,and,or,import,from,True,False,None,with,as,try,except,finally,raise,yield,lambda,self,cls,pass,break,continue,assert,del,is,global,nonlocal,async,await'.split(','));
    const PY_TYPE = new Set('int,str,float,bool,list,dict,set,tuple,Optional,List,Dict,Set,Tuple,Any,Union,Type,Callable'.split(','));
    const JS_KW = new Set('const,let,var,function,class,return,if,else,for,while,import,export,async,await,new,this,true,false,null,undefined,typeof,instanceof,interface,type,extends,implements,readonly,enum,abstract,switch,case,default,break,continue,throw,try,catch,finally,of,in,yield,super,static,get,set,from'.split(','));
    const JS_TYPE = new Set('string,number,boolean,void,any,never,unknown,Promise,Array,Record,Partial,Required,Pick,Omit,Map,Set'.split(','));

    const isPy = ['python', 'py'].includes(lang);
    const isJs = ['js', 'ts', 'javascript', 'typescript'].includes(lang);
    if (!isPy && !isJs) return raw;

    const kws = isPy ? PY_KW : JS_KW;
    const types = isPy ? PY_TYPE : JS_TYPE;

    // Tokenize in a single pass — no overlapping replacements
    const tokens: string[] = [];
    let i = 0;
    while (i < raw.length) {
      // Python comments
      if (isPy && raw[i] === '#') {
        const end = raw.indexOf('\n', i);
        const slice = end === -1 ? raw.slice(i) : raw.slice(i, end);
        tokens.push(`<span class="cm">${this.esc(slice)}</span>`);
        i += slice.length;
        continue;
      }
      // JS single-line comments
      if (isJs && raw[i] === '/' && raw[i + 1] === '/') {
        const end = raw.indexOf('\n', i);
        const slice = end === -1 ? raw.slice(i) : raw.slice(i, end);
        tokens.push(`<span class="cm">${this.esc(slice)}</span>`);
        i += slice.length;
        continue;
      }
      // Strings (triple-quoted for python, backticks for js, single/double for both)
      if (isPy && i + 2 < raw.length && ((raw[i] === "'" && raw[i+1] === "'" && raw[i+2] === "'") || (raw[i] === '"' && raw[i+1] === '"' && raw[i+2] === '"'))) {
        const q = raw.slice(i, i + 3);
        const end = raw.indexOf(q, i + 3);
        const slice = end === -1 ? raw.slice(i) : raw.slice(i, end + 3);
        tokens.push(`<span class="str">${this.esc(slice)}</span>`);
        i += slice.length;
        continue;
      }
      if ((raw[i] === '"' || raw[i] === "'") || (isJs && raw[i] === '`')) {
        const q = raw[i];
        let j = i + 1;
        while (j < raw.length && raw[j] !== q) { if (raw[j] === '\\') j++; j++; }
        const slice = raw.slice(i, j + 1);
        tokens.push(`<span class="str">${this.esc(slice)}</span>`);
        i = j + 1;
        continue;
      }
      // Decorators (python)
      if (isPy && raw[i] === '@' && /\w/.test(raw[i + 1] || '')) {
        const m = raw.slice(i).match(/^@\w+/);
        if (m) { tokens.push(`<span class="dec">${this.esc(m[0])}</span>`); i += m[0].length; continue; }
      }
      // Words (keywords, types, class names, functions, identifiers)
      if (/[a-zA-Z_]/.test(raw[i])) {
        const m = raw.slice(i).match(/^[a-zA-Z_]\w*/);
        if (m) {
          const w = m[0];
          const next = raw[i + w.length];
          if (kws.has(w)) tokens.push(`<span class="kw">${this.esc(w)}</span>`);
          else if (types.has(w)) tokens.push(`<span class="type">${this.esc(w)}</span>`);
          else if (/^[A-Z]/.test(w)) tokens.push(`<span class="cls">${this.esc(w)}</span>`);
          else if (next === '(') tokens.push(`<span class="fn">${this.esc(w)}</span>`);
          else tokens.push(this.esc(w));
          i += w.length;
          continue;
        }
      }
      // Numbers
      if (/\d/.test(raw[i])) {
        const m = raw.slice(i).match(/^\d+\.?\d*/);
        if (m) { tokens.push(`<span class="num">${this.esc(m[0])}</span>`); i += m[0].length; continue; }
      }
      // Default: escape and push character
      tokens.push(this.esc(raw[i]));
      i++;
    }
    return tokens.join('');
  }
}
