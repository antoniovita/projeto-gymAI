import { ExpenseController } from '../controller/expensesController';

export const ExpenseService = {

  createExpense: async (
    name: string,
    amount: number,
    userId: string,
    date?: string,
    time?: string,
    type?: string,
    routineId?: string
  ) => {
    const response = await ExpenseController.createExpense(
      name, amount, userId, date, time, type, routineId
    );
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar despesa.');
    }
    return response.expenseId;
  },

  getExpenses: async (userId: string) => {
    const response = await ExpenseController.getExpenses(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar despesas.');
    }
    return response.data;
  },

  getExpensesByType: async (userId: string, type: string) => {
    const response = await ExpenseController.getExpensesByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar despesas por tipo.');
    }
    return response.data;
  },

  updateExpense: async (
    expenseId: string,
    updates: Partial<{
      name: string;
      date: string;
      time?: string;
      amount?: number;
      type?: string;
      routine_id?: string;
    }>
  ) => {
    const response = await ExpenseController.updateExpense(expenseId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar despesa.');
    }
    return response.updatedCount;
  },

  deleteExpense: async (expenseId: string) => {
    const response = await ExpenseController.deleteExpense(expenseId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar despesa.');
    }
    return true;
  },

  clearExpensesByUser: async (userId: string) => {
    const response = await ExpenseController.clearExpensesByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar despesas.');
    }
    return response.deletedCount;
  }
};
