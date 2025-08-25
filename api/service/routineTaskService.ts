import { RoutineTaskController } from 'api/controller/routineTasksController';

export const RoutineTaskService = {
  createRoutineTask: async (
    title: string,
    content: string,
    weekDays: string[],
    type: string,
    userId: string
  ) => {
    if (!title?.trim()) {
      return { success: false, error: 'Título é obrigatório' };
    }
    if (!userId?.trim()) {
      return { success: false, error: 'ID do usuário é obrigatório' };
    }
    if (!Array.isArray(weekDays) || weekDays.length === 0) {
      return { success: false, error: 'Pelo menos um dia da semana deve ser selecionado' };
    }
    
    return await RoutineTaskController.createRoutineTask(
      title.trim(),
      content?.trim() || '',
      weekDays,
      type?.trim() || '',
      userId
    );
  },

  getRoutineTasks: async (userId: string) => {
    if (!userId?.trim()) {
      return { success: false, error: 'ID do usuário é obrigatório' };
    }
    return await RoutineTaskController.getRoutineTasks(userId);
  },

  getRoutineTasksForDate: async (userId: string, date: string) => {
    if (!userId?.trim()) {
      return { success: false, error: 'ID do usuário é obrigatório' };
    }
    if (!date?.trim()) {
      return { success: false, error: 'Data é obrigatória' };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
    }

    return await RoutineTaskController.getRoutineTasksForDate(userId, date.trim());
  },

  getRoutineTaskById: async (routineId: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    return await RoutineTaskController.getRoutineTaskById(routineId);
  },

  completeRoutineTaskForDate: async (routineId: string, date: string, xpGranted: number = 0) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    if (!date?.trim()) {
      return { success: false, error: 'Data é obrigatória' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
    }

    if (typeof xpGranted !== 'number' || xpGranted < 0) {
      return { success: false, error: 'XP deve ser um número positivo' };
    }

    return await RoutineTaskController.completeRoutineTaskForDate(routineId, date.trim(), xpGranted);
  },

  uncompleteRoutineTaskForDate: async (routineId: string, date: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    if (!date?.trim()) {
      return { success: false, error: 'Data é obrigatória' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
    }

    return await RoutineTaskController.uncompleteRoutineTaskForDate(routineId, date.trim());
  },

  // funcoes de cancelamento de task
  cancelRoutineTaskForDate: async (routineId: string, date: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    if (!date?.trim()) {
      return { success: false, error: 'Data é obrigatória' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
    }

    return await RoutineTaskController.cancelRoutineTaskForDate(routineId, date.trim());
  },

  removeCancelledRoutineTaskForDate: async (routineId: string, date: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    if (!date?.trim()) {
      return { success: false, error: 'Data é obrigatória' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
    }

    return await RoutineTaskController.removeCancelledRoutineTaskForDate(routineId, date.trim());
  },

  updateRoutineTask: async (
    routineId: string,
    title?: string,
    content?: string,
    weekDays?: string[],
    type?: string,
    created_at?: string
  ) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }

    const updates: any = {};

    if (title !== undefined) {
      const trimmedTitle = title?.trim() || '';
      if (!trimmedTitle) {
        return { success: false, error: 'Título não pode estar vazio' };
      }
      updates.title = trimmedTitle;
    }

    if (content !== undefined) {
      updates.content = content?.trim() || '';
    }

    if (weekDays !== undefined) {
      if (!Array.isArray(weekDays) || weekDays.length === 0) {
        return { success: false, error: 'Pelo menos um dia da semana deve ser selecionado' };
      }
      updates.weekDays = weekDays;
    }

    if (type !== undefined) {
      updates.type = type?.trim() || '';
    }

    if (created_at !== undefined) {
      if (created_at && created_at.trim()) {
        const isoDate = new Date(created_at.trim());
        if (isNaN(isoDate.getTime())) {
          return { success: false, error: 'Data de criação inválida' };
        }
        updates.created_at = created_at.trim();
      } else {
        updates.created_at = created_at;
      }
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'Nenhum dado fornecido para atualização' };
    }

    return await RoutineTaskController.updateRoutineTask(routineId, updates);
  },

  deleteRoutineTask: async (routineId: string, permanent: boolean = false) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }
    return await RoutineTaskController.deleteRoutineTask(routineId, permanent);
  },

  clearRoutineTasksByUser: async (userId: string) => {
    if (!userId?.trim()) {
      return { success: false, error: 'ID do usuário é obrigatório' };
    }
    return await RoutineTaskController.clearRoutineTasksByUser(userId);
  },

  getAllRoutineTasksDebug: async () => {
    return await RoutineTaskController.getAllRoutineTasksDebug();
  },
  

  activateRoutineTask: async (routineId: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da rotina é obrigatório' };
    }
    return await RoutineTaskController.activateRoutineTask(routineId);
  },

  getAllRoutineTasksByUserId: async (userId: string) => {
  if (!userId?.trim()) {
    return { success: false, error: 'ID do usuário é obrigatório' };
  }
  return await RoutineTaskController.getAllRoutineTasksByUserId(userId);
},
};