import { getDb } from '../../database';
import { TaskModel } from '../model/Task';

//types
import { Task } from 'api/types/taskTypes';


export const TaskController = {
  createTask: async (
    title: string,
    content: string,
    datetime: string, // ISO string, ex: "2025-06-12T07:12:00.000Z"
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

  updateTaskCompletion: async (taskId: string, completed: 0 | 1, xp_awarded: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await TaskModel.updateTaskCompletion(db, taskId, completed, xp_awarded);
      return { success: changes > 0, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar conclusão da tarefa no controller:', error);
      return { success: false, error: 'Erro ao atualizar conclusão da tarefa.' };
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const db = getDb();
    try {
      // Validar datetime se presente
      if (updates.datetime) {
        const isoDate = new Date(updates.datetime);
        if (isNaN(isoDate.getTime())) {
          throw new RangeError('Datetime inválido');
        }
        updates.datetime = isoDate.toISOString();
      }

      const changes = await TaskModel.updateTask(db, taskId, updates);
      return { success: changes > 0, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar tarefa no controller:', error);
      return { success: false, error: 'Erro ao atualizar tarefa.' };
    }
  },

  deleteTask: async (taskId: string) => {
    const db = getDb();
    try {
      const changes = await TaskModel.deleteTask(db, taskId);
      return { success: changes > 0, deletedCount: changes };
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

  getAllTasksDebug: async () => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getAllTasksDebug(db);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar todas as tarefas para debug no controller:', error);
      return { success: false, error: 'Erro ao buscar todas as tarefas para debug.' };
    }
  },
};