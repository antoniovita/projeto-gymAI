import { getDb } from '../../database';
import { GoalsModel } from '../model/goals';

export const GoalController = {

  // POST create a new goal
  createGoal: async (userId: string, goalType: string) => {
    const db = getDb();
    try {
      const goalId = await GoalsModel.createGoal(db, userId, goalType);
      return { success: true, goalId };
    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      return { success: false, error: 'Erro ao criar objetivo.' };
    }
  },

  // GET all goals by userId
  getGoals: async (userId: string) => {
    const db = getDb();
    try {
      const goals = await GoalsModel.getGoalsByUserId(db, userId);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar objetivos:', error);
      return { success: false, error: 'Erro ao buscar objetivos.' };
    }
  },

  // GET goals by type
  getGoalsByType: async (userId: string, goalType: string) => {
    const db = getDb();
    try {
      const goals = await GoalsModel.getGoalsByType(db, userId, goalType);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar objetivos por tipo:', error);
      return { success: false, error: 'Erro ao buscar objetivos por tipo.' };
    }
  },

  // PUT update goal completion status
  updateGoalCompletion: async (goalId: string, completed: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await GoalsModel.updateGoalCompletion(db, goalId, completed);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      return { success: false, error: 'Erro ao atualizar objetivo.' };
    }
  },

  // DELETE goal
  deleteGoal: async (goalId: string) => {
    const db = getDb();
    try {
      const changes = await GoalsModel.deleteGoal(db, goalId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar objetivo:', error);
      return { success: false, error: 'Erro ao deletar objetivo.' };
    }
  },
};
