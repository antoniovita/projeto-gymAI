import uuid from 'react-native-uuid';

import * as SQLite from 'expo-sqlite';

export interface User {
  id: string;
  name: string;
}

export const UserModel = {

  // POST create a new user
  createUser: async (db: SQLite.SQLiteDatabase, name: string) => {
    const userId = uuid.v4();

    const result = await db.runAsync(
      'INSERT INTO user (id, name) VALUES (?, ?)', 
      userId, 
      name
    );
    return userId;
  },

  // GET the user by id
  getUserById: async (db: SQLite.SQLiteDatabase, id: string) => {
    const user = await db.getFirstAsync('SELECT * FROM user WHERE id = ?', id);
    return user;
  },

  // DELETE user by id
  deleteUser: async (db: SQLite.SQLiteDatabase, id: string) => {
    const result = await db.runAsync(
      'DELETE FROM user WHERE id = ?',
      id
    );
    return result.changes;
  },

};
