import { useState, useCallback } from 'react';
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
  
  // cancellation Operations
  cancelRoutineTaskForDate: (
    routineId: string,
    date: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeCancelledRoutineTaskForDate: (
    routineId: string,
    date: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  // utility Functions
  refreshRoutineTasks: (userId: string) => Promise<void>;
  getRoutineTasksForDate: (userId: string, date: string) => Promise<{ success: boolean; data?: RoutineTask[]; error?: string }>;
  clearRoutineTasksByUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  getRoutineTaskById: (routineId: string) => Promise<RoutineTask | null>;
  
  // helper Functions
  isCompletedOnDate: (routine: RoutineTask, date: string) => boolean;
  isCompletedToday: (routine: RoutineTask) => boolean;
  isCancelledOnDate: (routine: RoutineTask, date: string) => boolean;
  isCancelledToday: (routine: RoutineTask) => boolean;
  shouldBeCompletedToday: (routine: RoutineTask) => boolean;
  shouldBeCompletedOnDate: (routine: RoutineTask, date: string) => boolean;
  getCompletionForDate: (routine: RoutineTask, date: string) => DayCompletion | null;
  getTotalXpFromRoutine: (routine: RoutineTask) => number;
  getCompletedDates: (routine: RoutineTask) => string[];
  getCancelledDates: (routine: RoutineTask) => string[];
  getCompletionCount: (routine: RoutineTask) => number;
  getCompletionsInPeriod: (routine: RoutineTask, startDate: string, endDate: string) => DayCompletion[];
  getValidDaysInPeriod: (routine: RoutineTask, startDate: string, endDate: string) => number;
  getNextValidDates: (routine: RoutineTask, fromDate: string, limit?: number) => string[];
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

  // get routine tasks for specific date (já filtra dias cancelados automaticamente)
  const getRoutineTasksForDate = useCallback(async (userId: string, date: string) => {
    try {
      const response = await RoutineTaskService.getRoutineTasksForDate(userId, date) as ServiceResponse<RoutineTask[]>;
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no useRoutineTasks.getRoutineTasksForDate:', error);
      return { success: false, error: 'Erro inesperado ao buscar routine tasks para data' };
    }
  }, []);

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

  // === CANCELLATION OPERATIONS ===
  
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

  // Remove cancellation for routine task on date
  const removeCancelledRoutineTaskForDate = useCallback(async (routineId: string, date: string) => {
    try {
      const response = await RoutineTaskService.removeCancelledRoutineTaskForDate(routineId, date);
      if (response.success) {
        // Update local state removing the cancellation
        setState(prev => ({
          ...prev,
          routineTasks: prev.routineTasks.map(routine => {
            if (routine.id === routineId) {
              const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
              const updatedCancelledDays = cancelledDays.filter(d => d !== date);
              return {
                ...routine,
                cancelled_days: JSON.stringify(updatedCancelledDays)
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
      console.error('Erro no useRoutineTasks.removeCancelledRoutineTaskForDate:', error);
      return { success: false, error: 'Erro inesperado ao remover cancelamento de routine task' };
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

  // === HELPER FUNCTIONS - ATUALIZADAS PARA CONSIDERAR CANCELAMENTOS ===
  
  const isCompletedOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const completions: DayCompletion[] = JSON.parse(routine.days_completed || "[]");
    return completions.some(c => c.date === date);
  }, []);

  const isCompletedToday = useCallback((routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return isCompletedOnDate(routine, today);
  }, [isCompletedOnDate]);

  const isCancelledOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    return cancelledDays.includes(date);
  }, []);

  const isCancelledToday = useCallback((routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return isCancelledOnDate(routine, today);
  }, [isCancelledOnDate]);

  // ATUALIZADO: Agora considera cancelamentos
  const shouldBeCompletedToday = useCallback((routine: RoutineTask): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return shouldBeCompletedOnDate(routine, today);
  }, []);

  // ATUALIZADO: Agora considera cancelamentos
  const shouldBeCompletedOnDate = useCallback((routine: RoutineTask, date: string): boolean => {
    const weekDays: string[] = JSON.parse(routine.week_days || "[]");
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    
    // Se a data está cancelada, não deve ser completada
    if (cancelledDays.includes(date)) return false;
    
    // Verifica se o dia da semana está na lista de dias da routine
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

  const getCancelledDates = useCallback((routine: RoutineTask): string[] => {
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    return cancelledDays.sort();
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

  // NOVA: Conta quantos dias válidos (não cancelados) uma routine tem em um período
  const getValidDaysInPeriod = useCallback((
    routine: RoutineTask,
    startDate: string,
    endDate: string
  ): number => {
    const weekDays: string[] = JSON.parse(routine.week_days || "[]");
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    let validDays = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];
      
      if (weekDays.includes(dayName) && !cancelledDays.includes(dateStr)) {
        validDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return validDays;
  }, []);

  // NOVA: Retorna as próximas datas válidas (não canceladas) para uma routine
  const getNextValidDates = useCallback((
    routine: RoutineTask,
    fromDate: string,
    limit: number = 7
  ): string[] => {
    const weekDays: string[] = JSON.parse(routine.week_days || "[]");
    const cancelledDays: string[] = JSON.parse(routine.cancelled_days || "[]");
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const validDates: string[] = [];
    const startDate = new Date(fromDate);
    let currentDate = new Date(startDate);
    
    // Procura até encontrar o número limite de datas válidas ou até 30 dias no futuro
    let daysChecked = 0;
    const maxDaysToCheck = 30;
    
    while (validDates.length < limit && daysChecked < maxDaysToCheck) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];
      
      // Se é um dia da semana da routine e não está cancelado
      if (weekDays.includes(dayName) && !cancelledDays.includes(dateStr)) {
        validDates.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }
    
    return validDates;
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
    
    // Cancellation Operations
    cancelRoutineTaskForDate,
    removeCancelledRoutineTaskForDate,
    
    // Utility Functions
    refreshRoutineTasks,
    getRoutineTasksForDate,
    clearRoutineTasksByUser,
    getRoutineTaskById,
    
    // Helper Functions - Atualizadas para considerar cancelamentos
    isCompletedOnDate,
    isCompletedToday,
    isCancelledOnDate,
    isCancelledToday,
    shouldBeCompletedToday,
    shouldBeCompletedOnDate,
    getCompletionForDate,
    getTotalXpFromRoutine,
    getCompletedDates,
    getCancelledDates,
    getCompletionCount,
    getCompletionsInPeriod,
    getValidDaysInPeriod,
    getNextValidDates,
  };
};