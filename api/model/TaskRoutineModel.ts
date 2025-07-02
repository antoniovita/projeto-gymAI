import * as SQLite from 'expo-sqlite';

export interface TaskRoutine {
  task_id: string;
  routine_id: string;
}

export const TaskRoutineModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_routine (
        task_id    TEXT NOT NULL,
        routine_id TEXT NOT NULL,
        PRIMARY KEY (task_id, routine_id),
        FOREIGN KEY (task_id)   REFERENCES tasks(id)   ON DELETE CASCADE,
        FOREIGN KEY (routine_id) REFERENCES routine(id) ON DELETE CASCADE
      );
    `);
  },

  link: async (db: SQLite.SQLiteDatabase, taskId: string, routineId: string): Promise<void> => {
    await db.runAsync(
      `INSERT OR IGNORE INTO task_routine (task_id, routine_id) VALUES (?, ?)`,
      taskId,
      routineId
    );
  },

  unlink: async (db: SQLite.SQLiteDatabase, taskId: string, routineId: string): Promise<void> => {
    await db.runAsync(
      `DELETE FROM task_routine WHERE task_id = ? AND routine_id = ?`,
      taskId,
      routineId
    );
  },

  getRoutinesForTask: async (db: SQLite.SQLiteDatabase, taskId: string): Promise<string[]> => {
    const rows = await db.getAllAsync(
      `SELECT routine_id FROM task_routine WHERE task_id = ?`,
      taskId
    );
    return rows.map((r: any) => r.routine_id);
  },

  getTasksForRoutine: async (db: SQLite.SQLiteDatabase, routineId: string): Promise<string[]> => {
    const rows = await db.getAllAsync(
      `SELECT task_id FROM task_routine WHERE routine_id = ?`,
      routineId
    );
    return rows.map((r: any) => r.task_id);
  }
};