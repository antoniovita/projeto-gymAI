import * as SQLite from 'expo-sqlite';

export interface Goal {
  id: number;
  user_id: number;
  goal_type: string;
  deadline: string;
  completed: 0 | 1;
}

export const GoalsModel = {

    //CREATE GOAL
    createGoal: async (
    db: SQLite.SQLiteDatabase,
    userId: number,
    goalType: string,
    deadline: string
  ) => {
    const result = await db.runAsync(
      'INSERT INTO goals (user_id, goal_type, deadline) VALUES (?, ?, ?)',
      userId,
      goalType,
      deadline
    );
    return result.lastInsertRowId;
  },

  //GET ALL GOALS
  getGoalsByUserId: async (db: SQLite.SQLiteDatabase, userId: number) => {
    const goals = await db.getAllAsync('SELECT * FROM goals WHERE user_id = ?', userId);
    return goals;
  },

    //GET GOAL BY TYPE
  getGoalsByType: async (
    db: SQLite.SQLiteDatabase,
    userId: number,
    goalType: string
  ) => {
    const goals = await db.getAllAsync(
      'SELECT * FROM goals WHERE user_id = ? AND goal_type = ?',
      userId,
      goalType
    );
    return goals;
  },

  //UPDATE goal completion
  updateGoalCompletion: async (
    db: SQLite.SQLiteDatabase,
    goalId: number,
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
  deleteGoal: async (db: SQLite.SQLiteDatabase, goalId: number) => {
    const result = await db.runAsync('DELETE FROM goals WHERE id = ?', goalId);
    return result.changes;
  }
};
