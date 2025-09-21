export interface DayCompletion {
  date: string; // YYYY-MM-DD
  xp_granted: number;
  completed_at: string; // ISO string
}

export interface RoutineTask {
  id: string;
  title: string;
  content: string;
  type?: string;
  week_days: string; // JSON string: ["monday","tuesday","friday"]
  days_completed: string; // JSON string: DayCompletion[]
  cancelled_days: string; // JSON string: [ "2025-08-26", "2025-09-02" ]
  created_at: string; // ISO string
  is_active: 0 | 1;
  user_id: string;
}
