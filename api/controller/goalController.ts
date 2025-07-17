import { getDb } from '../../database';
import { Goal, GoalModel } from '../model/Goal';

export const GoalController = {
  createGoal: async (
    name: string,
    description: string,
    createdAt: string,
    deadline: string | null,
    userId: string,
  ) => {
    const db = getDb();
    try {
      const isoCreated = new Date(createdAt);
      if (isNaN(isoCreated.getTime())) throw new RangeError('Data de criação inválida');

      if (deadline) {
        const isoDeadline = new Date(deadline);
        if (isNaN(isoDeadline.getTime())) throw new RangeError('Data de deadline inválida');
      }

      const goalId = await GoalModel.createGoal(
        db,
        name,
        description,
        isoCreated.toISOString(),
        deadline,
        userId
      );

      return { success: true, goalId };
    } catch (error) {
      console.error('Erro ao criar goal no controller:', error);
      return { success: false, error: 'Erro ao criar goal.' };
    }
  },

  getGoals: async (userId: string) => {
    const db = getDb();
    try {
      const goals = await GoalModel.getGoalsByUserId(db, userId);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar goals no controller:', error);
      return { success: false, error: 'Erro ao buscar goals.' };
    }
  },

  getGoalById: async (goalId: string) => {
    const db = getDb();
    try {
      const goal = await GoalModel.getGoalById(db, goalId);
      if (goal) {
        return { success: true, data: goal };
      } else {
        return { success: false, error: 'Goal não encontrado.' };
      }
    } catch (error) {
      console.error('Erro ao buscar goal por ID:', error);
      return { success: false, error: 'Erro ao buscar goal por ID.' };
    }
  },

  updateGoalProgress: async (goalId: string, progress: number) => {
    const db = getDb();
    try {
      const clampedProgress = Math.max(0, Math.min(100, progress));
      const changes = await GoalModel.updateGoalProgress(db, goalId, clampedProgress);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar progresso do goal:', error);
      return { success: false, error: 'Erro ao atualizar progresso.' };
    }
  },

  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    const db = getDb();
    try {
      const changes = await GoalModel.updateGoal(db, goalId, updates);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar goal:', error);
      return { success: false, error: 'Erro ao atualizar goal.' };
    }
  },

  deleteGoal: async (goalId: string) => {
    const db = getDb();
    try {
      const changes = await GoalModel.deleteGoal(db, goalId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar goal:', error);
      return { success: false, error: 'Erro ao deletar goal.' };
    }
  },

  clearGoalsByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await GoalModel.clearGoalsByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar goals do usuário:', error);
      return { success: false, error: 'Erro ao limpar goals.' };
    }
  },

  getGoalsDebug: async () => {
    const db = getDb();
    try {
      const goals = await GoalModel.getAllGoalsDebug(db);
      return { success: true, data: goals };
    } catch (error) {
      console.error('Erro ao buscar goals para debug:', error);
      return { success: false, error: 'Erro ao buscar goals debug.' };
    }
  },
};
