import { Component, Input } from '@angular/core';
import { PatternHeatmap } from '../../../../core/models';

@Component({
  selector: 'app-pattern-heatmap',
  standalone: true,
  template: `
    <div class="heatmap-card">
      <div class="card-title mono">PATTERN FAMILY HEATMAP</div>
      @if (!heatmap.length) {
        <div class="empty mono">No data yet — solve problems to build your heatmap</div>
      }
      @for (item of heatmap; track item.pattern) {
        <div class="heatmap-row">
          <div class="pattern-name">{{ item.pattern }}</div>
          <div class="bar-wrap">
            <div class="bar-fill" [style.width.%]="getWidth(item)" [style.background]="getColor(item.avg_score)"></div>
          </div>
          <div class="bar-meta mono">
            <span>×{{ item.count }}</span>
            <span [style.color]="getColor(item.avg_score)">{{ item.avg_score }}/10</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .heatmap-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .card-title { font-size: 10px; color: var(--muted); letter-spacing: 1px; margin-bottom: 16px; }
    .empty { font-size: 12px; color: var(--muted); }
    .heatmap-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .pattern-name { font-size: 12px; color: var(--text); width: 200px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width .5s; }
    .bar-meta { display: flex; gap: 12px; font-size: 11px; color: var(--muted); width: 80px; justify-content: flex-end; }
  `]
})
export class PatternHeatmapComponent {
  @Input() heatmap: PatternHeatmap[] = [];

  getWidth(item: PatternHeatmap): number {
    const max = Math.max(...this.heatmap.map(h => h.count), 1);
    return Math.round((item.count / max) * 100);
  }

  getColor(score: number): string {
    if (score >= 7) return 'var(--accent3)';
    if (score >= 4) return 'var(--accent)';
    return 'var(--accent2)';
  }
}
