import { v4 as uuidv4 } from 'uuid';
import * as SQLite from 'expo-sqlite';

export interface Routine {
  id: string;
  user_id: string;
  day_of_week: string;
}

export const RoutineModel = {
  
  // POST a new routine in a weekday
  createRoutine: async (db: SQLite.SQLiteDatabase, userId: string, dayOfWeek: string) => {
    const routineId = uuidv4();
    
    const result = await db.runAsync(
      'INSERT INTO routine (id, user_id, day_of_week) VALUES (?, ?, ?)', 
      routineId, 
      userId, 
      dayOfWeek
    );
    return routineId;
  },

  // GET all routines by user_id
  getRoutinesByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const routines = await db.getAllAsync('SELECT * FROM routine WHERE user_id = ?', userId);
    return routines;
  },

  // GET weekday routine by user_id and day_of_week
  getDayRoutineByUserId: async (db: SQLite.SQLiteDatabase, userId: string, dayOfWeek: string) => {
    const routines = await db.getAllAsync(
      'SELECT * FROM routine WHERE user_id = ? AND day_of_week = ?',
      userId,
      dayOfWeek
    );
    return routines;
  },

  // DELETE a routine by id
  deleteRoutine: async (db: SQLite.SQLiteDatabase, routineId: string) => {
    const result = await db.runAsync(
      'DELETE FROM routine WHERE id = ?',
      routineId
    );
    return result.changes;
  },
};
