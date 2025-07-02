import { useState } from 'react';
import { TaskRoutineService } from '../api/service/taskRoutineService';

export const useTaskRoutine = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkRoutine = async (taskId: string, routineId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await TaskRoutineService.link(taskId, routineId);
    } catch (err: any) {
      setError(err.message);
      console.error('useTaskRoutine.linkRoutine Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unlinkRoutine = async (taskId: string, routineId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await TaskRoutineService.unlink(taskId, routineId);
    } catch (err: any) {
      setError(err.message);
      console.error('useTaskRoutine.unlinkRoutine Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutines = async (taskId: string): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      return await TaskRoutineService.getRoutinesForTask(taskId);
    } catch (err: any) {
      setError(err.message);
      console.error('useTaskRoutine.fetchRoutines Erro:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForRoutine = async (routineId: string): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      return await TaskRoutineService.getTasksForRoutine(routineId);
    } catch (err: any) {
      setError(err.message);
      console.error('useTaskRoutine.fetchTasks Erro:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    linkRoutine,
    unlinkRoutine,
    fetchRoutines,
    fetchTasksForRoutine
  };
};
