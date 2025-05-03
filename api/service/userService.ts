import { UserController } from 'api/controller/UserController';
import { AuthService } from 'api/service/authService';

export const UserService = {
  createUser: async (name: string) => {
    try {
      const response = await UserController.createUser(name);
      return response;
    } catch (error) {
      console.error('Erro no serviço de criação de usuário:', error);
      return { success: false, error: 'Erro ao criar usuário.' };
    }
  },

  getUser: async () => {
    try {
      const userId = await AuthService.getUserId();
      if (!userId) {
        return { success: false, error: 'Usuário não logado.' };
      }

      const user = await UserController.getUserById(userId);
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return { success: false, error: 'Erro ao obter usuário.' };
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await UserController.deleteUser(userId);
      return response;
    } catch (error) {
      console.error('Erro no serviço de exclusão de usuário:', error);
      return { success: false, error: 'Erro ao excluir usuário.' };
    }
  },
};
