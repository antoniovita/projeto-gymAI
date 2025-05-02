import * as SQLite from 'expo-sqlite';

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  type?: string;
  completed: number;
  user_id: number;
  routine_id?: number; // pode ser opcional
}

export const TaskModel = {

    // POST create a new task
  createTask: async (
    db: SQLite.SQLiteDatabase,
    title: string,
    description: string,
    date: string,
    type: string,
    userId: number,
    routineId?: number
  ) => {
    const result = await db.runAsync(
      `INSERT INTO tasks (title, description, date, type, user_id, routine_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      title,
      description,
      date,
      type ?? null,
      userId,
      routineId ?? null
    );
    return result.lastInsertRowId;
  },

  // GET all tasks by user_id
  getTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: number) => {
    const tasks = await db.getAllAsync('SELECT * FROM tasks WHERE user_id = ?', userId);
    return tasks;
  },

  // GET all tasks by type
  getTasksByType: async (db: SQLite.SQLiteDatabase, userId: number, type: string) => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return tasks;
  },

  // PUT update task by id - 0 = false, 1 = true 
  updateTaskCompletion: async (db: SQLite.SQLiteDatabase, taskId: number, completed: number) => {
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      completed,
      taskId
    );
    return result.changes;
  },

  // DELETE task by id
  deleteTask: async (db: SQLite.SQLiteDatabase, taskId: number) => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE id = ?',
      taskId
    );
    return result.changes;
  },

  // DELETE clear all tasks by user_id
  clearTasksByUser: async (db: SQLite.SQLiteDatabase, userId: number) => {
    const result = await db.runAsync(
      'DELETE FROM tasks WHERE user_id = ?',
      userId
    );
    return result.changes;
  }
};
