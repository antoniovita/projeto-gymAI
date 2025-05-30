import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
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

export const deleteDatabase = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/app.db`;
  const info = await FileSystem.getInfoAsync(dbPath);

  if (info.exists) {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
    console.log('Database deleted successfully.');
  } else {
    console.log('Database does not exist.');
  }
};
