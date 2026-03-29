import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../../services/dashboard.service';
import { DrillRule } from '../../../../core/models';

@Component({
  selector: 'app-drill-rules',
  standalone: true,
  template: `
    <div class="rules-card">
      <div class="card-header">
        <div class="card-title mono">🔁 DRILL RULES</div>
        @if (dueCount > 0) {
          <span class="due-badge mono">{{ dueCount }} due</span>
        }
      </div>
      @if (dashboard.loading()) {
        <div class="loading mono">Loading...</div>
      } @else if (!dashboard.drillRules().length) {
        <div class="empty mono">No drill rules yet — complete a session to save rules</div>
      } @else {
        @for (rule of dashboard.drillRules(); track rule.id) {
          <div class="rule-card" [class.due]="rule.due">
            <div class="rule-text">{{ rule.rule_text }}</div>
            <div class="rule-meta mono">
              <span>{{ rule.mechanic }}</span>
              <span>streak: {{ rule.correct_streak }}</span>
              <span>every {{ rule.interval_days }}d</span>
            </div>
            @if (rule.due) {
              <div class="rule-actions">
                <button class="byte-btn" style="color:var(--accent2)" (click)="review(rule, false)">✕ Wrong</button>
                <button class="byte-btn" style="color:var(--accent3)" (click)="review(rule, true)">✓ Correct</button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .rules-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-title { font-size: 10px; color: var(--muted); letter-spacing: 1px; }
    .due-badge { font-size: 9px; background: rgba(245,158,11,.15); color: var(--accent); border: 1px solid rgba(245,158,11,.3); padding: 2px 8px; border-radius: 20px; }
    .loading, .empty { font-size: 12px; color: var(--muted); }
    .rule-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 8px; border-left: 3px solid var(--border); }
    .rule-card.due { border-left-color: var(--accent); }
    .rule-text { font-size: 13px; color: var(--text); margin-bottom: 6px; line-height: 1.5; }
    .rule-meta { display: flex; gap: 12px; font-size: 10px; color: var(--muted); margin-bottom: 8px; }
    .rule-actions { display: flex; gap: 8px; }
  `]
})
export class DrillRulesComponent implements OnInit {
  dashboard = inject(DashboardService);

  get dueCount(): number {
    return this.dashboard.drillRules().filter(r => r.due).length;
  }

  async ngOnInit(): Promise<void> {
    await this.dashboard.loadDrillRules();
  }

  async review(rule: DrillRule, correct: boolean): Promise<void> {
    await this.dashboard.reviewRule(rule.id, correct);
  }
}