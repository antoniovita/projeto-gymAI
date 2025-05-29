import { getDb } from '../../database';
import { UserModel } from '../model/User';

export const UserController = {

  createUser: async (id: string, name: string) => {
    const db = getDb();
    try {
      const userId = await UserModel.createUser(db, id, name);
      return { success: true, userId };
    } catch (error) {
      console.error('Erro ao criar usuário com ID externo no controller:', error);
      return { success: false, error: 'Erro ao criar usuário.' };
    }
  },

  //modo freemium
  createUserLocal: async (name: string) => {
    const db = getDb();
    try {
      const userId = await UserModel.createUserLocal(db, name);
      return { success: true, userId };
    } catch (error) {
      console.error('Erro ao criar usuário local no controller:', error);
      return { success: false, error: 'Erro ao criar usuário local.' };
    }
  },

  getUserById: async (id: string) => {
    const db = getDb();
    try {
      const user = await UserModel.getUserById(db, id);
      return { success: true, data: user };
    } catch (error) {
      console.error('Erro ao buscar usuário no controller:', error);
      return { success: false, error: 'Erro ao buscar usuário.' };
    }
  },

  deleteUser: async (id: string) => {
    const db = getDb();
    try {
      const changes = await UserModel.deleteUser(db, id);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar usuário no controller:', error);
      return { success: false, error: 'Erro ao deletar usuário.' };
    }
  },
};
