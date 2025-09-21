export interface Exercise {
  name: string;
  reps: number;
  series: number;
  load: number;
  completion: 0 | 1;
  xp_granted: 0 | 1;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  date: string;
  type?: string;
  user_id: string;
}