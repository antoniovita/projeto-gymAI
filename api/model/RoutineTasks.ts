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
    weekDays: string[], // ["monday", "friday"]
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

  completeRoutineTask: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    xpGranted: number
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now = new Date().toISOString();
    
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    
    // Verifica se já foi completada hoje
    const alreadyCompletedToday = completions.some(c => c.date === today);
    if (alreadyCompletedToday) return 0;

    // Adiciona nova conclusão
    const newCompletion: DayCompletion = {
      date: today,
      xp_granted: xpGranted,
      completed_at: now
    };
    
    completions.push(newCompletion);

    const result = await db.runAsync(
      'UPDATE routine_tasks SET days_completed = ? WHERE id = ?',
      JSON.stringify(completions),
      routineId
    );
    
    return result.changes;
  },

  uncompleteRoutineTask: async (
    db: SQLite.SQLiteDatabase,
    routineId: string
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    
    // Remove conclusão de hoje se existir
    const updatedCompletions = completions.filter(c => c.date !== today);

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
    const fields = Object.keys(updates).filter(key => key !== 'id'); // Remove id das atualizações
    if (fields.length === 0) return 0;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = (updates as any)[field];
      // Se for array (week_days), converte para JSON string
      return Array.isArray(value) ? JSON.stringify(value) : value;
    });

    const result = await db.runAsync(
      `UPDATE routine_tasks SET ${setClause} WHERE id = ?`,
      ...values,
      routineId
    );
    
    return result.changes;
  },

  deleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE id = ?', // Soft delete
      routineId
    );
    return result.changes;
  },

  permanentDeleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM routine_tasks WHERE id = ?',
      routineId
    );
    return result.changes;
  },

  clearRoutineTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE user_id = ?', // Soft delete
      userId
    );
    return result.changes;
  },

  getWeekDays: (routine: RoutineTask): string[] => {
    return JSON.parse(routine.week_days || "[]");
  },

  getCompletions: (routine: RoutineTask): DayCompletion[] => {
    return JSON.parse(routine.days_completed || "[]");
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