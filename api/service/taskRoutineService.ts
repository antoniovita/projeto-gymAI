import { TaskRoutineController } from '../controller/taskRoutineController';

export const TaskRoutineService = {
  link: async (taskId: string, routineId: string): Promise<void> => {
    const resp = await TaskRoutineController.addRoutineToTask(taskId, routineId);
    if (!resp.success) throw new Error(resp.error);
  },

  unlink: async (taskId: string, routineId: string): Promise<void> => {
    const resp = await TaskRoutineController.removeRoutineFromTask(taskId, routineId);
    if (!resp.success) throw new Error(resp.error);
  },

  getRoutinesForTask: async (taskId: string): Promise<string[]> => {
    const resp = await TaskRoutineController.fetchRoutinesForTask(taskId);
    if (!resp.success) throw new Error(resp.error);
    return resp.data ?? [];
  },

  getTasksForRoutine: async (routineId: string): Promise<string[]> => {
    const resp = await TaskRoutineController.fetchTasksForRoutine(routineId);
    if (!resp.success) throw new Error(resp.error);
    return resp.data ?? [];
  }
};
