import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Routine {
  id: string;
  user_id: string;
  day_of_week: string;
}

export const RoutineModel = {
  
  // POST - cria uma nova rotina para o dia da semana
  createRoutine: async (
    db: SQLite.SQLiteDatabase, 
    userId: string, 
    dayOfWeek: string
  ) => {
    const routineId = uuid.v4() as string;
    
    await db.runAsync(
      'INSERT INTO routine (id, user_id, day_of_week) VALUES (?, ?, ?)', 
      routineId, 
      userId, 
      dayOfWeek
    );
    return routineId;
  },

  // GET - busca todas as rotinas de um usuário
  getRoutinesByUserId: async (
    db: SQLite.SQLiteDatabase, 
    userId: string
  ) => {
    const routines = await db.getAllAsync(
      'SELECT * FROM routine WHERE user_id = ?', 
      userId
    );
    return routines as Routine[];
  },

  // GET - busca rotina de um dia específico por user_id
  getDayRoutineByUserId: async (
    db: SQLite.SQLiteDatabase, 
    userId: string, 
    dayOfWeek: string
  ) => {
    const routines = await db.getAllAsync(
      'SELECT * FROM routine WHERE user_id = ? AND day_of_week = ?',
      userId,
      dayOfWeek
    );
    return routines as Routine[];
  },

  // DELETE - deleta uma rotina por id
  deleteRoutine: async (
    db: SQLite.SQLiteDatabase, 
    routineId: string
  ) => {
    const result = await db.runAsync(
      'DELETE FROM routine WHERE id = ?', 
      routineId
    );
    return result.changes;
  },
};
