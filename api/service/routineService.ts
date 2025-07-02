import { RoutineController } from '../controller/routineController';

export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string;
  type?: string;
  completed: 0 | 1;
  user_id: string;
  routine_id?: string;
}

export interface Routine {
  id: string;
  dayOfWeek: string;
  tasks: Task[];
  [key: string]: any;
}

function mapRoutine(raw: any): Routine {
  return {
    id: raw.id,
    dayOfWeek: raw.dayOfWeek ?? raw.day_of_week,
    tasks: raw.tasks ?? [],
    ...raw,
  };
}

export const RoutineService = {

  createRoutine: async (
    userId: string,
    dayOfWeek: string
  ): Promise<Routine> => {
    const response = await RoutineController.createRoutine(userId, dayOfWeek);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar rotina.');
    }
    const raw = response.routine ?? {};
    return mapRoutine({ ...raw, tasks: [] });
  },

  getRoutines: async (userId: string): Promise<Routine[]> => {
    const response = await RoutineController.getRoutines(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar rotinas.');
    }
    const rawList = (response.data ?? []) as any[];
    return rawList.map(mapRoutine);
  },

  getRoutineByDay: async (
    userId: string,
    dayOfWeek: string
  ): Promise<Routine | null> => {
    const response = await RoutineController.getRoutineByDay(userId, dayOfWeek);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar rotina do dia.');
    }
    const data = response.data;
    if (Array.isArray(data)) {
      const list = data as any[];
      return list.length > 0 ? mapRoutine(list[0]) : null;
    }
    return data ? mapRoutine(data) : null;
  },

  deleteRoutine: async (routineId: string): Promise<boolean> => {
    const response = await RoutineController.deleteRoutine(routineId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar rotina.');
    }
    return true;
  },
};
