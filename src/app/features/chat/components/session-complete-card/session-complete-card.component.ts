import { Component, Input } from '@angular/core';
import { SessionComplete } from '../../../../core/models';

@Component({
  selector: 'app-session-complete-card',
  standalone: true,
  template: `
    <div class="sc-card fade-up">
      <div class="sc-header">━━ SESSION COMPLETE ━━</div>
      <div class="sc-rows">
        <div class="sc-row"><span class="sc-label">Problem</span><span class="sc-val">{{ sc.title }} · {{ sc.difficulty }}</span></div>
        <div class="sc-row"><span class="sc-label">Pattern</span><span class="sc-val">{{ sc.pattern_family }}</span></div>
        <div class="sc-row"><span class="sc-label">Status</span><span class="sc-val" [style.color]="statusColor">{{ statusLabel }}</span></div>
      </div>
      <div class="scores">
        <div class="score-row">
          <span class="score-label">Communication</span>
          <div class="score-track"><div class="score-fill" [style.width.%]="(sc.communication_score||0)*10" [style.background]="commColor"></div></div>
          <span class="score-num" [style.color]="commColor">{{ sc.communication_score }}/10</span>
        </div>
        <div class="score-row">
          <span class="score-label">Correctness</span>
          <div class="score-track"><div class="score-fill" [style.width.%]="(sc.correctness_score||0)*10" [style.background]="corrColor"></div></div>
          <span class="score-num" [style.color]="corrColor">{{ sc.correctness_score }}/10</span>
        </div>
      </div>
      @if (sc.what_went_right?.length) {
        <div class="sc-section">
          <div class="sc-section-title">WHAT YOU GOT RIGHT</div>
          @for (item of sc.what_went_right; track item) {
            <div class="sc-item good">✅ {{ item }}</div>
          }
        </div>
      }
      @if (sc.mechanics_struggled?.length) {
        <div class="sc-section">
          <div class="sc-section-title">MECHANICS TO DRILL</div>
          @for (item of sc.mechanics_struggled; track item) {
            <div class="sc-item bad">❌ {{ item }}</div>
          }
        </div>
      }
      @if (sc.sub_problems_to_revisit?.length) {
        <div class="sc-section">
          <div class="sc-section-title">REVISIT THESE</div>
          @for (item of sc.sub_problems_to_revisit; track item) {
            <div class="sc-item">→ {{ item }}</div>
          }
        </div>
      }
      @if (sc.drill_rules?.length) {
        <div class="sc-section">
          <div class="sc-section-title">🔁 DRILL RULES SAVED</div>
          @for (rule of sc.drill_rules; track rule.rule_text; let i = $index) {
            <div class="sc-rule">{{ i+1 }}. {{ rule.rule_text }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sc-card { background: var(--surface2); border: 1px solid var(--accent3); border-radius: 14px; padding: 16px; margin-top: 12px; }
    .sc-header { font-size: 11px; font-family: var(--font-mono); color: var(--accent3); letter-spacing: 1px; margin-bottom: 12px; font-weight: 700; }
    .sc-rows { margin-bottom: 10px; }
    .sc-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .sc-label { font-size: 10px; color: var(--muted); font-family: var(--font-mono); }
    .sc-val { font-size: 11px; font-weight: 700; font-family: var(--font-mono); color: var(--text); }
    .scores { margin-bottom: 10px; }
    .score-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .score-label { font-size: 10px; color: var(--muted); font-family: var(--font-mono); width: 90px; flex-shrink: 0; }
    .score-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 3px; transition: width .5s; }
    .score-num { font-size: 10px; font-family: var(--font-mono); font-weight: 700; width: 30px; text-align: right; }
    .sc-section { margin-top: 10px; }
    .sc-section-title { font-size: 9px; font-family: var(--font-mono); color: var(--muted); letter-spacing: 1px; margin-bottom: 6px; }
    .sc-item { font-size: 12px; color: var(--text); margin-bottom: 3px; }
    .sc-item.good { color: var(--accent3); }
    .sc-item.bad { color: var(--accent2); }
    .sc-rule { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 6px; padding: 6px 10px; margin-bottom: 4px; font-size: 11px; font-family: var(--font-mono); color: var(--text); }
  `]
})
export class SessionCompleteCardComponent {
  @Input() sc!: SessionComplete;

  get statusColor() { return this.sc.status==='solved'?'var(--accent3)':this.sc.status==='solved_with_guidance'?'var(--accent)':'var(--accent2)'; }
  get statusLabel() { return this.sc.status==='solved'?'Solved independently':this.sc.status==='solved_with_guidance'?'Solved with guidance':'Unsolved'; }
  get commColor() { const s=this.sc.communication_score||0; return s>=7?'var(--accent3)':s>=4?'var(--accent)':'var(--accent2)'; }
  get corrColor() { const s=this.sc.correctness_score||0; return s>=7?'var(--accent3)':s>=4?'var(--accent)':'var(--accent2)'; }
}
