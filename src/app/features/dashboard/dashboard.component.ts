import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { PatternHeatmapComponent } from './components/pattern-heatmap/pattern-heatmap.component';
import { DrillRulesComponent } from './components/drill-rules/drill-rules.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatsCardsComponent, ProblemListComponent, PatternHeatmapComponent, DrillRulesComponent],
  template: `
    <div class="dashboard-wrap">
      <!-- Top bar -->
      <div class="dash-header">
        <div class="dash-brand">
          <span style="font-size:18px">⚡</span>
          <span class="dash-title">BYTE Dashboard</span>
        </div>
        <div class="dash-nav">
          <a routerLink="/chat" class="byte-btn">← Back to Chat</a>
          <button class="byte-btn" (click)="signOut()">Sign out</button>
        </div>
      </div>

      @if (dashboard.loading()) {
        <div class="loading-state mono">Loading your progress...</div>
      } @else if (dashboard.dashboard()) {
        <div class="dash-content">

          <!-- Stats row -->
          <section class="dash-section">
            <app-stats-cards [stats]="dashboard.dashboard()!.stats" />
          </section>

          <!-- Streak + Due rules summary -->
          <div class="summary-row">
            <div class="summary-card">
              <div class="summary-num accent3">{{ dashboard.dashboard()!.weekly_streak }}</div>
              <div class="summary-label mono">DAYS PRACTICED THIS WEEK</div>
            </div>
            <div class="summary-card">
              <div class="summary-num accent">{{ dashboard.dashboard()!.due_rules_count }}</div>
              <div class="summary-label mono">DRILL RULES DUE TODAY</div>
            </div>
          </div>

          <!-- Main grid -->
          <div class="dash-grid">
            <div class="grid-left">
              <app-pattern-heatmap [heatmap]="dashboard.dashboard()!.heatmap" />
              <app-problem-list [problems]="dashboard.dashboard()!.recent" />
            </div>
            <div class="grid-right">
              <app-drill-rules />
            </div>
          </div>

        </div>
      } @else {
        <div class="empty-dash">
          <div style="font-size:48px;opacity:.3">📊</div>
          <div class="mono" style="color:var(--muted);margin-top:12px">Complete your first session to see your dashboard</div>
          <a routerLink="/chat" class="byte-btn" style="margin-top:16px">Start a session →</a>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow-y: auto; background: var(--bg); }
    .dashboard-wrap { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .dash-brand { display: flex; align-items: center; gap: 10px; }
    .dash-title { font-size: 18px; font-weight: 800; background: linear-gradient(90deg,var(--accent),#fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .dash-nav { display: flex; gap: 8px; }
    .loading-state { font-size: 13px; color: var(--muted); text-align: center; padding: 40px; }
    .dash-section { margin-bottom: 20px; }
    .summary-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .summary-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .summary-num { font-size: 36px; font-weight: 800; font-family: var(--font-mono); }
    .summary-num.accent { color: var(--accent); }
    .summary-num.accent3 { color: var(--accent3); }
    .summary-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }
    .dash-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
    .grid-left { display: flex; flex-direction: column; gap: 20px; }
    .grid-right { display: flex; flex-direction: column; gap: 20px; }
    .empty-dash { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; }
    @media(max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard = inject(DashboardService);
  private auth = inject(AuthService);

  async ngOnInit(): Promise<void> {
    await this.dashboard.loadDashboard();
  }

  signOut(): void { this.auth.signOut(); }
}
