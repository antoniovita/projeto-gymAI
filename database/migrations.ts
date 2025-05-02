import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      height FLOAT NOT NULL,
      weight FLOAT NOT NULL,
      WAGE FLOAT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tasks 
    );
  `);


};
