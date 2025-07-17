import { Goal } from 'api/model/Goal';
import { GoalController } from '../controller/goalController';

export const GoalService = {
  createGoal: async (
    name: string,
    description: string,
    createdAt: string, // ISO string
    deadline: string | null,
    userId: string,
  ): Promise<string> => {
    const response = await GoalController.createGoal(name, description, createdAt, deadline, userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar meta.');
    }
    return response.goalId!;
  },

  getGoals: async (userId: string): Promise<Goal[]> => {
    const response = await GoalController.getGoals(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar metas.');
    }
    return response.data!;
  },

  getGoalById: async (goalId: string): Promise<Goal> => {
    const response = await GoalController.getGoalById(goalId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar meta por ID.');
    }
    return response.data!;
  },

  updateGoal: async (goalId: string, updates: Partial<Goal>): Promise<number> => {
    const response = await GoalController.updateGoal(goalId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar meta.');
    }
    return response.updatedCount!;
  },

  updateProgress: async (goalId: string, progress: number): Promise<number> => {
    const response = await GoalController.updateGoalProgress(goalId, progress);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar progresso da meta.');
    }
    return response.updatedCount!;
  },

  deleteGoal: async (goalId: string): Promise<boolean> => {
    const response = await GoalController.deleteGoal(goalId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar meta.');
    }
    return true;
  },

  clearGoalsByUser: async (userId: string): Promise<number> => {
    const response = await GoalController.clearGoalsByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar metas.');
    }
    return response.deletedCount!;
  },

  debugAllGoals: async (): Promise<Goal[]> => {
    const response = await GoalController.getGoalsDebug();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar metas para debug.');
    }
    return response.data!;
  },
};
