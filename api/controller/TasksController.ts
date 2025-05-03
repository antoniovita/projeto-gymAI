import { getDb } from '../../database';
import { TaskModel } from '../model/task';

export const TaskController = {

  createTask: async (
    title: string,
    description: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    const db = getDb();
    try {
      const taskId = await TaskModel.createTask(db, title, description, date, type, userId, routineId);
      return { success: true, taskId };
    } catch (error) {
      console.error('Erro ao criar tarefa no controller:', error);
      return { success: false, error: 'Erro ao criar tarefa.' };
    }
  },

  getTasks: async (userId: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByUserId(db, userId);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefas.' };
    }
  },

  getTasksByType: async (userId: string, type: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByType(db, userId, type);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas por tipo no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefas por tipo.' };
    }
  },

  updateCompletion: async (taskId: string, completed: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await TaskModel.updateTaskCompletion(db, taskId, completed);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao atualizar tarefa no controller:', error);
      return { success: false, error: 'Erro ao atualizar tarefa.' };
    }
  },

  deleteTask: async (taskId: string) => {
    const db = getDb();
    try {
      const changes = await TaskModel.deleteTask(db, taskId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar tarefa no controller:', error);
      return { success: false, error: 'Erro ao deletar tarefa.' };
    }
  },

  clearTasksByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await TaskModel.clearTasksByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar tarefas no controller:', error);
      return { success: false, error: 'Erro ao limpar tarefas.' };
    }
  },
};
