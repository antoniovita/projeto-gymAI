import { TaskCompletionController } from '../controller/taskCompletionController';

export const TaskCompletionService = {
  markDone: async (taskId: string, date: string): Promise<void> => {
    const resp = await TaskCompletionController.markDone(taskId, date);
    if (!resp.success) throw new Error(resp.error);
  },

  unmarkDone: async (taskId: string, date: string): Promise<void> => {
    const resp = await TaskCompletionController.unmarkDone(taskId, date);
    if (!resp.success) throw new Error(resp.error);
  },

  isDone: async (taskId: string, date: string): Promise<boolean> => {
    const resp = await TaskCompletionController.isDone(taskId, date);
    if (!resp.success) throw new Error(resp.error);
    return resp.data!;
  },

  getDoneTasksForDate: async (userId: string, date: string): Promise<string[]> => {
    const resp = await TaskCompletionController.getDoneTasksForDate(userId, date);
    if (!resp.success) throw new Error(resp.error);
    return resp.data!;
  }
};
