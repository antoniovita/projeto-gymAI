import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Workout {
  id: string;
  name: string;
  content: string;
  date: string;
  type?: string;
  user_id: string;
  routine_id?: string;
}

export const WorkoutModel = {

  // POST criar novo workout
  createWorkout: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    content: string,
    date: string,
    userId: string,
    type?: string,
    routineId?: string
  ) => {
    const workoutId = uuid.v4() as string;

    const result = await db.runAsync(
      `INSERT INTO workouts (id, name, content, date, type, user_id, routine_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      workoutId,
      name,
      content,
      date,
      type ?? null,
      userId,
      routineId ?? null
    );

    return workoutId;
  },

  // GET - pegar todos os workouts de um usuario
  getWorkoutsByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const workouts = await db.getAllAsync(
      'SELECT * FROM workouts WHERE user_id = ?',
      userId
    );
    return workouts as Workout[];
  },

  // GET - pegar workouts por tipo
  getWorkoutsByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string) => {
    const workouts = await db.getAllAsync(
      'SELECT * FROM workouts WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return workouts as Workout[];
  },

  // PUT - atualizar nome, conteúdo, data ou tipo do workout
  updateWorkout: async (
    db: SQLite.SQLiteDatabase,
    workoutId: string,
    updates: Partial<Omit<Workout, 'id' | 'user_id'>>
  ) => {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const result = await db.runAsync(
      `UPDATE workouts SET ${fields} WHERE id = ?`,
      ...values,
      workoutId
    );

    return result.changes;
  },

  // DELETE - deletar workout por id
  deleteWorkout: async (db: SQLite.SQLiteDatabase, workoutId: string) => {
    const result = await db.runAsync(
      'DELETE FROM workouts WHERE id = ?',
      workoutId
    );
    return result.changes;
  },

  // DELETE - limpar todos os workouts de um usuário
  clearWorkoutsByUser: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const result = await db.runAsync(
      'DELETE FROM workouts WHERE user_id = ?',
      userId
    );
    return result.changes;
  }
};
