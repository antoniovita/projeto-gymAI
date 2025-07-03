import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string; // ISO string: "2025-06-12T07:12:00.000Z"
  type?: string;
  completed: 0 | 1;
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
        completed INTEGER DEFAULT 0,
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
    type: string,
    userId: string,
  ) => {
    const taskId = uuid.v4() as string;

    await db.runAsync(
      `INSERT INTO tasks (id, title, content, datetime, type, completed, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      taskId,
      title,
      content,
      datetime,
      type ?? null,
      0,
      userId,
    );

    return taskId;
  },

  getTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    return await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ?',
      userId
    ) as Task[];
  },

  getTasksByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string) => {
    return await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND type = ?',
      userId,
      type
    ) as Task[];
  },

  getTasksByTypeAndDate: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    types: string[],
    date: string // formato: "YYYY-MM-DD"
  ) => {
    if (types.length === 0) return [];

    const placeholders = types.map(() => 'type LIKE ?').join(' OR ');
    const query = `
      SELECT * FROM tasks
      WHERE user_id = ?
      AND DATE(datetime) = ?
      AND (${placeholders})
    `;
    const params = [userId, date, ...types.map((type) => `%${type}%`)];
    return await db.getAllAsync(query, ...params) as Task[];
  },

  getTasksByDate: async (db: SQLite.SQLiteDatabase, userId: string, date: string) => {
    return await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND DATE(datetime) = ?',
      userId,
      date
    ) as Task[];
  },

  updateTaskCompletion: async (db: SQLite.SQLiteDatabase, taskId: string, completed: 0 | 1) => {
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      completed,
      taskId
    );
    return result.changes;
  },

  updateTask: async (db: SQLite.SQLiteDatabase, taskId: string, updates: Partial<Task>) => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return 0;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);

    const result = await db.runAsync(
      `UPDATE tasks SET ${setClause} WHERE id = ?`,
      ...values,
      taskId
    );

    return result.changes;
  },

  deleteTask: async (db: SQLite.SQLiteDatabase, taskId: string) => {
    const result = await db.runAsync('DELETE FROM tasks WHERE id = ?', taskId);
    return result.changes;
  },

  clearTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const result = await db.runAsync('DELETE FROM tasks WHERE user_id = ?', userId);
    return result.changes;
  },

  getAllTasksDebug: async (db: SQLite.SQLiteDatabase) => {
    try {
      const tasks = await db.getAllAsync('SELECT * FROM tasks');
      console.log('[DEBUG] Todas as tarefas no banco:', tasks);
      return tasks;
    } catch (err) {
      console.error('[DEBUG] Erro ao listar tarefas:', err);
      return [];
    }
  }
};
