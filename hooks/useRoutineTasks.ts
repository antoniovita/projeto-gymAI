import { useState, useEffect, useCallback } from 'react';
import { DayCompletion, RoutineTask } from '../api/model/RoutineTasks';
import { RoutineTaskService } from 'api/service/routineTaskService';

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
  // CRUD operations
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

  // completion Operations
  completeRoutineTaskForDate: (
    routineId: string,
    date: string,
    xpGranted?: number
  ) => Promise<{ success: boolean; error?: string }>;
  
  uncompleteRoutineTaskForDate: (
    routineId: string,
    date: string
  ) => Promise<{ success: boolean; error?: string }>;

  // utility Functions
  refreshRoutineTasks: (userId: string) => Promise<void>;
  clearRoutineTasksByUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  getRoutineTaskById: (routineId: string) => Promise<RoutineTask | null>;
  
  // helper Functions
  isCompletedOnDate: (routine: RoutineTask, date: string) => boolean;
  isCompletedToday: (routine: RoutineTask) => boolean;
  shouldBeCompletedToday: (routine: RoutineTask) => boolean;
  shouldBeCompletedOnDate: (routine: RoutineTask, date: string) => boolean;
  getCompletionForDate: (routine: RoutineTask, date: string) => DayCompletion | null;
  getTotalXpFromRoutine: (routine: RoutineTask) => number;
  getCompletedDates: (routine: RoutineTask) => string[];
  getCompletionCount: (routine: RoutineTask) => number;
  getCompletionsInPeriod: (routine: RoutineTask, startDate: string, endDate: string) => DayCompletion[];
}

export const useRoutineTasks = (): UseRoutineTasksReturn => {
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
                  ...(weekDays !== undefined && { week_days: JSON.stringify(weekDays) }),
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
    xpGranted: number = 0
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
  }, []);

  // Uncomplete routine task for date
  const uncompleteRoutineTaskForDate = useCallback(async (routineId: string, date: string) => {
    try {
      const response = await RoutineTaskService.uncompleteRoutineTaskForDate(routineId, date);
      
      if (response.success) {
        // Update local state removing the completion
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => {
            if (routine.id === routineId) {
              const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
              const updatedCompletions = completions.filter(c => c.date !== date);
              
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
  }, []);

  // Clear routine tasks by user
  const clearRoutineTasksByUser = useCallback(async (userId: string) => {
    try {
      const response = await RoutineTaskService.clearRoutineTasksByUser(userId);
      
      if (response.success) {
        // Mark all tasks as inactive in local state
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => ({ ...routine, is_active: 0 as const }))
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.clearRoutineTasksByUser:', error);
      return { success: false, error: 'Erro inesperado ao limpar routine tasks' };
    }
  }, []);

  // Get routine task by ID
  const getRoutineTaskById = useCallback(async (routineId: string): Promise<RoutineTask | null> => {
    try {
      const response = await RoutineTaskService.getRoutineTaskById(routineId) as ServiceResponse<RoutineTask>;
      
      if (response.success) {
        return response.data || null;
      } else {
        console.error('Erro ao buscar routine task:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.getRoutineTaskById:', error);
      return null;
    }
  }, []);

  // Helper functions based on RoutineTaskModel utilities
  const isCompletedOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.some(c => c.date === date);
  }, []);

  const isCompletedToday = useCallback((routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return isCompletedOnDate(routine, today);
  }, [isCompletedOnDate]);

  const shouldBeCompletedToday = useCallback((routine: RoutineTask): boolean => {
    const weekDays: string[] = JSON.parse(routine.week_days || "[]");
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    
    return weekDays.includes(todayName);
  }, []);

  const shouldBeCompletedOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const weekDays: string[] = JSON.parse(routine.week_days || "[]");
    const targetDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[targetDate.getDay()];
    
    return weekDays.includes(dayName);
  }, []);

  const getCompletionForDate = useCallback((routine: RoutineTask, date: string): DayCompletion | null => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.find(c => c.date === date) || null;
  }, []);

  const getTotalXpFromRoutine = useCallback((routine: RoutineTask): number => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.reduce((total, completion) => total + completion.xp_granted, 0);
  }, []);

  const getCompletedDates = useCallback((routine: RoutineTask): string[] => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.map(c => c.date).sort();
  }, []);

  const getCompletionCount = useCallback((routine: RoutineTask): number => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.length;
  }, []);

  const getCompletionsInPeriod = useCallback((
    routine: RoutineTask, 
    startDate: string, 
    endDate: string
  ): DayCompletion[] => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.filter(c => c.date >= startDate && c.date <= endDate);
  }, []);

  return {
    // State
    routineTasks: state.routineTasks,
    loading: state.loading,
    error: state.error,
    
    // CRUD Operations
    createRoutineTask,
    updateRoutineTask,
    deleteRoutineTask,
    
    // Completion Operations
    completeRoutineTaskForDate,
    uncompleteRoutineTaskForDate,
    
    // Utility Functions
    refreshRoutineTasks,
    clearRoutineTasksByUser,
    getRoutineTaskById,
    
    // Helper Functions
    isCompletedOnDate,
    isCompletedToday,
    shouldBeCompletedToday,
    shouldBeCompletedOnDate,
    getCompletionForDate,
    getTotalXpFromRoutine,
    getCompletedDates,
    getCompletionCount,
    getCompletionsInPeriod,
  };
};