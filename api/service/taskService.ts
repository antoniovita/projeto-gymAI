import { Task, TaskModel } from '../model/Task';
import { TaskController } from '../controller/taskController';
import { getDb } from '../../database';

export const TaskService = {

  createTask: async (
    title: string,
    content: string,
    datetime: string,  // ISO string: "2025-06-12T07:12:00.000Z"
    type: string,
    userId: string
  ): Promise<string> => {
    const response = await TaskController.createTask(
      title,
      content,
      datetime,
      type,
      userId
    );
    if (!response.success || typeof response.taskId !== 'string') {
      throw new Error(response.error || 'Erro ao criar tarefa.');
    }
    return response.taskId;
  },

  getTasks: async (userId: string): Promise<Task[]> => {
    const response = await TaskController.getTasks(userId);
    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.error || 'Erro ao buscar tarefas.');
    }
    return response.data;
  },

  updateTask: async (
    taskId: string,
    updates: Partial<Task>
  ): Promise<number> => {
    const response = await TaskController.updateTask(taskId, updates);
    if (!response.success || typeof response.updatedCount !== 'number') {
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
    if (!response.success || typeof response.deletedCount !== 'number') {
      throw new Error(response.error || 'Erro ao limpar tarefas.');
    }
    return response.deletedCount;
  },

  debugAllTasks: async (): Promise<Task[]> => {
    const db = getDb();
    return TaskModel.getAllTasksDebug(db);
  }
};
