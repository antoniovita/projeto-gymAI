import { getDb } from '../../database';
import { WorkoutModel } from '../model/Workout';

//types
import { Exercise } from 'api/types/workoutTypes';


export const WorkoutController = {

  // cria workout 
  createWorkout: async (
    name: string,
    exercises: Exercise[],
    date: string,
    userId: string,
    type?: string,
  ) => {
    const db = getDb();
    try {
      const workoutId = await WorkoutModel.createWorkout(
        db,
        name,
        exercises,
        date,
        userId,
        type,
      );
      return { success: true, workoutId };
    } catch (error) {
      console.error('Erro ao criar workout no controller:', error);
      return { success: false, error: 'Erro ao criar workout.' };
    }
  },

  // pega todos os workouts de um usuário
  getWorkouts: async (userId: string) => {
    const db = getDb();
    try {
      const workouts = await WorkoutModel.getWorkoutsByUserId(db, userId);
      return { success: true, data: workouts };
    } catch (error) {
      console.error('Erro ao buscar workouts no controller:', error);
      return { success: false, error: 'Erro ao buscar workouts.' };
    }
  },

  // pega workout por ID
  getWorkoutById: async (userId: string, workoutId: string) => {
    const db = getDb();
    try {
      const workout = await WorkoutModel.getWorkoutById(db, userId, workoutId);
      if (!workout) {
        return { success: false, error: 'Workout não encontrado.' };
      }
      return { success: true, data: workout };
    } catch (error) {
      console.error('Erro ao buscar workout por ID no controller:', error);
      return { success: false, error: 'Erro ao buscar workout por ID.' };
    }
  },


  // atualiza um workout por id
  updateWorkout: async (
    workoutId: string,
    updates: Partial<{
      name: string;
      exercises: Exercise[];
      date: string;
      type: string;
    }>
  ) => {
    const db = getDb();
    try {
      const changes = await WorkoutModel.updateWorkout(db, workoutId, updates);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar workout no controller:', error);
      return { success: false, error: 'Erro ao atualizar workout.' };
    }
  },

  // deleta workout por id
  deleteWorkout: async (workoutId: string) => {
    const db = getDb();
    try {
      const changes = await WorkoutModel.deleteWorkout(db, workoutId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar workout no controller:', error);
      return { success: false, error: 'Erro ao deletar workout.' };
    }
  },

  // limpa todos os workouts de um usuário
  clearWorkoutsByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await WorkoutModel.clearWorkoutsByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar workouts no controller:', error);
      return { success: false, error: 'Erro ao limpar workouts.' };
    }
  },
};
