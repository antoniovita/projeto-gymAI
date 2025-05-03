import { v4 as uuidv4 } from 'uuid';
import * as SQLite from 'expo-sqlite';

export interface Task {
  id: string;
  title: string;
  description: string;
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
    description: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    const taskId = uuidv4();

    const result = await db.runAsync(
      `INSERT INTO tasks (id, title, description, date, type, user_id, routine_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      taskId, 
      title,
      description,
      date,
      type ?? null,
      userId,
      routineId ?? null
    );
    return taskId;
  },

  // GET all tasks by user_id
  getTasksByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const tasks = await db.getAllAsync('SELECT * FROM tasks WHERE user_id = ?', userId);
    return tasks;
  },

  // GET all tasks by type
  getTasksByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string) => {
    const tasks = await db.getAllAsync(
      'SELECT * FROM tasks WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return tasks;
  },

  // PUT update task by id - 0 = false, 1 = true 
  updateTaskCompletion: async (db: SQLite.SQLiteDatabase, taskId: string, completed: 0 | 1) => {
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      completed,
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
