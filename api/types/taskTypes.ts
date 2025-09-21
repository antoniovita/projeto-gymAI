export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string; // ISO string: "2025-06-12T07:12:00.000Z"
  type?: string;
  completed: 0 | 1;
  xp_awarded: 0 | 1;
  user_id: string;
}

export interface UnifiedTask {
  id: string;
  title: string;
  content?: string;
  datetime: string;
  completed: 0 | 1;
  type?: string;
  isRoutine: boolean;
  routineId?: string;
  originalWeekDays?: string[];
  targetDate?: string; 
}