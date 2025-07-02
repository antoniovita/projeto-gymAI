import * as SQLite from 'expo-sqlite';

export interface TaskCompletion {
  task_id: string;
  date: string; // 'YYYY-MM-DD'
}

export const TaskCompletionModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_completion (
        task_id TEXT NOT NULL,
        date    TEXT NOT NULL,
        PRIMARY KEY (task_id, date),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);
  },

  markDone: async (db: SQLite.SQLiteDatabase, taskId: string, date: string): Promise<void> => {
    await db.runAsync(
      `INSERT OR REPLACE INTO task_completion (task_id, date) VALUES (?, ?)`,
      taskId,
      date
    );
  },

  unmarkDone: async (db: SQLite.SQLiteDatabase, taskId: string, date: string): Promise<void> => {
    await db.runAsync(
      `DELETE FROM task_completion WHERE task_id = ? AND date = ?`,
      taskId,
      date
    );
  },

  isDone: async (db: SQLite.SQLiteDatabase, taskId: string, date: string): Promise<boolean> => {
    const rows = await db.getAllAsync(
      `SELECT 1 FROM task_completion WHERE task_id = ? AND date = ?`,
      taskId,
      date
    );
    return rows.length > 0;
  },

  getDoneTasksForDate: async (db: SQLite.SQLiteDatabase, userId: string, date: string): Promise<string[]> => {
    const rows = await db.getAllAsync(
      `SELECT tc.task_id
         FROM task_completion tc
         JOIN tasks t ON t.id = tc.task_id
        WHERE t.user_id = ?
          AND tc.date = ?`,
      userId,
      date
    );
    return rows.map((r: any) => r.task_id);
  }
};