import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid'

export interface User {
  id: string;
  name: string;
}

export const UserModel = {
  // POST create a new user (com id externo)
  createUser: async (db: SQLite.SQLiteDatabase, id: string, name: string) => {
    const result = await db.runAsync(
      'INSERT INTO user (id, name) VALUES (?, ?)', 
      id, 
      name
    );
    return id;
  },

  // GET the user by id
  getUserById: async (db: SQLite.SQLiteDatabase, id: string) => {
    const user = await db.getFirstAsync(
      'SELECT * FROM user WHERE id = ?', 
      id
    );
    return user as User;
  },

  // DELETE user by id
  deleteUser: async (db: SQLite.SQLiteDatabase, id: string) => {
    const result = await db.runAsync(
      'DELETE FROM user WHERE id = ?', 
      id
    );
    return result.changes;
  },

  //caso eu implemente o sistema de freemium sem ia apenas com usuario localmente 
  createUserLocal: async (db: SQLite.SQLiteDatabase, name: string) => {
  const userId = uuid.v4() as string;
  await db.runAsync(
    'INSERT INTO user (id, name) VALUES (?, ?)', 
    userId, 
    name
  );
  return userId;
},

};
