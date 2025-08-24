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


  getRoutineTaskById: async (routineId: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }

    return await RoutineTaskController.getRoutineTaskById(routineId);
  },

  completeRoutineTask: async (routineId: string, xpGranted: number = 0) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }

    return await RoutineTaskController.completeRoutineTask(routineId, xpGranted);
  },

  uncompleteRoutineTask: async (routineId: string) => {
    if (!routineId?.trim()) {
      return { success: false, error: 'ID da routine task é obrigatório' };
    }

    return await RoutineTaskController.uncompleteRoutineTask(routineId);
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
      updates.weekDays = weekDays;
    }
    
    if (type !== undefined) {
      updates.type = type?.trim() || '';
    }
    
    if (created_at !== undefined) {
      updates.created_at = created_at;
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
};