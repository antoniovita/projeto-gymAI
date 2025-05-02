import * as SQLite from 'expo-sqlite';

export interface User {
    id: number;
    name: string;
  }
  
  export const UserModel = {

    // POST create a new user
    createUser: async (db: SQLite.SQLiteDatabase, name: string) => {
      const result = await db.runAsync('INSERT INTO user (name) VALUES (?)', name);
      return result.lastInsertRowId;
    },
  

    // GET the user 
    getUserById: async (db: SQLite.SQLiteDatabase, id: number) => {
      const user = await db.getFirstAsync('SELECT * FROM user WHERE id = ?', id);
      return user;
    },
  
  };
  