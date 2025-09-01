import { useState } from 'react';
import { ExpenseService } from '../api/service/expensesService'; 
import { Expense, ExpenseType } from '../api/model/Expenses'; 

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

  // Métodos de conveniência para criar ganhos e perdas
  const createGain = async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string,
  ) => {
    return await createExpense(name, amount, ExpenseType.GAIN, userId, date, time, type);
  };

  const createLoss = async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string,
  ) => {
    return await createExpense(name, amount, ExpenseType.LOSS, userId, date, time, type);
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

  const fetchExpensesByType = async (userId: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[fetchExpensesByType] Buscando por tipo:', { userId, type });
      const data = await ExpenseService.getExpensesByType(userId, type);
      console.log('[fetchExpensesByType] Despesas retornadas:', data);
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchExpensesByType] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpensesByExpenseType = async (userId: string, expenseType: ExpenseType) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[fetchExpensesByExpenseType] Buscando por expense type:', { userId, expenseType });
      const data = await ExpenseService.getExpensesByExpenseType(userId, expenseType);
      console.log('[fetchExpensesByExpenseType] Despesas retornadas:', data);
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchExpensesByExpenseType] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGains = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[fetchGains] Buscando ganhos para usuário:', userId);
      const data = await ExpenseService.getGains(userId);
      console.log('[fetchGains] Ganhos retornados:', data);
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchGains] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLosses = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[fetchLosses] Buscando perdas para usuário:', userId);
      const data = await ExpenseService.getLosses(userId);
      console.log('[fetchLosses] Perdas retornadas:', data);
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchLosses] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGains = async (userId: string): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      console.log('[getTotalGains] Calculando total de ganhos para:', userId);
      const total = await ExpenseService.getTotalGains(userId);
      console.log('[getTotalGains] Total de ganhos:', total);
      return total;
    } catch (err: any) {
      setError(err.message);
      console.error('[getTotalGains] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalLosses = async (userId: string): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      console.log('[getTotalLosses] Calculando total de perdas para:', userId);
      const total = await ExpenseService.getTotalLosses(userId);
      console.log('[getTotalLosses] Total de perdas:', total);
      return total;
    } catch (err: any) {
      setError(err.message);
      console.error('[getTotalLosses] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBalance = async (userId: string): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      console.log('[getBalance] Calculando saldo para:', userId);
      const balance = await ExpenseService.getBalance(userId);
      console.log('[getBalance] Saldo calculado:', balance);
      return balance;
    } catch (err: any) {
      setError(err.message);
      console.error('[getBalance] Erro:', err);
      throw err;
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

  // Métodos utilitários para formatação de valores
  const formatCurrency = (cents: number): string => {
    return ExpenseService.formatCurrency(cents);
  };

  const convertCentsToReals = (cents: number): number => {
    return ExpenseService.convertCentsToReals(cents);
  };

  const convertRealsToCents = (reals: number): number => {
    return ExpenseService.convertRealsToCents(reals);
  };

  return {
    loading,
    error,
    expenses,
    // Métodos CRUD básicos
    createExpense,
    createGain,
    createLoss,
    updateExpense,
    deleteExpense,
    clearExpensesByUser,
    // Métodos de busca
    fetchExpenses,
    fetchExpensesByType,
    fetchExpensesByExpenseType,
    fetchGains,
    fetchLosses,
    // Métodos de cálculo
    getTotalGains,
    getTotalLosses,
    getBalance,
    // Métodos utilitários
    formatCurrency,
    convertCentsToReals,
    convertRealsToCents,
    debugAllExpenses,
  };
};