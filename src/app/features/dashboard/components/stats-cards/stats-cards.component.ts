import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardStats } from '../../../../core/models';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num accent">{{ stats.solved }}</div>
        <div class="stat-label mono">PROBLEMS SOLVED</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label mono">TOTAL ATTEMPTED</div>
      </div>
      <div class="stat-card">
        <div class="stat-num accent3">{{ stats.this_week }}</div>
        <div class="stat-label mono">THIS WEEK</div>
      </div>
      <div class="stat-card">
        <div class="stat-num accent">{{ stats.avg_communication | number:'1.1-1' }}</div>
        <div class="stat-label mono">AVG COMMUNICATION</div>
      </div>
      <div class="stat-card">
        <div class="stat-num accent3">{{ stats.avg_correctness | number:'1.1-1' }}</div>
        <div class="stat-label mono">AVG CORRECTNESS</div>
      </div>
      <div class="stat-card modes">
        <div class="mode-row"><span class="byte-badge dsa">DSA</span><span class="mode-count">{{ stats.dsa }}</span></div>
        <div class="mode-row"><span class="byte-badge lld">LLD</span><span class="mode-count">{{ stats.lld }}</span></div>
        <div class="mode-row"><span class="byte-badge hld">HLD</span><span class="mode-count">{{ stats.hld }}</span></div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .stat-num { font-size: 28px; font-weight: 800; color: var(--text); font-family: var(--font-mono); margin-bottom: 4px; }
    .stat-num.accent { color: var(--accent); }
    .stat-num.accent3 { color: var(--accent3); }
    .stat-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; }
    .modes { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
    .mode-row { display: flex; align-items: center; justify-content: space-between; }
    .mode-count { font-size: 14px; font-weight: 700; font-family: var(--font-mono); color: var(--text); }
  `]
})
export class StatsCardsComponent {
  @Input() stats!: DashboardStats;
}
