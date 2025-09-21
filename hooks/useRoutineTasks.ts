//general imports
import { useState, useCallback } from 'react';

//services
import { RoutineTaskService } from 'api/service/routineTaskService';

//hook de stats
import { useStats } from './useStats';
import { DayCompletion, RoutineTask } from 'api/types/routineTaskTypes';

// interfaces para tipagem das respostas do serviço
interface ServiceSuccessResponse<T = any> {
  success: true;
  data?: T;
  routineId?: string;
}

interface ServiceErrorResponse {
  success: false;
  error: string;
}

type ServiceResponse<T = any> = ServiceSuccessResponse<T> | ServiceErrorResponse;

interface UseRoutineTasksState {
  routineTasks: RoutineTask[];
  loading: boolean;
  error: string | null;
}

interface UseRoutineTasksReturn extends UseRoutineTasksState {

  createRoutineTask: (
    title: string,
    content: string,
    weekDays: string[],
    type: string,
    userId: string
  ) => Promise<{ success: boolean; error?: string; routineId?: string }>;
  
  updateRoutineTask: (
    routineId: string,
    title?: string,
    content?: string,
    weekDays?: string[],
    type?: string,
    created_at?: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  deleteRoutineTask: (
    routineId: string,
    permanent?: boolean
  ) => Promise<{ success: boolean; error?: string }>;


  completeRoutineTaskForDate: (
    routineId: string,
    date: string,
    userId: string,
    xpGranted?: number
  ) => Promise<{ success: boolean; error?: string }>;
  
  uncompleteRoutineTaskForDate: (
    routineId: string,
    date: string,
    userId: string
  ) => Promise<{ success: boolean; error?: string }>;


  cancelRoutineTaskForDate: (
    routineId: string,
    date: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  activateRoutineTask: (
    routineId: string,
  ) => Promise<{ success: boolean; error?: string }>;


  refreshRoutineTasks: (userId: string) => Promise<void>;
  getAllRoutineTasksByUserId: (userId: string) => Promise<{ success: boolean; data?: RoutineTask[]; error?: string }>;


  isCompletedOnDate: (routine: RoutineTask, date: string) => boolean;
  isCancelledOnDate: (routine: RoutineTask, date: string) => boolean;
  getCompletionCount: (routine: RoutineTask) => number;
  getTotalXpFromRoutine: (routine: RoutineTask) => number;
}

export const useRoutineTasks = (): UseRoutineTasksReturn => {
  const { addExperience } = useStats();
  
  const [state, setState] = useState<UseRoutineTasksState>({
    routineTasks: [],
    loading: false,
    error: null,
  });

  // helper function to update state
  const updateState = useCallback((updates: Partial<UseRoutineTasksState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // refresh routine tasks from service
  const refreshRoutineTasks = useCallback(async (userId: string) => {
    if (!userId?.trim()) {
      updateState({ error: 'ID do usuário é obrigatório' });
      return;
    }

    updateState({ loading: true, error: null });

    try {
      const response = await RoutineTaskService.getRoutineTasks(userId) as ServiceResponse<RoutineTask[]>;
      if (response.success) {
        updateState({
          routineTasks: response.data || [],
          loading: false
        });
      } else {
        updateState({
          error: response.error || 'Erro ao carregar routine tasks',
          loading: false
        });
      }
    } catch (error) {
      updateState({
        error: 'Erro inesperado ao carregar routine tasks',
        loading: false
      });
      console.error('Erro no useRoutineTasks.refreshRoutineTasks:', error);
    }
  }, [updateState]);

  // get ALL routine tasks (including inactive ones) and update state
  const getAllRoutineTasksByUserId = useCallback(async (userId: string) => {
    if (!userId?.trim()) {
      updateState({ error: 'ID do usuário é obrigatório' });
      return { success: false, error: 'ID do usuário é obrigatório' };
    }

    updateState({ loading: true, error: null });

    try {
      const response = await RoutineTaskService.getAllRoutineTasksByUserId(userId) as ServiceResponse<RoutineTask[]>;
      if (response.success) {
        updateState({
          routineTasks: response.data || [],
          loading: false
        });
        return { success: true, data: response.data };
      } else {
        updateState({
          error: response.error || 'Erro ao carregar todas as routine tasks',
          loading: false
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      updateState({
        error: 'Erro inesperado ao carregar todas as routine tasks',
        loading: false
      });
      console.error('Erro no useRoutineTasks.getAllRoutineTasksByUserId:', error);
      return { success: false, error: 'Erro inesperado ao buscar todas as routine tasks' };
    }
  }, [updateState]);

  // create routine task
  const createRoutineTask = useCallback(async (
    title: string,
    content: string,
    weekDays: string[],
    type: string,
    userId: string
  ) => {
    try {
      const response = await RoutineTaskService.createRoutineTask(title, content, weekDays, type, userId) as ServiceResponse<string>;
      if (response.success) {
        // refresh the list after successful creation
        await refreshRoutineTasks(userId);
        return { success: true, routineId: response.routineId };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.createRoutineTask:', error);
      return { success: false, error: 'Erro inesperado ao criar routine task' };
    }
  }, [refreshRoutineTasks]);

  // update routine task
  const updateRoutineTask = useCallback(async (
    routineId: string,
    title?: string,
    content?: string,
    weekDays?: string[],
    type?: string,
    created_at?: string
  ) => {
    try {
      const response = await RoutineTaskService.updateRoutineTask(
        routineId, title, content, weekDays, type, created_at
      );

      if (response.success) {
        // update the local state
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine =>
            routine.id === routineId
              ? {
                  ...routine,
                  ...(title !== undefined && { title }),
                  ...(content !== undefined && { content }),
                  ...(weekDays !== undefined && { week_days: JSON.stringify(weekDays.map(day => day.toLowerCase())) }),
                  ...(type !== undefined && { type }),
                  ...(created_at !== undefined && { created_at })
                }
              : routine
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.updateRoutineTask:', error);
      return { success: false, error: 'Erro inesperado ao atualizar routine task' };
    }
  }, []);

  // delete routine task
  const deleteRoutineTask = useCallback(async (routineId: string, permanent: boolean = false) => {
    try {
      const response = await RoutineTaskService.deleteRoutineTask(routineId, permanent);
      if (response.success) {
        if (permanent) {
          // Remove from local state if permanent delete
          setState(prev => ({
            ...prev,
            routineTasks: prev.routineTasks.filter(routine => routine.id !== routineId)
          }));
        } else {
          // Mark as inactive in local state if soft delete
          setState(prev => ({
            ...prev,
            routineTasks: prev.routineTasks.map(routine =>
              routine.id === routineId
                ? { ...routine, is_active: 0 as const }
                : routine
            )
          }));
        }
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.deleteRoutineTask:', error);
      return { success: false, error: 'Erro inesperado ao deletar routine task' };
    }
  }, []);

  // Complete routine task for date
  const completeRoutineTaskForDate = useCallback(async (
    routineId: string,
    date: string,
    userId: string,
    xpGranted: number = 0,
  ) => {
    try {
      const response = await RoutineTaskService.completeRoutineTaskForDate(routineId, date, xpGranted);
      if (response.success) {
        // Update local state with the completion
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => {
            if (routine.id === routineId) {
              const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
              const alreadyCompleted = completions.some(c => c.date === date);
              if (!alreadyCompleted) {
                const newCompletion: DayCompletion = {
                  date,
                  xp_granted: xpGranted,
                  completed_at: new Date().toISOString()
                };
                completions.push(newCompletion);
                addExperience(userId, 50);
                return {
                  ...routine,
                  days_completed: JSON.stringify(completions)
                };
              }
            }
            return routine;
          })
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.completeRoutineTaskForDate:', error);
      return { success: false, error: 'Erro inesperado ao completar routine task' };
    }
  }, [addExperience]);

  // Uncomplete routine task for date
  const uncompleteRoutineTaskForDate = useCallback(async (routineId: string, date: string, userId: string) => {
    try {
      const response = await RoutineTaskService.uncompleteRoutineTaskForDate(routineId, date);
      if (response.success) {
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => {
            if (routine.id === routineId) {
              const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
              const updatedCompletions = completions.filter(c => c.date !== date);
              addExperience(userId, -50);
              return {
                ...routine,
                days_completed: JSON.stringify(updatedCompletions)
              };
            }
            return routine;
          })
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.uncompleteRoutineTaskForDate:', error);
      return { success: false, error: 'Erro inesperado ao descompletar routine task' };
    }
  }, [addExperience]);

  // Cancel routine task for date
  const cancelRoutineTaskForDate = useCallback(async (routineId: string, date: string) => {
    try {
      const response = await RoutineTaskService.cancelRoutineTaskForDate(routineId, date);
      if (response.success) {
        // Update local state with the cancellation
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => {
            if (routine.id === routineId) {
              const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
              if (!cancelledDays.includes(date)) {
                cancelledDays.push(date);
                return {
                  ...routine,
                  cancelled_days: JSON.stringify(cancelledDays.sort())
                };
              }
            }
            return routine;
          })
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.cancelRoutineTaskForDate:', error);
      return { success: false, error: 'Erro inesperado ao cancelar routine task' };
    }
  }, []);

  const activateRoutineTask = useCallback(async (routineId: string): Promise<{ success: boolean; error?: string }> => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da rotina é obrigatório' };
    }

    try {
      const response = await RoutineTaskService.activateRoutineTask(routineId);
      if (response.success) {
        // Update local state to mark task as active
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine =>
            routine.id === routineId
              ? { ...routine, is_active: 1 as const }
              : routine
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erro ao ativar routine task' };
      }
    } catch (error) {
      console.error('Erro no hook ao ativar routine task:', error);
      return { success: false, error: 'Erro inesperado ao ativar routine task' };
    }
  }, []);

  // Essential helper functions
  const isCompletedOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.some(c => c.date === date);
  }, []);

  const isCancelledOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    return cancelledDays.includes(date);
  }, []);

  const getCompletionCount = useCallback((routine: RoutineTask): number => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.length;
  }, []);

  const getTotalXpFromRoutine = useCallback((routine: RoutineTask): number => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.reduce((total, completion) => total + (completion.xp_granted || 0), 0);
  }, []);

  return {

    routineTasks: state.routineTasks,
    loading: state.loading,
    error: state.error,

    createRoutineTask,
    updateRoutineTask,
    deleteRoutineTask,
    completeRoutineTaskForDate,
    uncompleteRoutineTaskForDate,
    cancelRoutineTaskForDate,
    activateRoutineTask,

    refreshRoutineTasks,
    getAllRoutineTasksByUserId,

    isCompletedOnDate,
    isCancelledOnDate,
    getCompletionCount,
    getTotalXpFromRoutine,
  };
};