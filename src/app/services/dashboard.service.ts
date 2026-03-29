import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { DashboardResponse, DrillRule, RuleReviewRequest, RuleReviewResponse } from '../core/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  dashboard  = signal<DashboardResponse | null>(null);
  drillRules = signal<DrillRule[]>([]);
  loading    = signal(false);

  async loadDashboard(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.get<DashboardResponse>('/dashboard');
      this.dashboard.set(data);
    } finally { this.loading.set(false); }
  }

  async loadDrillRules(): Promise<void> {
    const data = await this.api.get<{ rules: DrillRule[] }>('/drill-rules');
    this.drillRules.set(data.rules);
  }

  async reviewRule(ruleId: string, correct: boolean): Promise<void> {
    await this.api.post<RuleReviewResponse>('/drill-rules/review', { rule_id: ruleId, correct });
    this.drillRules.update(rules =>
      rules.map(r => r.id === ruleId ? { ...r, due: false, correct_streak: correct ? r.correct_streak + 1 : 0 } : r)
    );
  }
}
