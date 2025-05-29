import { TaskController } from '../controller/taskController';

export const TaskService = {

    createTask: async (
    title: string,
    content: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    const response = await TaskController.createTask(title, content, date, type, userId, routineId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar tarefa.');
    }
    return response.taskId;
  },

  getTasks: async (userId: string) => {
    const response = await TaskController.getTasks(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas.');
    }
    return response.data;
  },

  getTasksByType: async (userId: string, type: string) => {
    const response = await TaskController.getTasksByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar tarefas por tipo.');
    }
    return response.data;
  },

  updateTaskCompletion: async (taskId: string, completed: 0 | 1) => {
    const response = await TaskController.updateCompletion(taskId, completed);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar status da tarefa.');
    }
    return response.updatedCount;
  },

  deleteTask: async (taskId: string) => {
    const response = await TaskController.deleteTask(taskId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar tarefa.');
    }
    return true;
  },

  clearTasksByUser: async (userId: string) => {
    const response = await TaskController.clearTasksByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar tarefas.');
    }
    return response.deletedCount;
  }
};
