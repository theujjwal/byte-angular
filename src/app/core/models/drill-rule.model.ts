export interface DrillRule {
  id: string;
  rule_text: string;
  mechanic: string;
  pattern_family: string;
  next_review_at: string;
  interval_days: number;
  correct_streak: number;
  total_reviews: number;
  created_at: string;
  due: boolean;
}

export interface RuleReviewRequest {
  rule_id: string;
  correct: boolean;
}

export interface RuleReviewResponse {
  success: boolean;
  next_review_at?: string;
}
