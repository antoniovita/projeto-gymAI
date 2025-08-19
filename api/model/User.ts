import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';

export interface User {
  id: string;
  name: string;
  level: number;
  xp: number;
  achievements: string[]; // será serializado como JSON
  badges: string[]; // será serializado como JSON
}

export const UserModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        achievements TEXT DEFAULT '[]',
        badges TEXT DEFAULT '[]'
      );
    `);
  },

  createUser: async (db: SQLite.SQLiteDatabase, name: string) => {
    const userId = uuid.v4() as string;
    const result = await db.runAsync(
      'INSERT INTO user (id, name, level, xp, achievements, badges) VALUES (?, ?, ?, ?, ?, ?)',
      userId,
      name,
      1, // level padrão
      0, // xp padrão
      JSON.stringify([]),
      JSON.stringify([])
    );
    return userId;
  },

  getUserById: async (db: SQLite.SQLiteDatabase, id: string): Promise<User | null> => {
    const user = await db.getFirstAsync(
      'SELECT * FROM user WHERE id = ?',
      id
    ) as any;

    if (user) {
      return {
        ...user,
        achievements: JSON.parse(user.achievements || '[]'),
        badges: JSON.parse(user.badges || '[]')
      } as User;
    }
    return null;
  },

  updateUserLevel: async (db: SQLite.SQLiteDatabase, id: string, level: number, xp: number): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE user SET level = ?, xp = ? WHERE id = ?',
      level,
      xp,
      id
    );
    return result.changes;
  },

  addAchievement: async (db: SQLite.SQLiteDatabase, id: string, achievement: string): Promise<number> => {
    const user = await UserModel.getUserById(db, id);
    if (user) {
      const updatedAchievements = [...user.achievements, achievement];
      const result = await db.runAsync(
        'UPDATE user SET achievements = ? WHERE id = ?',
        JSON.stringify(updatedAchievements),
        id
      );
      return result.changes;
    }
    return 0;
  },

  addBadge: async (db: SQLite.SQLiteDatabase, id: string, badge: string): Promise<number> => {
    const user = await UserModel.getUserById(db, id);
    if (user) {
      const updatedBadges = [...user.badges, badge];
      const result = await db.runAsync(
        'UPDATE user SET badges = ? WHERE id = ?',
        JSON.stringify(updatedBadges),
        id
      );
      return result.changes;
    }
    return 0;
  },

  deleteUser: async (db: SQLite.SQLiteDatabase, id: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM user WHERE id = ?',
      id
    );
    return result.changes;
  },

  getAllUsersDebug: async (db: SQLite.SQLiteDatabase): Promise<User[]> => {
    try {
      const users = await db.getAllAsync('SELECT * FROM user') as any[];
      return users.map(user => ({
        ...user,
        achievements: JSON.parse(user.achievements || '[]'),
        badges: JSON.parse(user.badges || '[]')
      })) as User[];
    } catch (err) {
      console.error('[DEBUG] Erro ao listar usuários:', err);
      return [];
    }
  },
};