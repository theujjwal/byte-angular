import { Component, inject, computed } from '@angular/core';
import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  template: `
    <div class="profile-sidebar">
      <div class="profile-header">
        <div class="profile-title mono">THINKING PROFILE</div>
        <div class="session-badge">
          <div class="session-num">{{ profile.profile()?.session_count || 0 }}</div>
          <div class="session-label mono">SESSIONS</div>
        </div>
      </div>
      <div class="profile-scroll">
        <div class="stat-section">
          <div class="stat-label mono">PATTERN TRACKER</div>
          @for (field of patternFields; track field.key) {
            <div class="stat-row">
              <span class="stat-name">{{ field.label }}</span>
              <span class="stat-val mono" [class]="field.color">
                {{ getCount(field.key) }}{{ getTrend(field.key) }}
              </span>
            </div>
            <div class="stat-bar">
              <div class="stat-fill" [class]="field.color" [style.width.%]="getPercent(field.key)"></div>
            </div>
          }
        </div>
        <div class="stat-section">
          <div class="stat-label mono">WEAK ZONES</div>
          @if ((profile.profile()?.weak_zones || []).length === 0) {
            <span class="small-text mono">None identified yet</span>
          } @else {
            @for (zone of profile.profile()?.weak_zones || []; track zone) {
              <span class="zone-tag">{{ zone }}</span>
            }
          }
        </div>
        <div class="stat-section">
          <div class="stat-label mono">LAST SESSION</div>
          <div class="small-text mono">{{ profile.profile()?.last_session_summary || 'No sessions yet' }}</div>
        </div>
        @if (weeklyGraph.length) {
          <div class="stat-section">
            <div class="stat-label mono">WEEKLY TREND (↓ good)</div>
            @for (w of weeklyGraph; track $index) {
              <div class="week-row">
                <span class="week-label mono">{{ w.label }}</span>
                <div class="week-track"><div class="week-fill" [style.width.%]="w.pct" [style.background]="w.color"></div></div>
                <span class="week-count mono" [style.color]="w.color">{{ w.count }}</span>
              </div>
            }
          </div>
        }
        @if (recentExamples.length) {
          <div class="stat-section">
            <div class="stat-label mono">RECENT MISTAKES</div>
            @for (ex of recentExamples; track ex.at) {
              <div class="ex-card">
                <div class="ex-type mono">{{ formatType(ex.type) }} · {{ ex.mode }}</div>
                <div class="ex-text mono">"{{ ex.text?.slice(0,80) }}"</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .profile-sidebar { height: 100%; display: flex; flex-direction: column; background: var(--surface); border-left: 1px solid var(--border); }
    .profile-header { padding: 14px 12px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .profile-title { font-size: 9px; color: var(--muted); letter-spacing: 1px; margin-bottom: 10px; }
    .session-badge { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; text-align: center; }
    .session-num { font-size: 26px; font-weight: 800; color: var(--accent); font-family: var(--font-mono); }
    .session-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; }
    .profile-scroll { flex: 1; overflow-y: auto; padding: 10px 12px; }
    .stat-section { margin-bottom: 14px; }
    .stat-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; margin-bottom: 6px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .stat-name { font-size: 11px; color: var(--text); }
    .stat-val { font-size: 12px; font-weight: 700; }
    .stat-val.red { color: var(--accent2); }
    .stat-val.yellow { color: var(--accent); }
    .stat-val.green { color: var(--accent3); }
    .stat-bar { width: 100%; height: 3px; background: var(--border); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
    .stat-fill { height: 100%; border-radius: 2px; transition: width .5s; }
    .stat-fill.red { background: var(--accent2); }
    .stat-fill.yellow { background: var(--accent); }
    .stat-fill.green { background: var(--accent3); }
    .zone-tag { display: inline-block; font-size: 9px; padding: 2px 7px; border-radius: 20px; margin: 2px; background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
    .small-text { font-size: 11px; color: var(--muted); line-height: 1.6; }
    .week-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
    .week-label { font-size: 9px; color: var(--muted); width: 24px; }
    .week-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .week-fill { height: 100%; border-radius: 3px; }
    .week-count { font-size: 9px; width: 16px; text-align: right; }
    .ex-card { background: var(--surface2); border-left: 2px solid var(--accent2); border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; }
    .ex-type { font-size: 9px; color: var(--accent2); margin-bottom: 3px; text-transform: uppercase; }
    .ex-text { font-size: 10px; color: var(--muted); line-height: 1.5; }
  `]
})
export class ProfileSidebarComponent {
  profile: ProfileService = inject(ProfileService);

  patternFields = [
    { key: 'assumption_errors',    label: 'Assumption errors',    color: 'red' },
    { key: 'incomplete_reasoning', label: 'Incomplete reasoning', color: 'yellow' },
    { key: 'surface_thinking',     label: 'Surface thinking',     color: 'yellow' },
    { key: 'wrong_abstraction',    label: 'Wrong abstraction',    color: 'red' },
    { key: 'blind_spots',          label: 'Blind spots',          color: 'green' },
  ];

  getCount(key: string): number { return (this.profile.profile() as any)?.[key] || 0; }

  getPercent(key: string): number {
    const max = Math.max(...this.patternFields.map(f => this.getCount(f.key)), 1);
    return Math.round((this.getCount(key) / max) * 100);
  }

  getTrend(key: string): string {
    const prog = this.profile.progression();
    if (!prog) return '';
    const tw = prog.this_week?.[key] || 0;
    const lw = prog.last_week?.[key] || 0;
    if (!tw && !lw) return '';
    return tw < lw ? ' ↓' : tw > lw ? ' ↑' : ' →';
  }

  get weeklyGraph() {
    const counts = this.profile.progression()?.weekly_counts || [];
    if (!counts.length || counts.every((c: number) => c === 0)) return [];
    const max = Math.max(...counts, 1);
    const labels = ['W-4','W-3','W-2','W-1'];
    const colors = ['#64748b','#64748b','#f59e0b','#10b981'];
    return counts.map((c: number, i: number) => ({ label: labels[i]||'W'+i, count: c, pct: Math.round((c/max)*100), color: colors[i]||'#64748b' }));
  }

  get recentExamples() {
    return (this.profile.progression()?.recent_examples || []).slice(0, 3);
  }

  formatType(type: string): string {
    return type?.replace(/_/g, ' ') ?? '';
  }
}
