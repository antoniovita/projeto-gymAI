import { RoutineController } from '../controller/routineController';

export const RoutineService = {

    createRoutine: async (userId: string, dayOfWeek: string) => {
    const response = await RoutineController.createRoutine(userId, dayOfWeek);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar rotina.');
    }
    return response.routine;
  },

  getRoutines: async (userId: string) => {
    const response = await RoutineController.getRoutines(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar rotinas.');
    }
    return response.data;
  },

  getRoutineByDay: async (userId: string, dayOfWeek: string) => {
    const response = await RoutineController.getRoutineByDay(userId, dayOfWeek);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar rotina do dia.');
    }
    return response.data;
  },

  deleteRoutine: async (routineId: string) => {
    const response = await RoutineController.deleteRoutine(routineId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar rotina.');
    }
    return true;
  }
};
