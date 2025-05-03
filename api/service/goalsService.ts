import { GoalController } from '../controller/GoalsController';

export const GoalService = {

  createGoal: async (userId: string, goalType: string) => {
    try {
      const result = await GoalController.createGoal(userId, goalType);
      return result;
    } catch (error) {
      console.error('Erro ao criar objetivo no serviço:', error);
      return { success: false, error: 'Erro ao criar objetivo.' };
    }
  },

  getGoals: async (userId: string) => {
    try {
      const result = await GoalController.getGoals(userId);
      return result;
    } catch (error) {
      console.error('Erro ao buscar objetivos no serviço:', error);
      return { success: false, error: 'Erro ao buscar objetivos.' };
    }
  },

  getGoalsByType: async (userId: string, goalType: string) => {
    try {
      const result = await GoalController.getGoalsByType(userId, goalType);
      return result;
    } catch (error) {
      console.error('Erro ao buscar objetivos por tipo no serviço:', error);
      return { success: false, error: 'Erro ao buscar objetivos por tipo.' };
    }
  },

  updateGoalCompletion: async (goalId: string, completed: 0 | 1) => {
    try {
      const result = await GoalController.updateGoalCompletion(goalId, completed);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar objetivo no serviço:', error);
      return { success: false, error: 'Erro ao atualizar objetivo.' };
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      const result = await GoalController.deleteGoal(goalId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar objetivo no serviço:', error);
      return { success: false, error: 'Erro ao deletar objetivo.' };
    }
  },
};
