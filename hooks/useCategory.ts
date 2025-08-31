import { useState, useEffect } from 'react';
import { Category } from '../api/model/Category';
import { CategoryService } from '../api/service/categoryService';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  createCategory: (name: string, color: string, type: string) => Promise<void>;
  updateCategory: (id: string, name: string, color: string, type: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearCategoriesByType: (type: string) => Promise<void>;
  clearAllCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  getCategoriesByType: (type: string) => Category[];
}

export const useCategory = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, color: string, type: string) => {
    try {
      setError(null);
      await CategoryService.createCategory(name, color, type);
      await loadCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    }
  };

  const updateCategory = async (id: string, name: string, color: string, type: string) => {
    try {
      setError(null);
      await CategoryService.updateCategory(id, name, color, type);
      await loadCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await CategoryService.deleteCategory(id);
      await loadCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar categoria');
      throw err;
    }
  };

  const clearCategoriesByType = async (type: string) => {
    try {
      setError(null);
      await CategoryService.clearCategoriesByType(type);
      await loadCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar categorias por tipo');
      throw err;
    }
  };

  const clearAllCategories = async () => {
    try {
      setError(null);
      await CategoryService.clearAllCategories();
      await loadCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar todas as categorias');
      throw err;
    }
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  const getCategoriesByType = (type: string): Category[] => {
    return categories.filter(category => category.type === type);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    clearCategoriesByType,
    clearAllCategories,
    refreshCategories,
    getCategoriesByType,
  };
};