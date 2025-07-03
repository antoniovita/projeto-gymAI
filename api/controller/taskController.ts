import { getDb } from '../../database';
import { Task, TaskModel } from '../model/Task';

export const TaskController = {
  createTask: async (
    title: string,
    content: string,
    datetime: string,  // ISO string, ex: "2025-06-12T07:12:00.000Z"
    type: string,
    userId: string,
  ) => {
    const db = getDb();
    try {
      const isoDate = new Date(datetime);
      if (isNaN(isoDate.getTime())) {
        throw new RangeError('Datetime inválido');
      }

      const taskId = await TaskModel.createTask(
        db,
        title,
        content,
        isoDate.toISOString(),
        type,
        userId,
      );

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

  getTasksByDate: async (userId: string, date: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByDate(db, userId, date);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas por data no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefas por data.' };
    }
  },

  getTasksByTypeAndDate: async (userId: string, types: string[], date: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByTypeAndDate(db, userId, types, date);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas por tipo e data no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefas por tipo e data.' };
    }
  },

  getTasksByDateAndName: async (
    userId: string,
    date: string,     
    name: string
  ) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByDateAndName(
        db,
        userId,
        date,
        name
      );
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas por data e nome no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefas por data e nome.' };
    }
  },

  updateCompletion: async (taskId: string, completed: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await TaskModel.updateTaskCompletion(db, taskId, completed);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar conclusão da tarefa no controller:', error);
      return { success: false, error: 'Erro ao atualizar tarefa.' };
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const db = getDb();
    try {
      const changes = await TaskModel.updateTask(db, taskId, updates);
      return { success: true, updatedCount: changes };
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
