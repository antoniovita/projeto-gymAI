import { WorkoutController } from '../controller/workoutController';
import { Exercise } from '../model/Workout';

export const WorkoutService = {

  // Cria um novo workout
  createWorkout: async (
    name: string,
    exercises: Exercise[],
    date: string,
    userId: string,
    type?: string,
  ) => {
    const response = await WorkoutController.createWorkout(name, exercises, date, userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar workout.');
    }
    return response.workoutId;
  },

  // Retorna todos os workouts de um usuário
  getWorkouts: async (userId: string) => {
    const response = await WorkoutController.getWorkouts(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar workouts.');
    }
    return response.data;
  },

  // Retorna um workout específico pelo ID
  getWorkoutById: async (userId: string, workoutId: string) => {
    const response = await WorkoutController.getWorkoutById(userId, workoutId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar workout por ID.');
    }
    return response.data;
  },


  // Atualiza campos de um workout por ID
  updateWorkout: async (
    workoutId: string,
    updates: Partial<{
      name?: string;
      exercises?: Exercise[];
      date?: string;
      type?: string;
    }>
  ) => {
    const response = await WorkoutController.updateWorkout(workoutId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar workout.');
    }
    return response.updatedCount;
  },

  // Remove um workout por ID
  deleteWorkout: async (workoutId: string) => {
    const response = await WorkoutController.deleteWorkout(workoutId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar workout.');
    }
    return true;
  },

  // Remove todos os workouts de um usuário
  clearWorkoutsByUser: async (userId: string) => {
    const response = await WorkoutController.clearWorkoutsByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar workouts.');
    }
    return response.deletedCount;
  }
};
