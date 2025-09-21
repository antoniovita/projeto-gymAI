import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';
import { DayCompletion, RoutineTask } from 'api/types/routineTaskTypes';


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
        cancelled_days TEXT DEFAULT "[]",
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
    weekDays: string[],
    type: string,
    userId: string,
  ) => {
    const routineId = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO routine_tasks (id, title, content, type, week_days, days_completed, cancelled_days, created_at, is_active, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      routineId,
      title,
      content,
      type ?? null,
      JSON.stringify(weekDays),
      JSON.stringify([]),
      JSON.stringify([]),
      now,
      1,
      userId,
    );
    return routineId;
  },

  // retorna todas as tasks ativas do usuário (inclui as que têm dias cancelados)
  getRoutineTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string): Promise<RoutineTask[]> => {
    return await db.getAllAsync(
      'SELECT * FROM routine_tasks WHERE user_id = ? AND is_active = 1',
      userId
    ) as RoutineTask[];
  },

  getAllRoutineTasksByUserId: async (
    db: SQLite.SQLiteDatabase, 
    userId: string
  ): Promise<RoutineTask[]> => {
    return await db.getAllAsync(
      'SELECT * FROM routine_tasks WHERE user_id = ?',
      userId
    ) as RoutineTask[];
  },

  // retorna apenas as tasks ativas que DEVEM ser executadas em uma data específica (exclui as canceladas)
  getRoutineTasksForDate: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    date: string
  ): Promise<RoutineTask[]> => {
    const routines = await RoutineTaskModel.getRoutineTasksByUserId(db, userId);
    return routines.filter(routine =>
      RoutineTaskModel.shouldBeCompletedOnDate(routine, date)
    );
  },

  // busca uma task específica por id (independente de cancelamentos)
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

  // retorna tasks ativas que NÃO estão canceladas para o usuário
  getActiveRoutineTasksByUserId: async (
    db: SQLite.SQLiteDatabase, 
    userId: string
  ): Promise<RoutineTask[]> => {
    const allRoutines = await RoutineTaskModel.getRoutineTasksByUserId(db, userId);
    
    return allRoutines.filter(routine => {
      const cancelledDays = RoutineTaskModel.getCancelledDays(routine);
      
      if (cancelledDays.length === 0) {
        return true;
      }
      
      const today = new Date();
      const next30Days = [];
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        next30Days.push(dateStr);
      }
      
      return next30Days.some(dateStr => 
        RoutineTaskModel.shouldBeCompletedOnDate(routine, dateStr)
      );
    });
  },

  completeRoutineTaskForDate: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string,
    xpGranted: number = 0
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    if (completions.some(c => c.date === date)) return 0;

    completions.push({
      date,
      xp_granted: xpGranted,
      completed_at: new Date().toISOString()
    });

    const result = await db.runAsync(
      'UPDATE routine_tasks SET days_completed = ? WHERE id = ?',
      JSON.stringify(completions),
      routineId
    );

    return result.changes;
  },

  uncompleteRoutineTaskForDate: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    const updated = completions.filter(c => c.date !== date);

    const result = await db.runAsync(
      'UPDATE routine_tasks SET days_completed = ? WHERE id = ?',
      JSON.stringify(updated),
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

  deleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    return (await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE id = ?',
      routineId
    )).changes;
  },

  permanentDeleteRoutineTask: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<number> => {
    return (await db.runAsync(
      'DELETE FROM routine_tasks WHERE id = ?',
      routineId
    )).changes;
  },

  clearRoutineTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    return (await db.runAsync(
      'UPDATE routine_tasks SET is_active = 0 WHERE user_id = ?',
      userId
    )).changes;
  },

