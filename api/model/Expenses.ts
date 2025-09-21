import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';
import { Expense, ExpenseType } from 'api/types/expenseTypes';


export const ExpenseModel = {
  createExpense: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    amount: number, // em centavos
    expenseType: ExpenseType,
    userId: string,
    date?: string,
    time?: string,
    type?: string
  ): Promise<string> => {
    const expenseId = uuid.v4() as string;
    await db.runAsync(
      `INSERT INTO expenses (id, name, date, time, amount, expense_type, type, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      expenseId,
      name,
      date ?? null,
      time ?? null,
      amount,
      expenseType,
      type ?? null,
      userId
    );
    return expenseId;
  },

  getExpensesByUserId: async (
    db: SQLite.SQLiteDatabase,
    userId: string
  ): Promise<Expense[]> => {
    const expenses = await db.getAllAsync(
      'SELECT * FROM expenses WHERE user_id = ?',
      userId
    );
    return expenses as Expense[];
  },

  getExpensesByType: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    type: string
  ): Promise<Expense[]> => {
    const expenses = await db.getAllAsync(
      'SELECT * FROM expenses WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return expenses as Expense[];
  },

  getExpensesByExpenseType: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    expenseType: ExpenseType
  ): Promise<Expense[]> => {
    const expenses = await db.getAllAsync(
      'SELECT * FROM expenses WHERE user_id = ? AND expense_type = ?',
      userId,
      expenseType
    );
    return expenses as Expense[];
  },

  updateExpense: async (
    db: SQLite.SQLiteDatabase,
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'user_id'>>
  ): Promise<number> => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    const result = await db.runAsync(
      `UPDATE expenses SET ${fields} WHERE id = ?`,
      ...values,
      expenseId
    );
    return result.changes;
  },

  deleteExpense: async (
    db: SQLite.SQLiteDatabase,
    expenseId: string
  ): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM expenses WHERE id = ?',
      expenseId
    );
    return result.changes;
  },

  clearExpensesByUser: async (
    db: SQLite.SQLiteDatabase,
    userId: string
  ): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM expenses WHERE user_id = ?',
      userId
    );
    return result.changes;
  },

  // métodos utilitários para cálculos
  getTotalByExpenseType: async (
    db: SQLite.SQLiteDatabase,
    userId: string,
    expenseType: ExpenseType
  ): Promise<number> => {
    const result = await db.getFirstAsync(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND expense_type = ?',
      userId,
      expenseType
    ) as { total: number | null };
    return result?.total || 0;
  },

  getBalance: async (
    db: SQLite.SQLiteDatabase,
    userId: string
  ): Promise<number> => {
    const gains = await ExpenseModel.getTotalByExpenseType(db, userId, ExpenseType.GAIN);
    const losses = await ExpenseModel.getTotalByExpenseType(db, userId, ExpenseType.LOSS);
    return gains - losses;
  }
};