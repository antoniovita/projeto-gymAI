import { ExpenseController } from '../controller/expensesController';
import { ExpenseType, Expense } from 'api/types/expenseTypes';

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
};