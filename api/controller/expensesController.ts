import { getDb } from '../../database';
import { Expense, ExpenseModel } from '../model/Expenses';

export const ExpenseController = {

  createExpense: async (
    name: string,
    amount: number,  // em centavos
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ) => {
    const db = getDb();
    try {
      const expenseId = await ExpenseModel.createExpense(
        db,
        name,
        amount,
        userId,
        date,
        time,
        type
      );
      return { success: true, expenseId };
    } catch (error) {
      console.error('Erro ao criar despesa no controller:', error);
      return { success: false, error: 'Erro ao criar despesa.' };
    }
  },

  getExpenses: async (userId: string) => {
    const db = getDb();
    try {
      const expenses = await ExpenseModel.getExpensesByUserId(db, userId);
      return { success: true, data: expenses };
    } catch (error) {
      console.error('Erro ao buscar despesas no controller:', error);
      return { success: false, error: 'Erro ao buscar despesas.' };
    }
  },

  getExpensesByType: async (userId: string, type: string) => {
    const db = getDb();
    try {
      const expenses = await ExpenseModel.getExpensesByType(db, userId, type);
      return { success: true, data: expenses };
    } catch (error) {
      console.error('Erro ao buscar despesas por tipo no controller:', error);
      return { success: false, error: 'Erro ao buscar despesas por tipo.' };
    }
  },

  updateExpense: async (expenseId: string, updates: Partial<Omit<Expense, 'id' | 'user_id'>>) => {
    const db = getDb();
    try {
      const changes = await ExpenseModel.updateExpense(db, expenseId, updates);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar despesa no controller:', error);
      return { success: false, error: 'Erro ao atualizar despesa.' };
    }
  },

  deleteExpense: async (expenseId: string) => {
    const db = getDb();
    try {
      const changes = await ExpenseModel.deleteExpense(db, expenseId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar despesa no controller:', error);
      return { success: false, error: 'Erro ao deletar despesa.' };
    }
  },

  clearExpensesByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await ExpenseModel.clearExpensesByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar despesas no controller:', error);
      return { success: false, error: 'Erro ao limpar despesas.' };
    }
  }
};
