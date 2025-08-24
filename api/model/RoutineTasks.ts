import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

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
  created_at: string; // ISO string
  is_active: 0 | 1;
  user_id: string;
}

export const RoutineTaskModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routine_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT,
        week_days TEXT NOT NULL,
        days_completed TEXT DEFAULT "[]",
        created_at TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_routine_tasks_user 
      ON routine_tasks(user_id);
    `);
  },

  createRoutineTask: async (
    db: SQLite.SQLiteDatabase,
    title: string,
    content: string,
    weekDays: string[], // ["monday", "friday"] por exemplo
    type: string,
    userId: string,
  ) => {
    const routineId = uuid.v4() as string;
    const now = new Date().toISOString();
    
    await db.runAsync(
      `INSERT INTO routine_tasks (id, title, content, type, week_days, days_completed, created_at, is_active, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      routineId,
      title,
      content,
      type ?? null,
      JSON.stringify(weekDays),
      JSON.stringify([]),
      now,
      1,
      userId,
    );
    
    return routineId;
  },

  getRoutineTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string): Promise<RoutineTask[]> => {
    return await db.getAllAsync(
      'SELECT * FROM routine_tasks WHERE user_id = ? AND is_active = 1',
      userId
    ) as RoutineTask[];
  },

  getRoutineTaskById: async (
    db: SQLite.SQLiteDatabase,
    routineId: string
  ): Promise<RoutineTask | null> => {
    const routines = await db.getAllAsync(
      'SELECT * FROM routine_tasks WHERE id = ?',
      routineId
    ) as RoutineTask[];
    return routines.length > 0 ? routines[0] : null;
  },


 // vai criar uma nova day completion se nao tiver, se tiver vai somente conferir se ja está
  completeRoutineTaskForDate: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string,
    xpGranted: number = 0
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    
    const alreadyCompletedOnDate = completions.some(c => c.date === date);
    if (alreadyCompletedOnDate) return 0;

    const newCompletion: DayCompletion = {
      date: date,
      xp_granted: xpGranted,
      completed_at: new Date().toISOString()
    };
    
    completions.push(newCompletion);

    const result = await db.runAsync(
      'UPDATE routine_tasks SET days_completed = ? WHERE id = ?',
      JSON.stringify(completions),
      routineId
    );
    
    return result.changes;
  },


// mesma coisa mas para descompletar 
  uncompleteRoutineTaskForDate: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string // YYYY-MM-DD
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    
    const updatedCompletions = completions.filter(c => c.date !== date);

    const result = await db.runAsync(
      'UPDATE routine_tasks SET days_completed = ? WHERE id = ?',
      JSON.stringify(updatedCompletions),
      routineId
    );
    
    return result.changes;
  },

  updateRoutineTask: async (
    db: SQLite.SQLiteDatabase, 
    routineId: string, 
    updates: Partial<RoutineTask>
  ): Promise<number> => {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) return 0;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = (updates as any)[field];

      return Array.isArray(value) ? JSON.stringify(value) : value;
    });

    const result = await db.runAsync(
      `UPDATE routine_tasks SET ${setClause} WHERE id = ?`,
      ...values,
      routineId
    );
    
    return result.changes;
  },

  // apenas desativa a routinetask nao de fato deleta
  deleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE id = ?', 
      routineId
    );
    return result.changes;
  },

  // apaga permanentemente de fato um DELETE
  permanentDeleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM routine_tasks WHERE id = ?',
      routineId
    );
    return result.changes;
  },

  // desativa todas 
  clearRoutineTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE user_id = ?', // Soft delete
      userId
    );
    return result.changes;
  },

  // UTILITÁRIOS PARA TRABALHAR COM COMPLETIONS
  
  getWeekDays: (routine: RoutineTask): string[] => {
    return JSON.parse(routine.week_days || "[]");
  },

  getCompletions: (routine: RoutineTask): DayCompletion[] => {
    return JSON.parse(routine.days_completed || "[]");
  },

  isCompletedOnDate: (routine: RoutineTask, date: string): boolean => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.some(c => c.date === date);
  },

  isCompletedToday: (routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return RoutineTaskModel.isCompletedOnDate(routine, today);
  },

  getCompletionForDate: (routine: RoutineTask, date: string): DayCompletion | null => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.find(c => c.date === date) || null;
  },

  getTotalXpFromRoutine: (routine: RoutineTask): number => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.reduce((total, completion) => total + completion.xp_granted, 0);
  },

  getCompletedDates: (routine: RoutineTask): string[] => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.map(c => c.date).sort();
  },

  getCompletionCount: (routine: RoutineTask): number => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.length;
  },

  getCompletionsInPeriod: (routine: RoutineTask, startDate: string, endDate: string): DayCompletion[] => {
    const completions = RoutineTaskModel.getCompletions(routine);
    return completions.filter(c => c.date >= startDate && c.date <= endDate);
  },

  shouldBeCompletedToday: (routine: RoutineTask): boolean => {
    const weekDays = RoutineTaskModel.getWeekDays(routine);
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    
    return weekDays.includes(todayName);
  },

  shouldBeCompletedOnDate: (routine: RoutineTask, date: string): boolean => {
    const weekDays = RoutineTaskModel.getWeekDays(routine);
    const targetDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[targetDate.getDay()];
    
    return weekDays.includes(dayName);
  },

  getAllRoutineTasksDebug: async (db: SQLite.SQLiteDatabase): Promise<RoutineTask[]> => {
    try {
      const routines = await db.getAllAsync('SELECT * FROM routine_tasks') as RoutineTask[];
      console.log('[DEBUG] Todas as routine tasks no banco:', routines);
      return routines;
    } catch (err) {
      console.error('[DEBUG] Erro ao listar routine tasks:', err);
      return [];
    }
  },
};