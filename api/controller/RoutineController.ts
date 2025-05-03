import { getDb } from '../../database';
import { RoutineModel } from '../model/routine';

export const RoutineController = {
   
    //POST create routine
  createRoutine: async (userId: string, dayOfWeek: string) => {
    const db = getDb();
    try {
      const routineId = await RoutineModel.createRoutine(db, userId, dayOfWeek);
      return { success: true, routineId };
    } catch (error) {
      console.error('Error creating routine:', error);
      return { success: false, error: 'Erro ao criar rotina.' };
    }
  },

  // GET all routines
  getRoutines: async (userId: string) => {
    const db = getDb();
    try {
      const routines = await RoutineModel.getRoutinesByUserId(db, userId);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Error fetching routines:', error);
      return { success: false, error: 'Erro ao buscar a rotina.' };
    }
  },

  // GET weekday routine
  getRoutineByDay: async (userId: string, dayOfWeek: string) => {
    const db = getDb();
    try {
      const routines = await RoutineModel.getDayRoutineByUserId(db, userId, dayOfWeek);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Error fetching daily routine:', error);
      return { success: false, error: 'Erro ao buscar rotina do dia.' };
    }
  },

  // DELETE routine
  deleteRoutine: async (routineId: string) => {
    const db = getDb();
    try {
      const changes = await RoutineModel.deleteRoutine(db, routineId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Error deleting routine:', error);
      return { success: false, error: 'Erro ao deletar rotina.' };
    }
  },
};
