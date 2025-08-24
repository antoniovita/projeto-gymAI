import { getDb } from '../../database';
import { RoutineTask, RoutineTaskModel } from '../model/RoutineTasks';

export const RoutineTaskController = {
    
  createRoutineTask: async (
    title: string,
    content: string,
    weekDays: string[], // ["monday", "wednesday", "friday"]
    type: string,
    userId: string,
  ) => {
    const db = getDb();
    try {

        if (!Array.isArray(weekDays) || weekDays.length === 0) {
        throw new Error('Pelo menos um dia da semana deve ser selecionado');
      }

      const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const invalidDays = weekDays.filter(day => !validDays.includes(day.toLowerCase()));
      
      if (invalidDays.length > 0) {
        throw new Error(`Dias inválidos: ${invalidDays.join(', ')}`);
      }

      const routineId = await RoutineTaskModel.createRoutineTask(
        db,
        title,
        content,
        weekDays.map(day => day.toLowerCase()),
        type,
        userId,
      );

      return { success: true, routineId };
    } catch (error) {
      console.error('Erro ao criar routine task no controller:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar routine task.' };
    }
  },

  getRoutineTasks: async (userId: string) => {
    const db = getDb();
    try {
      const routines = await RoutineTaskModel.getRoutineTasksByUserId(db, userId);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Erro ao buscar routine tasks no controller:', error);
      return { success: false, error: 'Erro ao buscar routine tasks.' };
    }
  },

  getRoutineTaskById: async (routineId: string) => {
    const db = getDb();
    try {
      const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
      
      if (routine) {
        return { success: true, data: routine };
      } else {
        return { success: false, error: 'Routine task não encontrada.' };
      }
    } catch (error) {
      console.error('Erro ao buscar routine task por ID no controller:', error);
      return { success: false, error: 'Erro ao buscar routine task por ID.' };
    }
  },

  completeRoutineTask: async (routineId: string, xpGranted: number = 0) => {
    const db = getDb();
    try {

        if (xpGranted < 0) {
        throw new Error('XP deve ser um valor positivo');
      }

      const changes = await RoutineTaskModel.completeRoutineTask(db, routineId, xpGranted);
      
      if (changes === 0) {
        return { success: false, error: 'Routine task não encontrada ou já foi completada hoje.' };
      }

      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao completar routine task no controller:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao completar routine task.' };
    }
  },

  uncompleteRoutineTask: async (routineId: string) => {
    const db = getDb();
    try {
      const changes = await RoutineTaskModel.uncompleteRoutineTask(db, routineId);
      
      if (changes === 0) {
        return { success: false, error: 'Routine task não encontrada ou não foi completada hoje.' };
      }

      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao descompletar routine task no controller:', error);
      return { success: false, error: 'Erro ao descompletar routine task.' };
    }
  },

  updateRoutineTask: async (routineId: string, updates: Partial<RoutineTask & { weekDays?: string[] }>) => {
    const db = getDb();
    try {

        if (updates.weekDays && Array.isArray(updates.weekDays)) {
        const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const invalidDays = updates.weekDays.filter(day => !validDays.includes(day.toLowerCase()));
        
        if (invalidDays.length > 0) {
          throw new Error(`Dias inválidos: ${invalidDays.join(', ')}`);
        }

        if (updates.weekDays.length === 0) {
          throw new Error('Pelo menos um dia da semana deve ser selecionado');
        }

        updates.week_days = JSON.stringify(updates.weekDays.map(day => day.toLowerCase()));
        delete updates.weekDays; 
      }

      if (updates.created_at) {
        const isoDate = new Date(updates.created_at);
        if (isNaN(isoDate.getTime())) {
          throw new RangeError('created_at inválido');
        }
        updates.created_at = isoDate.toISOString();
      }

      const changes = await RoutineTaskModel.updateRoutineTask(db, routineId, updates);
      return { success: changes > 0, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar routine task no controller:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar routine task.' };
    }
  },

  deleteRoutineTask: async (routineId: string, permanent: boolean = false) => {
    const db = getDb();
    try {
      let changes;
      
      if (permanent) {
        changes = await RoutineTaskModel.permanentDeleteRoutineTask(db, routineId);
      } else {
        changes = await RoutineTaskModel.deleteRoutineTask(db, routineId);
      }

      return { success: changes > 0, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao deletar routine task no controller:', error);
      return { success: false, error: 'Erro ao deletar routine task.' };
    }
  },

  clearRoutineTasksByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await RoutineTaskModel.clearRoutineTasksByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar routine tasks no controller:', error);
      return { success: false, error: 'Erro ao limpar routine tasks.' };
    }
  },

  getAllRoutineTasksDebug: async () => {
    const db = getDb();
    try {
      const routines = await RoutineTaskModel.getAllRoutineTasksDebug(db);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Erro ao buscar todas as routine tasks para debug no controller:', error);
      return { success: false, error: 'Erro ao buscar todas as routine tasks para debug.' };
    }
  },

};