export interface ThinkingProfile {
  user_id: string;
  assumption_errors: number;
  incomplete_reasoning: number;
  surface_thinking: number;
  wrong_abstraction: number;
  blind_spots: number;
  weak_zones: string[];
  session_count: number;
  total_problems: number;
  last_session_summary: string | null;
}

export interface ProgressionData {
  this_week: Record<string, number>;
  last_week: Record<string, number>;
  mode_breakdown: Record<string, Record<string, number>>;
  recent_examples: any[];
  weekly_counts: number[];
}
