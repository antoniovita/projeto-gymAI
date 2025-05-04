import * as SQLite from 'expo-sqlite';
import { applyPragmas } from './setup';
import { runMigrations } from './migrations';

let db: SQLite.SQLDatabase;

export const initDatabase = async () => {
  db = SQLite.openDatabase('beBetter');
  await applyPragmas(db);
  await runMigrations(db);
  return db;
};

export const getDb = (): SQLite.SQLDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};
