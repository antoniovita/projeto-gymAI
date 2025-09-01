import { ExpenseController } from '../controller/expensesController';
import { Expense, ExpenseType } from '../model/Expenses';

export const ExpenseService = {
  createExpense: async (
    name: string,
    amount: number,
    expenseType: ExpenseType,
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ): Promise<string> => {
    const response = await ExpenseController.createExpense(
      name,
      amount,
      expenseType,
      userId,
      date,
      time,
      type
    );
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar despesa.');
    }
    return response.expenseId!;
  },

  getExpenses: async (userId: string): Promise<Expense[]> => {
    const response = await ExpenseController.getExpenses(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar despesas.');
    }
    return response.data!;
  },

  getExpensesByType: async (
    userId: string,
    type: string
  ): Promise<Expense[]> => {
    const response = await ExpenseController.getExpensesByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar despesas por tipo.');
    }
    return response.data!;
  },

  getExpensesByExpenseType: async (
    userId: string,
    expenseType: ExpenseType
  ): Promise<Expense[]> => {
    const response = await ExpenseController.getExpensesByExpenseType(userId, expenseType);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar por tipo de transação.');
    }
    return response.data!;
  },

  getGains: async (userId: string): Promise<Expense[]> => {
    const response = await ExpenseController.getGains(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar ganhos.');
    }
    return response.data!;
  },

  getLosses: async (userId: string): Promise<Expense[]> => {
    const response = await ExpenseController.getLosses(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar perdas.');
    }
    return response.data!;
  },

  getTotalGains: async (userId: string): Promise<number> => {
    const response = await ExpenseController.getTotalGains(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao calcular total de ganhos.');
    }
    return response.total!;
  },

  getTotalLosses: async (userId: string): Promise<number> => {
    const response = await ExpenseController.getTotalLosses(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao calcular total de perdas.');
    }
    return response.total!;
  },

  getBalance: async (userId: string): Promise<number> => {
    const response = await ExpenseController.getBalance(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao calcular saldo.');
    }
    return response.balance!;
  },

  updateExpense: async (
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'user_id'>>
  ): Promise<number> => {
    const response = await ExpenseController.updateExpense(expenseId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar despesa.');
    }
    return response.updatedCount!;
  },

  deleteExpense: async (expenseId: string): Promise<boolean> => {
    const response = await ExpenseController.deleteExpense(expenseId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar despesa.');
    }
    return true;
  },

  clearExpensesByUser: async (userId: string): Promise<number> => {
    const response = await ExpenseController.clearExpensesByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar despesas.');
    }
    return response.deletedCount!;
  },

  // Métodos utilitários para facilitar o uso
  createGain: async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ): Promise<string> => {
    return await ExpenseService.createExpense(
      name,
      amount,
      ExpenseType.GAIN,
      userId,
      date,
      time,
      type
    );
  },

  createLoss: async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ): Promise<string> => {
    return await ExpenseService.createExpense(
      name,
      amount,
      ExpenseType.LOSS,
      userId,
      date,
      time,
      type
    );
  },

  // Métodos para conversão de valores (centavos para reais e vice-versa)
  convertCentsToReals: (cents: number): number => {
    return cents / 100;
  },

  convertRealsToCents: (reals: number): number => {
    return Math.round(reals * 100);
  },

  formatCurrency: (cents: number): string => {
    const reals = ExpenseService.convertCentsToReals(cents);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(reals);
  }
};