// cancelar task
  addCancelledDay: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const cancelled: string[] = JSON.parse(routine.cancelled_days || "[]");
    if (cancelled.includes(date)) return 0;

    cancelled.push(date);

    return (await db.runAsync(
      'UPDATE routine_tasks SET cancelled_days = ? WHERE id = ?',
      JSON.stringify(cancelled),
      routineId
    )).changes;
  },

  removeCancelledDay: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
    date: string
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;

    const cancelled: string[] = JSON.parse(routine.cancelled_days || "[]");
    const updated = cancelled.filter(d => d !== date);

    return (await db.runAsync(
      'UPDATE routine_tasks SET cancelled_days = ? WHERE id = ?',
      JSON.stringify(updated),
      routineId
    )).changes;
  },

  // functions uteis
  getWeekDays: (routine: RoutineTask): string[] =>
    JSON.parse(routine.week_days || "[]"),

  getCompletions: (routine: RoutineTask): DayCompletion[] =>
    JSON.parse(routine.days_completed || "[]"),

  getCancelledDays: (routine: RoutineTask): string[] =>
    JSON.parse(routine.cancelled_days || "[]"),

  isCompletedOnDate: (routine: RoutineTask, date: string): boolean =>
    RoutineTaskModel.getCompletions(routine).some(c => c.date === date),

  isCompletedToday: (routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return RoutineTaskModel.isCompletedOnDate(routine, today);
  },

  getCompletionForDate: (routine: RoutineTask, date: string): DayCompletion | null =>
    RoutineTaskModel.getCompletions(routine).find(c => c.date === date) || null,

  getTotalXpFromRoutine: (routine: RoutineTask): number =>
    RoutineTaskModel.getCompletions(routine).reduce((t, c) => t + c.xp_granted, 0),

  getCompletedDates: (routine: RoutineTask): string[] =>
    RoutineTaskModel.getCompletions(routine).map(c => c.date).sort(),

  getCompletionCount: (routine: RoutineTask): number =>
    RoutineTaskModel.getCompletions(routine).length,

  getCompletionsInPeriod: (routine: RoutineTask, start: string, end: string): DayCompletion[] =>
    RoutineTaskModel.getCompletions(routine).filter(c => c.date >= start && c.date <= end),

  shouldBeCompletedToday: (routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return RoutineTaskModel.shouldBeCompletedOnDate(routine, today);
  },

  // verifica se uma routine deve ser completada em uma data específica
  shouldBeCompletedOnDate: (routine: RoutineTask, date: string): boolean => {
    const weekDays = RoutineTaskModel.getWeekDays(routine);
    const cancelled = RoutineTaskModel.getCancelledDays(routine);

    if (cancelled.includes(date)) return false;

    const targetDate = new Date(date);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayName = dayNames[targetDate.getDay()];

    return weekDays.includes(dayName);
  },

  isCancelledOnDate: (routine: RoutineTask, date: string): boolean => {
    const cancelled = RoutineTaskModel.getCancelledDays(routine);
    return cancelled.includes(date);
  },

  getCancelledDatesForRoutine: (routine: RoutineTask): string[] => {
    return RoutineTaskModel.getCancelledDays(routine).sort();
  },

  hasAnyCancelledDays: (routine: RoutineTask): boolean => {
    const cancelled = RoutineTaskModel.getCancelledDays(routine);
    return cancelled.length > 0;
  },

  getNextValidDates: (routine: RoutineTask, fromDate: string, limit: number = 7): string[] => {
    const weekDays = RoutineTaskModel.getWeekDays(routine);
    const cancelled = RoutineTaskModel.getCancelledDays(routine);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    
    const validDates: string[] = [];
    const startDate = new Date(fromDate);
    let currentDate = new Date(startDate);
    
    let daysChecked = 0;
    const maxDaysToCheck = 30;
    
    while (validDates.length < limit && daysChecked < maxDaysToCheck) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];
      
      if (weekDays.includes(dayName) && !cancelled.includes(dateStr)) {
        validDates.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }
    
    return validDates;
  },

  // conta quantos dias válidos (não cancelados) uma routine tem em um período
  getValidDaysInPeriod: (routine: RoutineTask, startDate: string, endDate: string): number => {
    const weekDays = RoutineTaskModel.getWeekDays(routine);
    const cancelled = RoutineTaskModel.getCancelledDays(routine);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    
    let validDays = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];
      
      if (weekDays.includes(dayName) && !cancelled.includes(dateStr)) {
        validDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return validDays;
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

    activateRoutineTask: async (
    db: SQLite.SQLiteDatabase,
    routineId: string,
  ): Promise<number> => {
    const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
    if (!routine) return 0;
    const result = await db.runAsync(
      'UPDATE routine_tasks SET is_active = ? WHERE id = ?',
      1,
      routineId
    );

    return result.changes;
  },


};