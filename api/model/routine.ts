import * as SQLite from 'expo-sqlite';

export interface Routine {
    id: number;
    user_id: number;
    day_of_week: string;
  }
  
  export const RoutineModel = {
    
    // POST a new routine in a weekday
    createRoutine: async (db: SQLite.SQLiteDatabase, userId: number, dayOfWeek: string) => {
      const result = await db.runAsync(
        'INSERT INTO routine (user_id, day_of_week) VALUES (?, ?)', 
        userId, 
        dayOfWeek
      );
      return result.lastInsertRowId;
    },
  
    // GET all routines by user_id
    getRoutinesByUserId: async (db: SQLite.SQLiteDatabase, userId: number) => {
      const routines = await db.getAllAsync('SELECT * FROM routine WHERE user_id = ?', userId);
      return routines;
    },


    // GET weekday routine by user_id and day_of_week
    getDayRoutineByUserId: async (db: SQLite.SQLiteDatabase, userId: number, dayOfWeek: string) => {
        const routines = await db.getAllAsync(
        'SELECT * FROM routine WHERE user_id = ? AND day_of_week = ?',
        userId,
        dayOfWeek
        );
        return routines;
    },

  
    // DELETE a routine by id
    deleteRoutine: async (db: SQLite.SQLiteDatabase, routineId: number) => {
      const result = await db.runAsync(
        'DELETE FROM routine WHERE id = ?',
        routineId
      );
      return result.changes; // Retorna a quantidade de linhas afetadas (deve ser 1 se a exclusão foi bem-sucedida)
    },
  };
  
  