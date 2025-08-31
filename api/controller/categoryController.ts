import { getDb } from '../../database';
import { CategoryModel } from '../model/Category';

export const CategoryController = {
  createCategory: async (name: string, color: string, type: string) => {
    const db = getDb();
    try {
      const categoryId = await CategoryModel.createCategory(db, name, color, type);
      return { success: true, categoryId };
    } catch (error) {
      console.error('Erro ao criar categoria no controller:', error);
      return { success: false, error: 'Erro ao criar categoria.' };
    }
  },

  getCategoryById: async (id: string) => {
    const db = getDb();
    try {
      const category = await CategoryModel.getCategoryById(db, id);
      return { success: true, data: category };
    } catch (error) {
      console.error('Erro ao buscar categoria no controller:', error);
      return { success: false, error: 'Erro ao buscar categoria.' };
    }
  },

  getAllCategories: async () => {
    const db = getDb();
    try {
      const categories = await CategoryModel.getAllCategories(db);
      return { success: true, data: categories };
    } catch (error) {
      console.error('Erro ao listar categorias no controller:', error);
      return { success: false, error: 'Erro ao listar categorias.' };
    }
  },

  getCategoriesByType: async (type: string) => {
    const db = getDb();
    try {
      const categories = await CategoryModel.getCategoriesByType(db, type);
      return { success: true, data: categories };
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo no controller:', error);
      return { success: false, error: 'Erro ao buscar categorias por tipo.' };
    }
  },

  updateCategory: async (id: string, name: string, color: string, type: string) => {
    const db = getDb();
    try {
      const changes = await CategoryModel.updateCategory(db, id, name, color, type);
      return {
        success: changes > 0,
        message: changes > 0 ? 'Categoria atualizada com sucesso.' : 'Categoria não encontrada.'
      };
    } catch (error) {
      console.error('Erro ao atualizar categoria no controller:', error);
      return { success: false, error: 'Erro ao atualizar categoria.' };
    }
  },

  deleteCategory: async (id: string) => {
    const db = getDb();
    try {
      const changes = await CategoryModel.deleteCategory(db, id);
      return {
        success: changes > 0,
        message: changes > 0 ? 'Categoria removida com sucesso.' : 'Categoria não encontrada.'
      };
    } catch (error) {
      console.error('Erro ao deletar categoria no controller:', error);
      return { success: false, error: 'Erro ao deletar categoria.' };
    }
  },

  clearCategoriesByType: async (type: string) => {
    const db = getDb();
    try {
      const changes = await CategoryModel.clearCategoriesByType(db, type);
      return {
        success: changes > 0,
        message: changes > 0 
          ? `${changes} categoria(s) do tipo '${type}' removida(s) com sucesso.`
          : `Nenhuma categoria do tipo '${type}' encontrada.`
      };
    } catch (error) {
      console.error('Erro ao limpar categorias por tipo no controller:', error);
      return { success: false, error: 'Erro ao limpar categorias por tipo.' };
    }
  },

  clearAllCategories: async () => {
    const db = getDb();
    try {
      const changes = await CategoryModel.clearAllCategories(db);
      return {
        success: changes > 0,
        message: changes > 0 
          ? `${changes} categoria(s) removida(s) com sucesso.`
          : 'Nenhuma categoria encontrada para remover.'
      };
    } catch (error) {
      console.error('Erro ao limpar todas as categorias no controller:', error);
      return { success: false, error: 'Erro ao limpar todas as categorias.' };
    }
  }
};