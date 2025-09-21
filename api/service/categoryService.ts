import { CategoryController } from '../controller/categoryController';
import { Category } from 'api/types/categoryTypes';

export const CategoryService = {
  createCategory: async (
    name: string,
    color: string,
    type: string,
  ): Promise<string> => {
    const response = await CategoryController.createCategory(name, color, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar categoria.');
    }
    return response.categoryId!;
  },

  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await CategoryController.getCategoryById(categoryId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar categoria por ID.');
    }
    return response.data!;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await CategoryController.getAllCategories();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar todas as categorias.');
    }
    return response.data!;
  },

  getCategoriesByType: async (type: string): Promise<Category[]> => {
    const response = await CategoryController.getCategoriesByType(type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar categorias por tipo.');
    }
    return response.data!;
  },

  updateCategory: async (
    categoryId: string,
    name: string,
    color: string,
    type: string
  ): Promise<boolean> => {
    const response = await CategoryController.updateCategory(categoryId, name, color, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar categoria.');
    }
    return true;
  },

  deleteCategory: async (categoryId: string): Promise<boolean> => {
    const response = await CategoryController.deleteCategory(categoryId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar categoria.');
    }
    return true;
  },

  clearCategoriesByType: async (type: string): Promise<number> => {
    const response = await CategoryController.clearCategoriesByType(type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar categorias por tipo.');
    }
    const match = response.message?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  },

  clearAllCategories: async (): Promise<number> => {
    const response = await CategoryController.clearAllCategories();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar todas as categorias.');
    }
    const match = response.message?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  },



  debugAllCategories: async (): Promise<Category[]> => {
    const response = await CategoryController.getAllCategories();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar categorias para debug.');
    }
    return response.data!;
  },
};