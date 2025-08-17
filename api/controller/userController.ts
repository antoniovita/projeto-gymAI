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

  updateUserLevel: async (id: string, level: number, xp: number) => {
    const db = getDb();
    try {
      const changes = await UserModel.updateUserLevel(db, id, level, xp);
      return { 
        success: changes > 0, 
        message: changes > 0 ? 'Nível e XP atualizados com sucesso.' : 'Usuário não encontrado.' 
      };
    } catch (error) {
      console.error('Erro ao atualizar nível do usuário no controller:', error);
      return { success: false, error: 'Erro ao atualizar nível do usuário.' };
    }
  },

  addAchievement: async (id: string, achievement: string) => {
    const db = getDb();
    try {
      const changes = await UserModel.addAchievement(db, id, achievement);
      return { 
        success: changes > 0, 
        message: changes > 0 ? 'Conquista adicionada com sucesso.' : 'Usuário não encontrado ou conquista já existe.' 
      };
    } catch (error) {
      console.error('Erro ao adicionar conquista no controller:', error);
      return { success: false, error: 'Erro ao adicionar conquista.' };
    }
  },

  addBadge: async (id: string, badge: string) => {
    const db = getDb();
    try {
      const changes = await UserModel.addBadge(db, id, badge);
      return { 
        success: changes > 0, 
        message: changes > 0 ? 'Badge adicionado com sucesso.' : 'Usuário não encontrado ou badge já existe.' 
      };
    } catch (error) {
      console.error('Erro ao adicionar badge no controller:', error);
      return { success: false, error: 'Erro ao adicionar badge.' };
    }
  },

  addExperience: async (
    id: string,
    xpToAdd: number,
    base: number = 200,  // XP base para Lv2
    step: number = 50    // incremento extra que aumenta a cada nível
  ) => {
    const db = getDb();

    try {
      const user = await UserModel.getUserById(db, id);
      if (!user) return { success: false, error: 'Usuário não encontrado.' };

      let newXp = user.xp + xpToAdd;
      let newLevel = user.level;

      const totalXpToReachLevel = (level: number) => {
        if (level <= 1) return 0;
        let total = 0;
        for (let l = 2; l <= level; l++) {
          total += base + step * (l - 2);
        }
        return total;
      };

      while (newXp >= totalXpToReachLevel(newLevel + 1)) {
        newLevel++;
      }

      const leveledUp = newLevel > user.level;
      const changes = await UserModel.updateUserLevel(db, id, newLevel, newXp);

      return {
        success: changes > 0,
        data: {
          previousLevel: user.level,
          newLevel,
          previousXp: user.xp,
          newXp,
          xpAdded: xpToAdd,
          leveledUp
        },
        message: leveledUp
          ? `Parabéns! Você subiu para o nível ${newLevel}!`
          : `${xpToAdd} XP adicionado!`
      };
    } catch (error) {
      console.error('Erro ao adicionar experiência no controller:', error);
      return { success: false, error: 'Erro ao adicionar experiência.' };
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