import { RoutineModel } from '../model/Routine'
import { getDb } from '../../database';


export const RoutineController = {

  createRoutine: async (userId: string, dayOfWeek: string) => {
    const db = getDb();
    try {
      const routine = await RoutineModel.createRoutine(db, userId, dayOfWeek);
      return { success: true, routine };
    } catch (error) {
      console.error('Erro ao criar rotina no controller:', error);
      return { success: false, error: 'Erro ao criar rotina.' };
    }
  },

  getRoutines: async (userId: string) => {
    const db = getDb();
    try {
      const routine = await RoutineModel.getRoutinesByUserId(db, userId);
      return { success: true, data: routine };
    } catch (error) {
      console.error('Erro ao buscar rotinas no controller:', error);
      return { success: false, error: 'Erro ao buscar rotinas.' };
    }
  },

  getRoutineByDay: async (userId: string, dayOfWeek: string) => {
    const db = getDb();
    try {
      const routine = await RoutineModel.getDayRoutineByUserId(db, userId, dayOfWeek);
      return { success: true, data: routine };
    } catch (error) {
      console.error('Erro ao buscar rotina do dia no controller:', error);
      return { success: false, error: 'Erro ao buscar rotina do dia.' };
    }
  },

  deleteRoutine: async (routineId: string) => {
    const db = getDb();
    try {
      const changes = await RoutineModel.deleteRoutine(db, routineId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar rotina no controller:', error);
      return { success: false, error: 'Erro ao deletar rotina.' };
    }
  },
};