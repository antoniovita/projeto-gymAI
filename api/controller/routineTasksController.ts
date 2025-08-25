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

      const validDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
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

  getRoutineTasksForDate: async (userId: string, date: string) => {
    const db = getDb();
    try {
      const routines = await RoutineTaskModel.getRoutineTasksForDate(db, userId, date);
      return { success: true, data: routines };
    } catch (error) {
      console.error('Erro ao buscar routine tasks por data no controller:', error);
      return { success: false, error: 'Erro ao buscar routine tasks por data.' };
    }
  },

  getRoutineTaskById: async (routineId: string) => {
    const db = getDb();
    try {
      const routine = await RoutineTaskModel.getRoutineTaskById(db, routineId);
      if (routine) {
        return { success: true, data: routine };
      }
      return { success: false, error: 'Routine task não encontrada.' };
    } catch (error) {
      console.error('Erro ao buscar routine task por ID no controller:', error);
      return { success: false, error: 'Erro ao buscar routine task por ID.' };
    }
  },

  completeRoutineTaskForDate: async (routineId: string, date: string, xpGranted: number = 0) => {
    const db = getDb();
    try {
      if (xpGranted < 0) throw new Error('XP deve ser um valor positivo');

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) throw new Error('Formato de data inválido. Use YYYY-MM-DD');

      const targetDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (targetDate > today) {
        throw new Error('Não é possível completar routine tasks para datas futuras');
      }

      const changes = await RoutineTaskModel.completeRoutineTaskForDate(db, routineId, date, xpGranted);
      if (changes === 0) {
        return { success: false, error: 'Routine task não encontrada ou já completada nesta data.' };
      }

      return { success: true, updatedCount: changes, date, xpGranted };
    } catch (error) {
      console.error('Erro ao completar routine task para data específica no controller:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao completar routine task.' };
    }
  },

  uncompleteRoutineTaskForDate: async (routineId: string, date: string) => {
    const db = getDb();
    try {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) throw new Error('Formato de data inválido. Use YYYY-MM-DD');

      const changes = await RoutineTaskModel.uncompleteRoutineTaskForDate(db, routineId, date);
      if (changes === 0) {
        return { success: false, error: 'Routine task não encontrada ou não completada nesta data.' };
      }

      return { success: true, updatedCount: changes, date };
    } catch (error) {
      console.error('Erro ao descompletar routine task para data específica no controller:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao descompletar routine task.' };
    }
  },

  // cancelar dias
  cancelRoutineTaskForDate: async (routineId: string, date: string) => {
    const db = getDb();
    try {
      const changes = await RoutineTaskModel.addCancelledDay(db, routineId, date);
      return changes > 0
        ? { success: true, updatedCount: changes, date }
        : { success: false, error: 'Routine task não encontrada ou já estava cancelada nessa data.' };
    } catch (error) {
      console.error('Erro ao cancelar routine task em uma data no controller:', error);
      return { success: false, error: 'Erro ao cancelar routine task em uma data.' };
    }
  },

  removeCancelledRoutineTaskForDate: async (routineId: string, date: string) => {
    const db = getDb();
    try {
      const changes = await RoutineTaskModel.removeCancelledDay(db, routineId, date);
      return changes > 0
        ? { success: true, updatedCount: changes, date }
        : { success: false, error: 'Routine task não encontrada ou não estava cancelada nessa data.' };
    } catch (error) {
      console.error('Erro ao remover cancelamento de routine task em uma data no controller:', error);
      return { success: false, error: 'Erro ao remover cancelamento de routine task em uma data.' };
    }
  },

  updateRoutineTask: async (routineId: string, updates: Partial<RoutineTask & { weekDays?: string[] }>) => {
    const db = getDb();
    try {
      if (updates.weekDays && Array.isArray(updates.weekDays)) {
        const validDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
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
        if (isNaN(isoDate.getTime())) throw new RangeError('created_at inválido');
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
      const changes = permanent
        ? await RoutineTaskModel.permanentDeleteRoutineTask(db, routineId)
        : await RoutineTaskModel.deleteRoutineTask(db, routineId);
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