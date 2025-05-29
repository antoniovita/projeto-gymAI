import { UserController } from '../controller/userController';

export const UserService = {

    createUser: async (id: string, name: string) => {
    const response = await UserController.createUser(id, name);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar usuário.');
    }
    return response.userId;
  },

  createUserLocal: async (name: string) => {
    const response = await UserController.createUserLocal(name);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar usuário local.');
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

  deleteUser: async (id: string) => {
    const response = await UserController.deleteUser(id);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar usuário.');
    }
    return true;
  }
};
