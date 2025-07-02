import { getDb } from '../../database';
import { TaskRoutineModel } from '../model/TaskRoutineModel';

export const TaskRoutineController = {
  addRoutineToTask: async (taskId: string, routineId: string) => {
    const db = getDb();
    try {
      await TaskRoutineModel.link(db, taskId, routineId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao vincular rotina à tarefa:', error);
      return { success: false, error: 'Não foi possível vincular rotina à tarefa.' };
    }
  },

  removeRoutineFromTask: async (taskId: string, routineId: string) => {
    const db = getDb();
    try {
      await TaskRoutineModel.unlink(db, taskId, routineId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao desvincular rotina da tarefa:', error);
      return { success: false, error: 'Não foi possível desvincular rotina da tarefa.' };
    }
  },

  fetchRoutinesForTask: async (taskId: string) => {
    const db = getDb();
    try {
      const routines = await TaskRoutineModel.getRoutinesForTask(db, taskId);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Erro ao buscar rotinas da tarefa:', error);
      return { success: false, error: 'Erro ao buscar rotinas da tarefa.' };
    }
  },

  fetchTasksForRoutine: async (routineId: string) => {
    const db = getDb();
    try {
      const tasks = await TaskRoutineModel.getTasksForRoutine(db, routineId);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Erro ao buscar tarefas da rotina:', error);
      return { success: false, error: 'Erro ao buscar tarefas da rotina.' };
    }
  }
};
