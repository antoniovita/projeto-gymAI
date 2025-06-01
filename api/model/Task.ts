import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Task {
  id: string;
  title: string;
  content: string;
  date: string;
  type?: string;
  completed: 0 | 1;
  user_id: string;
  routine_id?: string;
}

export const TaskModel = {

  // POST create a new task
  createTask: async (
    db: SQLite.SQLiteDatabase,
    title: string,
    content: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    const taskId = uuid.v4();

    const result = await db.runAsync(
      `INSERT INTO tasks (id, title, content, date, type, completed, user_id, routine_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      taskId,
      title,
      content,
      date,
      type ?? null,
      0, // completed default
      userId,
      routineId ?? null
    );
    return taskId;
  },

  // GET all tasks by user_id
  getTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ?',
      userId
    );
    return tasks as Task[];
  },

  // GET all tasks by type
  getTasksByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string) => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return tasks as Task[];
  },

  getTasksByDate: async (db: SQLite.SQLiteDatabase, userId: string, date: string) => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND date = ?',
      userId,
      date
    );
    return tasks as Task[];
  },

  // PUT update task completion by id
  updateTaskCompletion: async (db: SQLite.SQLiteDatabase, taskId: string, completed: 0 | 1) => {
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      completed,
      taskId
    );
    return result.changes;
  },

  // PUT update task content
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

  // DELETE task by id
  deleteTask: async (db: SQLite.SQLiteDatabase, taskId: string) => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE id = ?',
      taskId
    );
    return result.changes;
  },

  // DELETE clear all tasks by user_id
  clearTasksByUser: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE user_id = ?',
      userId
    );
    return result.changes;
  }
};
