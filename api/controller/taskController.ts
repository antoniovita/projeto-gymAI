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

  getTasksDebug: async () => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getAllTasksDebug(db);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar todas as tarefas para debug no controller:', error);
      return { success: false, error: 'Erro ao buscar todas as tarefas para debug.' };
    }
  },

  getTaskById: async (taskId: string) => {
    const db = getDb();
    try {
      const task = await TaskModel.getTaskById(db, taskId);
      if (task) {
        return { success: true, data: task };
      } else {
        return { success: false, error: 'Tarefa não encontrada.' };
      }
    } catch (error) {
      console.error('Erro ao buscar tarefa por ID no controller:', error);
      return { success: false, error: 'Erro ao buscar tarefa por ID.' };
    }
  },


};
