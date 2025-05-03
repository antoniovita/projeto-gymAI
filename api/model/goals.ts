import { v4 as uuidv4 } from 'uuid';
import * as SQLite from 'expo-sqlite';

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  completed: 0 | 1;
}

export const GoalsModel = {
  
  // CREATE GOAL
  createGoal: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    goalType: string,
  ) => {
    const goalId = uuidv4();

    const result = await db.runAsync(
      'INSERT INTO goals (id, user_id, goal_type) VALUES (?, ?, ?)',
      goalId,
      userId,
      goalType,
    );
    return goalId;
  },

  // GET ALL GOALS
  getGoalsByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const goals = await db.getAllAsync('SELECT * FROM goals WHERE user_id = ?', userId);
    return goals;
  },

  // GET GOAL BY TYPE
  getGoalsByType: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    goalType: string
  ) => {
    const goals = await db.getAllAsync(
      'SELECT * FROM goals WHERE user_id = ? AND goal_type = ?',
      userId,
      goalType
    );
    return goals;
  },

  // UPDATE goal completion
  updateGoalCompletion: async (
    db: SQLite.SQLiteDatabase,
    goalId: string,
    completed: 0 | 1
  ) => {
    const result = await db.runAsync(
      'UPDATE goals SET completed = ? WHERE id = ?',
      completed,
      goalId
    );
    return result.changes;
  },

  // DELETE goal
  deleteGoal: async (db: SQLite.SQLiteDatabase, goalId: string) => {
    const result = await db.runAsync('DELETE FROM goals WHERE id = ?', goalId);
    return result.changes;
  }
};
