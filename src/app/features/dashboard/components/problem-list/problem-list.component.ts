import { Component, Input } from '@angular/core';
import { Problem } from '../../../../core/models';

@Component({
  selector: 'app-problem-list',
  standalone: true,
  template: `
    <div class="problem-card">
      <div class="card-title mono">RECENT PROBLEMS</div>
      @if (!problems.length) {
        <div class="empty mono">No problems yet — complete a session to see it here</div>
      }
      @for (p of problems; track p.id) {
        <div class="problem-row">
          <div class="problem-left">
            <div class="problem-title">
              @if (p.leetcode_url) {
                <a [href]="p.leetcode_url" target="_blank" class="problem-link">{{ p.title }}</a>
              } @else {
                {{ p.title }}
              }
            </div>
            <div class="problem-meta">
              <span class="byte-badge" [class]="p.mode.toLowerCase()">{{ p.mode }}</span>
              <span class="byte-badge" [class]="p.difficulty.toLowerCase()">{{ p.difficulty }}</span>
              @if (p.pattern_family) {
                <span class="pattern-tag mono">{{ p.pattern_family }}</span>
              }
            </div>
          </div>
          <div class="problem-right">
            <div class="status-dot" [class]="p.status === 'solved' ? 'green' : p.status === 'solved_with_guidance' ? 'yellow' : 'red'"></div>
            <div class="scores mono">
              <span [style.color]="getScoreColor(p.communication_score)">C:{{ p.communication_score || '?' }}</span>
              <span [style.color]="getScoreColor(p.correctness_score)">R:{{ p.correctness_score || '?' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .problem-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .card-title { font-size: 10px; color: var(--muted); letter-spacing: 1px; margin-bottom: 16px; }
    .empty { font-size: 12px; color: var(--muted); }
    .problem-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .problem-row:last-child { border-bottom: none; }
    .problem-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
    .problem-link { color: var(--accent); text-decoration: none; }
    .problem-link:hover { text-decoration: underline; }
    .problem-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .pattern-tag { font-size: 10px; color: var(--muted); }
    .problem-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; padding-left: 12px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.green { background: var(--accent3); }
    .status-dot.yellow { background: var(--accent); }
    .status-dot.red { background: var(--accent2); }
    .scores { font-size: 11px; display: flex; gap: 8px; }
  `]
})
export class ProblemListComponent {
  @Input() problems: Problem[] = [];
  getScoreColor(score: number | null): string {
    if (!score) return 'var(--muted)';
    return score >= 7 ? 'var(--accent3)' : score >= 4 ? 'var(--accent)' : 'var(--accent2)';
  }
}
