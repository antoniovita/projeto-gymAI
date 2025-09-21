//general imports
import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

//types
import { Task } from 'api/types/taskTypes';


export const TaskModel = {

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
      `INSERT INTO tasks (id, title, content, datetime, type, completed, xp_awarded, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      taskId,
      title,
      content,
      datetime,
      type ?? null,
      0,
      0,
      userId,
    );
    return taskId;
  },

  getTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string): Promise<Task[]> => {
    return await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ?',
      userId
    ) as Task[];
  },

  getTaskById: async (
    db: SQLite.SQLiteDatabase,
    taskId: string
  ): Promise<Task | null> => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE id = ?',
      taskId
    ) as Task[];
    return tasks.length > 0 ? tasks[0] : null;
  },

  updateTaskCompletion: async (
    db: SQLite.SQLiteDatabase,
    taskId: string,
    completed: 0 | 1,
    xp_awarded: 0 | 1
  ): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ?, xp_awarded = ? WHERE id = ?',
      completed,
      xp_awarded,
      taskId
    );
    return result.changes;
  },

  updateTask: async (db: SQLite.SQLiteDatabase, taskId: string, updates: Partial<Task>): Promise<number> => {
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

  deleteTask: async (db: SQLite.SQLiteDatabase, taskId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE id = ?',
      taskId
    );
    return result.changes;
  },

  clearTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE user_id = ?',
      userId
    );
    return result.changes;
  },

  getAllTasksDebug: async (db: SQLite.SQLiteDatabase): Promise<Task[]> => {
    try {
      const tasks = await db.getAllAsync('SELECT * FROM tasks') as Task[];
      console.log('[DEBUG] Todas as tarefas no banco:', tasks);
      return tasks;
    } catch (err) {
      console.error('[DEBUG] Erro ao listar tarefas:', err);
      return [];
    }
  },
};