import { WorkoutController } from '../controller/workoutController';

export const WorkoutService = {

  createWorkout: async (
    name: string,
    content: string,
    date: string,
    userId: string,
    type?: string,
  ) => {
    const response = await WorkoutController.createWorkout(name, content, date, userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar workout.');
    }
    return response.workoutId;
  },

  getWorkouts: async (userId: string) => {
    const response = await WorkoutController.getWorkouts(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar workouts.');
    }
    return response.data;
  },

  getWorkoutsByType: async (userId: string, type: string) => {
    const response = await WorkoutController.getWorkoutsByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar workouts por tipo.');
    }
    return response.data;
  },

  updateWorkout: async (
    workoutId: string,
    updates: Partial<{
      name?: string;
      content?: string;
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

  deleteWorkout: async (workoutId: string) => {
    const response = await WorkoutController.deleteWorkout(workoutId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar workout.');
    }
    return true;
  },

  clearWorkoutsByUser: async (userId: string) => {
    const response = await WorkoutController.clearWorkoutsByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar workouts.');
    }
    return response.deletedCount;
  }
};
