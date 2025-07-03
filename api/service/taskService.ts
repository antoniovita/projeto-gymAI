import { Task } from 'api/model/Task';
import { TaskController } from '../controller/taskController';
import { getDb } from 'database';

export const TaskService = {
  createTask: async (
    title: string,
    content: string,
    datetime: string,  // string ISO: "2025-06-12T07:12:00.000Z"
    type: string,
    userId: string,
  ): Promise<string> => {
    const response = await TaskController.createTask(title, content, datetime, type, userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar tarefa.');
    }
    return response.taskId;
  },

  getTasks: async (userId: string): Promise<Task[]> => {
    const response = await TaskController.getTasks(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas.');
    }
    return response.data;
  },

  getTasksByTypeAndDate: async (userId: string, types: string[], date: string): Promise<Task[]> => {
    const response = await TaskController.getTasksByTypeAndDate(userId, types, date);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas por tipo e data.');
    }
    return response.data;
  },

  getTasksByType: async (userId: string, type: string): Promise<Task[]> => {
    const response = await TaskController.getTasksByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas por tipo.');
    }
    return response.data;
  },

  getTasksByDate: async (userId: string, date: string): Promise<Task[]> => {
    const response = await TaskController.getTasksByDate(userId, date);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas por data.');
    }
    return response.data;
  },

  getTasksByDateAndName: async (
    userId: string,
    date: string,
    name: string
  ): Promise<Task[]> => {
    const response = await TaskController.getTasksByDateAndName(userId, date, name);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas por data e nome.');
    }
    return response.data;
  },

  updateTaskCompletion: async (taskId: string, completed: 0 | 1): Promise<number> => {
    const response = await TaskController.updateCompletion(taskId, completed);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar status da tarefa.');
    }
    return response.updatedCount;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<number> => {
    const response = await TaskController.updateTask(taskId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar tarefa.');
    }
    return response.updatedCount;
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    const response = await TaskController.deleteTask(taskId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar tarefa.');
    }
    return true;
  },

  clearTasksByUser: async (userId: string): Promise<number> => {
    const response = await TaskController.clearTasksByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar tarefas.');
    }
    return response.deletedCount;
  },

  debugAllTasks: async (): Promise<Task[]> => {
    const db = getDb();
    return TaskController.debugAllTasks
      ? TaskController.debugAllTasks()
      : TaskModel.getAllTasksDebug(db);
  }
};
