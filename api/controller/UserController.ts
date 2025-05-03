import { getDb } from '../../database';
import { UserModel } from '../model/user';
import { AuthService } from 'api/service/authService';

export const UserController = {

  createUser: async (name: string) => {
    const db = getDb();
    try {
      const userId = await UserModel.createUser(db, name);
      await AuthService.saveUserId(userId);
      return { success: true, userId };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, error: 'Erro ao criar usuário.' };
    }
  },

  getUserById: async (userId: string) => {
    const db = getDb();
    try {
      const savedUserId = await AuthService.getUserId();
      if (savedUserId && savedUserId === userId) {
        const user = await UserModel.getUserById(db, userId);
        if (!user) {
          return { success: false, error: 'Usuário não encontrado.' };
        }
        return { success: true, data: user };
      } else {
        return { success: false, error: 'Usuário não autorizado.' };
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, error: 'Erro ao buscar usuário.' };
    }
  },

  deleteUser: async (userId: string) => {
    const db = getDb();
    try {
      const savedUserId = await AuthService.getUserId();
      if (savedUserId && savedUserId === userId) {
        const changes = await UserModel.deleteUser(db, userId);
        if (changes > 0) {
          await AuthService.clearUserId();
          return { success: true };
        } else {
          return { success: false, error: 'Usuário não encontrado para deletar.' };
        }
      } else {
        return { success: false, error: 'Usuário não autorizado.' };
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { success: false, error: 'Erro ao deletar usuário.' };
    }
  },
};
