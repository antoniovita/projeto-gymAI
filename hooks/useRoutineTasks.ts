import { useEffect, useState, useCallback } from 'react';
import { RoutineTask } from '../api/model/RoutineTasks';
import { RoutineTaskService } from 'api/service/routineTaskService';

export function useRoutineTask(userId: string) {
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutineTasks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await RoutineTaskService.getRoutineTasks(userId);
      
      if (result.success) {
        setRoutineTasks((result as any).data || []);
        setError(null);
      } else {
        setError(result.error || 'Erro ao carregar routine tasks.');
        setRoutineTasks([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar routine tasks.');
      setRoutineTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createRoutineTask = useCallback(async (routineTask: {
    title: string;
    content: string;
    weekDays: string[];
    type: string;
  }) => {
    try {
      const result = await RoutineTaskService.createRoutineTask(
        routineTask.title,
        routineTask.content,
        routineTask.weekDays,
        routineTask.type,
        userId
      );

      if (result.success) {
        await fetchRoutineTasks();
        return (result as any).routineId;
      } else {
        setError(result.error || 'Erro ao criar routine task.');
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [userId, fetchRoutineTasks]);

  const deleteRoutineTask = useCallback(async (routineId: string, permanent: boolean = false) => {
    try {
      const result = await RoutineTaskService.deleteRoutineTask(routineId, permanent);
      
      if (result.success) {
        await fetchRoutineTasks();
      } else {
        setError(result.error || 'Erro ao deletar routine task.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchRoutineTasks]);

  const updateRoutineTask = useCallback(async (
    routineId: string,
    title?: string,
    content?: string,
    weekDays?: string[],
    type?: string,
    created_at?: string
  ) => {
    try {
      const result = await RoutineTaskService.updateRoutineTask(
        routineId,
        title,
        content,
        weekDays,
        type,
        created_at
      );
      
      if (result.success) {
        await fetchRoutineTasks();
      } else {
        setError(result.error || 'Erro ao atualizar routine task.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchRoutineTasks]);

  const completeRoutineTask = useCallback(async (routineId: string, xpGranted: number = 0) => {
    try {
      const result = await RoutineTaskService.completeRoutineTask(routineId, xpGranted);
      
      if (result.success) {
        await fetchRoutineTasks();
      } else {
        setError(result.error || 'Erro ao completar routine task.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchRoutineTasks]);

  const uncompleteRoutineTask = useCallback(async (routineId: string) => {
    try {
      const result = await RoutineTaskService.uncompleteRoutineTask(routineId);
      
      if (result.success) {
        await fetchRoutineTasks();
      } else {
        setError(result.error || 'Erro ao descompletar routine task.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchRoutineTasks]);

  const clearRoutineTasksByUser = useCallback(async () => {
    try {
      const result = await RoutineTaskService.clearRoutineTasksByUser(userId);
      
      if (result.success) {
        await fetchRoutineTasks();
      } else {
        setError(result.error || 'Erro ao limpar routine tasks.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [userId, fetchRoutineTasks]);

  useEffect(() => {
    fetchRoutineTasks();
  }, [fetchRoutineTasks]);

  return {
    routineTasks,
    loading,
    error,
    fetchRoutineTasks,
    createRoutineTask,
    deleteRoutineTask,
    updateRoutineTask,
    completeRoutineTask,
    uncompleteRoutineTask,
    clearRoutineTasksByUser,
  };
}