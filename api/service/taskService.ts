import { TaskController } from '../controller/taskController';

//types
import { Task } from 'api/types/taskTypes';

export const TaskService = {
  createTask: async (
    title: string,
    content: string,
    datetime: string, // string ISO: "2025-06-12T07:12:00.000Z"
    type: string,
    userId: string,
  ): Promise<string> => {
    const response = await TaskController.createTask(title, content, datetime, type, userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar tarefa.');
    }
    return response.taskId!;
  },

  getTasks: async (userId: string): Promise<Task[]> => {
    const response = await TaskController.getTasks(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas.');
    }
    return response.data!;
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await TaskController.getTaskById(taskId);
    if (!response.success) {
      throw new Error(response.error || 'Tarefa não encontrada.');
    }
    return response.data!;
  },

  updateTaskCompletion: async (taskId: string, completed: 0 | 1, xp_awarded: 0 | 1): Promise<number> => {
    const response = await TaskController.updateTaskCompletion(taskId, completed, xp_awarded);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar status da tarefa.');
    }
    return response.updatedCount!;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<number> => {
    const response = await TaskController.updateTask(taskId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar tarefa.');
    }
    return response.updatedCount!;
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    const response = await TaskController.deleteTask(taskId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar tarefa.');
    }
    return response.deletedCount! > 0;
  },

  clearTasksByUser: async (userId: string): Promise<number> => {
    const response = await TaskController.clearTasksByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar tarefas.');
    }
    return response.deletedCount!;
  },

  getAllTasksDebug: async (): Promise<Task[]> => {
    const response = await TaskController.getAllTasksDebug();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar todas as tarefas para debug.');
    }
    return response.data!;
  },
};