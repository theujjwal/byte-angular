export interface Problem {
  id: string;
  title: string;
  mode: string;
  difficulty: string;
  pattern_family: string | null;
  leetcode_url: string | null;
  status: string;
  time_minutes: number | null;
  communication_score: number | null;
  correctness_score: number | null;
  what_went_right: string[];
  mechanics_struggled: string[];
  sub_problems_to_revisit: string[];
  solved_at: string;
}

export interface SessionComplete {
  title: string;
  difficulty: string;
  pattern_family: string;
  status: string;
  time_estimate: string;
  communication_score: number;
  correctness_score: number;
  what_went_right: string[];
  mechanics_struggled: string[];
  sub_problems_to_revisit: string[];
  drill_rules: any[];
  problem_id?: string;
}

export interface DashboardStats {
  total: number;
  solved: number;
  dsa: number;
  lld: number;
  hld: number;
  avg_communication: number;
  avg_correctness: number;
  this_week: number;
}

export interface PatternHeatmap {
  pattern: string;
  count: number;
  avg_score: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  heatmap: PatternHeatmap[];
  recent: Problem[];
  due_rules_count: number;
  weekly_streak: number;
}
