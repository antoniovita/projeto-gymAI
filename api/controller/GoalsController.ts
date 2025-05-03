import { getDb } from 'database';
import { GoalsModel } from '../model/goals';

export const GoalController = {

  createGoal: async (userId: string, goalType: string) => {
    const db = getDb();
    try {
      const goalId = await GoalsModel.createGoal(db, userId, goalType);
      return { success: true, goalId };
    } catch (error) {
      console.error('Erro ao criar objetivo no controller:', error);
      return { success: false, error: 'Erro ao criar objetivo.' };
    }
  },

  getGoals: async (userId: string) => {
    const db = getDb();
    try {
      const goals = await GoalsModel.getGoalsByUserId(db, userId);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar objetivos no controller:', error);
      return { success: false, error: 'Erro ao buscar objetivos.' };
    }
  },

  getGoalsByType: async (userId: string, goalType: string) => {
    const db = getDb();
    try {
      const goals = await GoalsModel.getGoalsByType(db, userId, goalType);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar objetivos por tipo no controller:', error);
      return { success: false, error: 'Erro ao buscar objetivos por tipo.' };
    }
  },

  updateGoalCompletion: async (goalId: string, completed: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await GoalsModel.updateGoalCompletion(db, goalId, completed);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao atualizar objetivo no controller:', error);
      return { success: false, error: 'Erro ao atualizar objetivo.' };
    }
  },

  deleteGoal: async (goalId: string) => {
    const db = getDb();
    try {
      const changes = await GoalsModel.deleteGoal(db, goalId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar objetivo no controller:', error);
      return { success: false, error: 'Erro ao deletar objetivo.' };
    }
  },
};
