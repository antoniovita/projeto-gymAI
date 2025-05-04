import * as SQLite from 'expo-sqlite';
import { applyPragmas } from './setup';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseSync('app.db');
  await applyPragmas(db);
  await runMigrations(db);
  return db;
};

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};
