import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

//types
import { Exercise, Workout } from 'api/types/workoutTypes';



export const WorkoutModel = {

  // POST - criar novo workout
  createWorkout: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    exercises: Exercise[],
    date: string,
    userId: string,
    type?: string,
  ) => {
    const workoutId = uuid.v4() as string;
    const exercisesJson = JSON.stringify(exercises);

    await db.runAsync(
      `INSERT INTO workouts (id, name, exercises, date, type, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      workoutId,
      name,
      exercisesJson,
      date,
      type ?? null,
      userId,
    );

    return workoutId;
  },

  // GET - pegar todos os workouts de um usuário
  getWorkoutsByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const workouts = await db.getAllAsync(
      'SELECT * FROM workouts WHERE user_id = ?',
      userId
    );

    return workouts.map((workout: any) => ({
      ...workout,
      exercises: JSON.parse(workout.exercises),
    })) as Workout[];
  },

  // GET - pegar workout por ID
  getWorkoutById: async (db: SQLite.SQLiteDatabase, userId: string, workoutId: string) => {
    const workout = await db.getFirstAsync(
      'SELECT * FROM workouts WHERE user_id = ? AND id = ?',
      userId,
      workoutId
    )
    return workout
  },

  // PUT - atualizar workout
  updateWorkout: async (
  db: SQLite.SQLiteDatabase,
  workoutId: string,
  updates: Partial<Omit<Workout, 'id' | 'user_id'>>
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }

  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }

  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }

  if (updates.exercises !== undefined) {
    fields.push('exercises = ?');
    values.push(JSON.stringify(updates.exercises));
  }

  if (fields.length === 0) return 0;

  const result = await db.runAsync(
    `UPDATE workouts SET ${fields.join(', ')} WHERE id = ?`,
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
