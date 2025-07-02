import { ExpenseController } from '../controller/expensesController';

export const ExpenseService = {


  createExpense: async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ): Promise<string> => {
    const response = await ExpenseController.createExpense(
      name,
      amount,
      userId,
      date,
      time,
      type
    );
    if (!response.success || typeof response.expenseId !== 'string') {
      throw new Error(response.error || 'Erro ao criar despesa.');
    }
    return response.expenseId;
  },


  getExpenses: async (
    userId: string
  ): Promise<import('../model/Expenses').Expense[]> => {
    const response = await ExpenseController.getExpenses(userId);
    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.error || 'Erro ao buscar despesas.');
    }
    return response.data;
  },


  getExpensesByType: async (
    userId: string,
    type: string
  ): Promise<import('../model/Expenses').Expense[]> => {
    const response = await ExpenseController.getExpensesByType(userId, type);
    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.error || 'Erro ao buscar despesas por tipo.');
    }
    return response.data;
  },


  updateExpense: async (
    expenseId: string,
    updates: Partial<Omit<import('../model/Expenses').Expense, 'id' | 'user_id'>>
  ): Promise<number> => {
    const response = await ExpenseController.updateExpense(expenseId, updates);
    if (!response.success || typeof response.updatedCount !== 'number') {
      throw new Error(response.error || 'Erro ao atualizar despesa.');
    }
    return response.updatedCount;
  },


  deleteExpense: async (
    expenseId: string
  ): Promise<boolean> => {
    const response = await ExpenseController.deleteExpense(expenseId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar despesa.');
    }
    return true;
  },

  clearExpensesByUser: async (
    userId: string
  ): Promise<number> => {
    const response = await ExpenseController.clearExpensesByUser(userId);
    if (!response.success || typeof response.deletedCount !== 'number') {
      throw new Error(response.error || 'Erro ao limpar despesas.');
    }
    return response.deletedCount;
  }
};
