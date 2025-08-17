import { UserController } from '../controller/userController';

export const UserService = {
  createUser: async (id: string, name: string) => {
    const response = await UserController.createUser(id, name);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar usuário.');
    }
    return response.userId;
  },

  getUserById: async (id: string) => {
    const response = await UserController.getUserById(id);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar usuário.');
    }
    return response.data;
  },

  updateUserLevel: async (id: string, level: number, xp: number) => {
    const response = await UserController.updateUserLevel(id, level, xp);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar nível do usuário.');
    }
    return response.message;
  },

  addAchievement: async (id: string, achievement: string) => {
    const response = await UserController.addAchievement(id, achievement);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao adicionar conquista.');
    }
    return response.message;
  },

  addBadge: async (id: string, badge: string) => {
    const response = await UserController.addBadge(id, badge);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao adicionar badge.');
    }
    return response.message;
  },

  addExperience: async (
    id: string, 
    xpToAdd: number, 
    base: number = 200, 
    step: number = 50
  ) => {
    const response = await UserController.addExperience(id, xpToAdd, base, step);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao adicionar experiência.');
    }
    return {
      data: response.data,
      message: response.message
    };
  },

  deleteUser: async (id: string) => {
    const response = await UserController.deleteUser(id);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar usuário.');
    }
    return true;
  }
};