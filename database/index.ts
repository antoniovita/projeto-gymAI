import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { applyPragmas } from './setup';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {

    if (db) {
      console.log('Banco já inicializado, retornando instância existente');
      return db;
    }

    console.log('Inicializando banco de dados...');
    
    db = await SQLite.openDatabaseSync('app.db');
    
    console.log('Banco aberto com sucesso');
    
    await applyPragmas(db);
    console.log('Pragmas aplicados');
    
    await runMigrations(db);
    console.log('Migrações executadas');
    
    return db;
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw error;
  }
};

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const databaseExists = async (): Promise<boolean> => {
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/app.db`;
    const info = await FileSystem.getInfoAsync(dbPath);
    return info.exists;
  } catch (error) {
    console.log('Erro ao verificar existência do banco:', error);
    return false;
  }
};

export const isDatabaseInitialized = (): boolean => {
  return !!db;
};

export const deleteDatabase = async (): Promise<void> => {
  try {
    if (db) {
      db.closeSync();
      db = null;
    }

    const dbPath = `${FileSystem.documentDirectory}SQLite/app.db`;
    const info = await FileSystem.getInfoAsync(dbPath);
    
    if (info.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      console.log('Database deleted successfully.');
    } else {
      console.log('Database does not exist.');
    }
  } catch (error) {
    console.error('Erro ao deletar banco:', error);
    throw error;
  }
};