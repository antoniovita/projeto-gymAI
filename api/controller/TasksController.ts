import { getDb } from '../../database';
import { TaskModel } from '../model/task';

export const TaskController = {

  // POST create new task
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
      console.error('Erro ao criar tarefa:', error);
      return { success: false, error: 'Erro ao criar tarefa.' };
    }
  },

  // GET all tasks by user_id
  getTasks: async (userId: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByUserId(db, userId);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return { success: false, error: 'Erro ao buscar tarefas.' };
    }
  },

  // GET tasks by type
  getTasksByType: async (userId: string, type: string) => {
    const db = getDb();
    try {
      const tasks = await TaskModel.getTasksByType(db, userId, type);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas por tipo:', error);
      return { success: false, error: 'Erro ao buscar tarefas por tipo.' };
    }
  },

  // PUT update task status
  updateCompletion: async (taskId: string, completed: 0 | 1) => {
    const db = getDb();
    try {
      const changes = await TaskModel.updateTaskCompletion(db, taskId, completed);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return { success: false, error: 'Erro ao atualizar tarefa.' };
    }
  },

  // DELETE task
  deleteTask: async (taskId: string) => {
    const db = getDb();
    try {
      const changes = await TaskModel.deleteTask(db, taskId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return { success: false, error: 'Erro ao deletar tarefa.' };
    }
  },

  // DELETE clear all tasks by user_id
  clearTasksByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await TaskModel.clearTasksByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar tarefas do usuário:', error);
      return { success: false, error: 'Erro ao limpar tarefas.' };
    }
  },
};
