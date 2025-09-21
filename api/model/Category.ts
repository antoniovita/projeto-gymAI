//general imports
import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';

//types
import { Category } from 'api/types/categoryTypes';

export const CategoryModel = {

  createCategory: async (db: SQLite.SQLiteDatabase, name: string, color: string, type: string) => {
    const categoryId = uuid.v4() as string;
    const result = await db.runAsync(
      'INSERT INTO category (id, name, color, type) VALUES (?, ?, ?, ?)',
      categoryId,
      name,
      color,
      type
    );
    return categoryId;
  },

  getCategoryById: async (db: SQLite.SQLiteDatabase, id: string): Promise<Category | null> => {
    const category = await db.getFirstAsync(
      'SELECT * FROM category WHERE id = ?',
      id
    ) as any;

    if (category) {
      return category as Category;
    }
    return null;
  },

  getAllCategories: async (db: SQLite.SQLiteDatabase): Promise<Category[]> => {
    try {
      const categories = await db.getAllAsync('SELECT * FROM category') as any[];
      return categories as Category[];
    } catch (err) {
      console.error('[DEBUG] Erro ao listar categorias:', err);
      return [];
    }
  },

  getCategoriesByType: async (db: SQLite.SQLiteDatabase, type: string): Promise<Category[]> => {
    try {
      const categories = await db.getAllAsync(
        'SELECT * FROM category WHERE type = ?',
        type
      ) as any[];
      return categories as Category[];
    } catch (err) {
      console.error('[DEBUG] Erro ao listar categorias por tipo:', err);
      return [];
    }
  },

  updateCategory: async (db: SQLite.SQLiteDatabase, id: string, name: string, color: string, type: string): Promise<number> => {
    const result = await db.runAsync(
      'UPDATE category SET name = ?, color = ?, type = ? WHERE id = ?',
      name,
      color,
      type,
      id
    );
    return result.changes;
  },

  deleteCategory: async (db: SQLite.SQLiteDatabase, id: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM category WHERE id = ?',
      id
    );
    return result.changes;
  },

  clearCategoriesByType: async (db: SQLite.SQLiteDatabase, type: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM category WHERE type = ?',
      type
    );
    return result.changes;
  },

  clearAllCategories: async (db: SQLite.SQLiteDatabase): Promise<number> => {
    const result = await db.runAsync('DELETE FROM category');
    return result.changes;
  },

  getAllCategoriesDebug: async (db: SQLite.SQLiteDatabase): Promise<Category[]> => {
    try {
      const categories = await db.getAllAsync('SELECT * FROM category') as any[];
      return categories as Category[];
    } catch (err) {
      console.error('[DEBUG] Erro ao listar categorias:', err);
      return [];
    }
  },
};