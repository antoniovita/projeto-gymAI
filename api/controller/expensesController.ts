import { getDb } from '../../database';
import { ExpenseModel } from '../model/Expenses';

//types
import { Expense, ExpenseType } from 'api/types/expenseTypes';

export const ExpenseController = {
  createExpense: async (
    name: string,
    amount: number, // em centavos
    expenseType: ExpenseType,
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
        expenseType,
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

  getExpensesByExpenseType: async (userId: string, expenseType: ExpenseType) => {
    const db = getDb();
    try {
      const expenses = await ExpenseModel.getExpensesByExpenseType(db, userId, expenseType);
      return { success: true, data: expenses };
    } catch (error) {
      console.error('Erro ao buscar por expense_type no controller:', error);
      return { success: false, error: 'Erro ao buscar por tipo de transação.' };
    }
  },

  getGains: async (userId: string) => {
    const db = getDb();
    try {
      const gains = await ExpenseModel.getExpensesByExpenseType(db, userId, ExpenseType.GAIN);
      return { success: true, data: gains };
    } catch (error) {
      console.error('Erro ao buscar ganhos no controller:', error);
      return { success: false, error: 'Erro ao buscar ganhos.' };
    }
  },

  getLosses: async (userId: string) => {
    const db = getDb();
    try {
      const losses = await ExpenseModel.getExpensesByExpenseType(db, userId, ExpenseType.LOSS);
      return { success: true, data: losses };
    } catch (error) {
      console.error('Erro ao buscar perdas no controller:', error);
      return { success: false, error: 'Erro ao buscar perdas.' };
    }
  },

  getTotalGains: async (userId: string) => {
    const db = getDb();
    try {
      const total = await ExpenseModel.getTotalByExpenseType(db, userId, ExpenseType.GAIN);
      return { success: true, total };
    } catch (error) {
      console.error('Erro ao calcular total de ganhos no controller:', error);
      return { success: false, error: 'Erro ao calcular total de ganhos.' };
    }
  },

  getTotalLosses: async (userId: string) => {
    const db = getDb();
    try {
      const total = await ExpenseModel.getTotalByExpenseType(db, userId, ExpenseType.LOSS);
      return { success: true, total };
    } catch (error) {
      console.error('Erro ao calcular total de perdas no controller:', error);
      return { success: false, error: 'Erro ao calcular total de perdas.' };
    }
  },

  getBalance: async (userId: string) => {
    const db = getDb();
    try {
      const balance = await ExpenseModel.getBalance(db, userId);
      return { success: true, balance };
    } catch (error) {
      console.error('Erro ao calcular saldo no controller:', error);
      return { success: false, error: 'Erro ao calcular saldo.' };
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