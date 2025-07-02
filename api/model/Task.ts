import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string; // ISO string: "2025-06-12T07:12:00.000Z"
  type?: string;
  user_id: string;
}

export const TaskModel = {

  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        datetime TEXT NOT NULL,
        type TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
  },


  createTask: async (
    db: SQLite.SQLiteDatabase,
    title: string,
    content: string,
    datetime: string, // ISO string
    type: string | null,
    userId: string
  ): Promise<string> => {
    const taskId = uuid.v4() as string;

    await db.runAsync(
      `INSERT INTO tasks (id, title, content, datetime, type, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      taskId,
      title,
      content,
      datetime,
      type ?? null,
      userId
    );

    return taskId;
  },


  getTasksByUserId: async (
    db: SQLite.SQLiteDatabase,
    userId: string
  ): Promise<Task[]> => {
    return await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ?',
      userId
    ) as Task[];
  },

  updateTask: async (
    db: SQLite.SQLiteDatabase,
    taskId: string,
    updates: Partial<Task>
  ): Promise<number> => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return 0;

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);

    const result = await db.runAsync(
      `UPDATE tasks SET ${setClause} WHERE id = ?`,
      ...values,
      taskId
    );

    return result.changes;
  },


  deleteTask: async (
    db: SQLite.SQLiteDatabase,
    taskId: string
  ): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE id = ?',
      taskId
    );
    return result.changes;
  },

  clearTasksByUser: async (
    db: SQLite.SQLiteDatabase,
    userId: string
  ): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE user_id = ?',
      userId
    );
    return result.changes;
  },


  getAllTasksDebug: async (
    db: SQLite.SQLiteDatabase
  ): Promise<Task[]> => {
    try {
      const tasks = await db.getAllAsync('SELECT * FROM tasks');
      console.log('[DEBUG] Todas as tarefas no banco:', tasks);
      return tasks as Task[];
    } catch (err) {
      console.error('[DEBUG] Erro ao listar tarefas:', err);
      return [];
    }
  }
};
