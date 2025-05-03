import { RoutineController } from '../controller/RoutineController';

export const RoutineService = {

  createRoutine: async (userId: string, dayOfWeek: string) => {
    try {
      const result = await RoutineController.createRoutine(userId, dayOfWeek);
      return result;
    } catch (error) {
      console.error('Erro ao criar rotina no serviço:', error);
      return { success: false, error: 'Erro ao criar rotina.' };
    }
  },

  getRoutines: async (userId: string) => {
    try {
      const result = await RoutineController.getRoutines(userId);
      return result;
    } catch (error) {
      console.error('Erro ao buscar rotinas no serviço:', error);
      return { success: false, error: 'Erro ao buscar rotinas.' };
    }
  },

  getRoutineByDay: async (userId: string, dayOfWeek: string) => {
    try {
      const result = await RoutineController.getRoutineByDay(userId, dayOfWeek);
      return result;
    } catch (error) {
      console.error('Erro ao buscar rotina do dia no serviço:', error);
      return { success: false, error: 'Erro ao buscar rotina do dia.' };
    }
  },

  deleteRoutine: async (routineId: string) => {
    try {
      const result = await RoutineController.deleteRoutine(routineId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar rotina no serviço:', error);
      return { success: false, error: 'Erro ao deletar rotina.' };
    }
  },
};
