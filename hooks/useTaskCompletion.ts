import { useState } from 'react';
import { TaskCompletionService } from '../api/service/taskCompletionService';

export const useTaskCompletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markDone = async (taskId: string, date: string): Promise<void> => {
    setLoading(true); setError(null);
    try { await TaskCompletionService.markDone(taskId, date); }
    catch (e:any) { setError(e.message); throw e; }
    finally { setLoading(false); }
  };

  const unmarkDone = async (taskId: string, date: string): Promise<void> => {
    setLoading(true); setError(null);
    try { await TaskCompletionService.unmarkDone(taskId, date); }
    catch (e:any) { setError(e.message); throw e; }
    finally { setLoading(false); }
  };

  const isDone = async (taskId: string, date: string): Promise<boolean> => {
    setLoading(true); setError(null);
    try { return await TaskCompletionService.isDone(taskId, date); }
    catch (e:any) { setError(e.message); return false; }
    finally { setLoading(false); }
  };

  const getDoneMap = async (userId: string, date: string): Promise<string[]> => {
    setLoading(true); setError(null);
    try { return await TaskCompletionService.getDoneTasksForDate(userId, date); }
    catch (e:any) { setError(e.message); return []; }
    finally { setLoading(false); }
  };

  return { loading, error, markDone, unmarkDone, isDone, getDoneMap };
};
