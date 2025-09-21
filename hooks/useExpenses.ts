//general imports
import { useState } from 'react';

//services
import { ExpenseService } from '../api/service/expensesService'; 

//types
import { Expense, ExpenseType } from 'api/types/expenseTypes';

export const useExpenses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const createExpense = async (
    name: string,
    amount: number,
    expenseType: ExpenseType,
    userId: string,
    date?: string,
    time?: string,
    type?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[createExpense] Criando despesa com:', { name, amount, expenseType, userId, date, time, type });
      const expenseId = await ExpenseService.createExpense(name, amount, expenseType, userId, date, time, type);
      console.log('[createExpense] Despesa criada com ID:', expenseId);
      return expenseId;
    } catch (err: any) {
      setError(err.message);
      console.error('[createExpense] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ExpenseService.getExpenses(userId);
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchExpenses] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (
    expenseId: string,
    updates: Partial<{
      name: string;
      date: string;
      time?: string;
      amount?: number;
      type?: string;
      expense_type?: ExpenseType;
    }>
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[updateExpense] Atualizando despesa:', { expenseId, updates });
      const updatedCount = await ExpenseService.updateExpense(expenseId, updates);
      console.log('[updateExpense] Despesa atualizada:', updatedCount);
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[updateExpense] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[deleteExpense] Deletando despesa ID:', expenseId);
      await ExpenseService.deleteExpense(expenseId);
      console.log('[deleteExpense] Despesa deletada com sucesso');
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('[deleteExpense] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearExpensesByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[clearExpensesByUser] Limpando despesas do usuário:', userId);
      const deletedCount = await ExpenseService.clearExpensesByUser(userId);
      console.log('[clearExpensesByUser] Total deletado:', deletedCount);
      return deletedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[clearExpensesByUser] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const debugAllExpenses = async () => {
    const all = await ExpenseService.getExpenses('debug-user-id');
    console.log('[HOOK] Despesas no banco:', all);
  };

  return {
    loading,
    error,
    expenses,
    createExpense,
    updateExpense,
    deleteExpense,
    clearExpensesByUser,
    fetchExpenses,
    debugAllExpenses,
  };
};