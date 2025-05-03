import { TaskController } from '../controller/TasksController';

export const TaskService = {

  createTask: async (
    title: string,
    description: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    try {
      const response = await TaskController.createTask(
        title,
        description,
        date,
        type,
        userId,
        routineId
      );
      return response;
    } catch (error) {
      console.error('Erro no serviço de criação de tarefa:', error);
      return { success: false, error: 'Erro ao criar tarefa.' };
    }
  },

  getTasks: async (userId: string) => {
    try {
      const response = await TaskController.getTasks(userId);
      return response;
    } catch (error) {
      console.error('Erro ao buscar tarefas no serviço:', error);
      return { success: false, error: 'Erro ao buscar tarefas.' };
    }
  },

  getTasksByType: async (userId: string, type: string) => {
    try {
      const response = await TaskController.getTasksByType(userId, type);
      return response;
    } catch (error) {
      console.error('Erro ao buscar tarefas por tipo no serviço:', error);
      return { success: false, error: 'Erro ao buscar tarefas por tipo.' };
    }
  },

  updateCompletion: async (taskId: string, completed: 0 | 1) => {
    try {
      const response = await TaskController.updateCompletion(taskId, completed);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar tarefa no serviço:', error);
      return { success: false, error: 'Erro ao atualizar tarefa.' };
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const response = await TaskController.deleteTask(taskId);
      return response;
    } catch (error) {
      console.error('Erro ao deletar tarefa no serviço:', error);
      return { success: false, error: 'Erro ao deletar tarefa.' };
    }
  },

  clearTasksByUser: async (userId: string) => {
    try {
      const response = await TaskController.clearTasksByUser(userId);
      return response;
    } catch (error) {
      console.error('Erro ao limpar tarefas no serviço:', error);
      return { success: false, error: 'Erro ao limpar tarefas.' };
    }
  },
};
