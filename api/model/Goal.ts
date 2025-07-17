import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  deadline?: string; 
  progress: number;
  user_id: string;
  completed: 0 | 1;
}

export const GoalModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        deadline TEXT,
        progress INTEGER DEFAULT 0,
        user_id TEXT,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
  },

  createGoal: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    description: string,
    createdAt: string,
    deadline: string | null,
    userId: string,
  ) => {
    const goalId = uuid.v4() as string;

    await db.runAsync(
      `INSERT INTO goals (id, name, description, created_at, deadline, progress, user_id, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      goalId,
      name,
      description ?? null,
      createdAt,
      deadline ?? null,
      0,          // progress inicial
      userId,
      0           // não completado
    );

    return goalId;
  },

  getGoalsByUserId: async (db: SQLite.SQLiteDatabase, userId: string): Promise<Goal[]> => {
    return await db.getAllAsync(
      'SELECT * FROM goals WHERE user_id = ?',
      userId
    ) as Goal[];
  },

  getGoalById: async (db: SQLite.SQLiteDatabase, goalId: string): Promise<Goal | null> => {
    const goals = await db.getAllAsync(
      'SELECT * FROM goals WHERE id = ?',
      goalId
    ) as Goal[];
    return goals.length > 0 ? goals[0] : null;
  },

  updateGoalProgress: async (
    db: SQLite.SQLiteDatabase,
    goalId: string,
    progress: number
  ): Promise<number> => {
    const completed = progress >= 100 ? 1 : 0;
    const now = new Date().toISOString();

    const result = await db.runAsync(
      'UPDATE goals SET progress = ?, completed = ?, created_at = ? WHERE id = ?',
      progress,
      completed,
      now,
      goalId
    );

    return result.changes;
  },

  updateGoal: async (
    db: SQLite.SQLiteDatabase,
    goalId: string,
    updates: Partial<Goal>
  ): Promise<number> => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return 0;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);

    const result = await db.runAsync(
      `UPDATE goals SET ${setClause} WHERE id = ?`,
      ...values,
      goalId
    );

    return result.changes;
  },

  deleteGoal: async (db: SQLite.SQLiteDatabase, goalId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM goals WHERE id = ?',
      goalId
    );
    return result.changes;
  },

  clearGoalsByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM goals WHERE user_id = ?',
      userId
    );
    return result.changes;
  },

  getAllGoalsDebug: async (db: SQLite.SQLiteDatabase): Promise<Goal[]> => {
    try {
      const goals = await db.getAllAsync('SELECT * FROM goals') as Goal[];
      console.log('[DEBUG] Todas as metas no banco:', goals);
      return goals;
    } catch (err) {
      console.error('[DEBUG] Erro ao listar metas:', err);
      return [];
    }
  },
};
