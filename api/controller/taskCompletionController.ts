import { getDb } from '../../database';
import { TaskCompletionModel } from '../model/TaskCompletionModel';

export const TaskCompletionController = {
  markDone: async (taskId: string, date: string) => {
    const db = getDb();
    try {
      await TaskCompletionModel.markDone(db, taskId, date);
      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar tarefa como feita:', error);
      return { success: false, error: 'Não foi possível marcar como feita.' };
    }
  },

  unmarkDone: async (taskId: string, date: string) => {
    const db = getDb();
    try {
      await TaskCompletionModel.unmarkDone(db, taskId, date);
      return { success: true };
    } catch (error) {
      console.error('Erro ao desmarcar tarefa:', error);
      return { success: false, error: 'Não foi possível desmarcar tarefa.' };
    }
  },

  isDone: async (taskId: string, date: string) => {
    const db = getDb();
    try {
      const done = await TaskCompletionModel.isDone(db, taskId, date);
      return { success: true, data: done };
    } catch (error) {
      console.error('Erro ao verificar conclusão:', error);
      return { success: false, error: 'Erro ao verificar conclusão.' };
    }
  },

  getDoneTasksForDate: async (userId: string, date: string) => {
    const db = getDb();
    try {
      const list = await TaskCompletionModel.getDoneTasksForDate(db, userId, date);
      return { success: true, data: list };
    } catch (error) {
      console.error('Erro ao listar tarefas concluídas:', error);
      return { success: false, error: 'Erro ao listar tarefas concluídas.' };
    }
  }
};
