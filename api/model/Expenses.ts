import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Expense {
  id: string;
  name: string;
  date?: string;
  time?: string;
  amount: number; // in cents (INTEGER)
  type?: string;
  user_id: string;
  routine_id?: string;
}

export const ExpenseModel = {

  createExpense: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    amount: number, // in cents
    userId: string,
    date?: string,
    time?: string,
    type?: string,
    routineId?: string
  ) => {
    const expenseId = uuid.v4() as string;

    await db.runAsync(
      `INSERT INTO expenses (id, name, date, time, amount, type, user_id, routine_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      expenseId,
      name,
      date ?? null,
      time ?? null,
      amount,
      type ?? null,
      userId,
      routineId ?? null
    );

    return expenseId;
  },

  getExpensesByUserId: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const expenses = await db.getAllAsync(
      'SELECT * FROM expenses WHERE user_id = ?',
      userId
    );
    return expenses as Expense[];
  },

  getExpensesByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string) => {
    const expenses = await db.getAllAsync(
      'SELECT * FROM expenses WHERE user_id = ? AND type = ?',
      userId,
      type
    );
    return expenses as Expense[];
  },

  updateExpense: async (
    db: SQLite.SQLiteDatabase,
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'user_id'>>
  ) => {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const result = await db.runAsync(
      `UPDATE expenses SET ${fields} WHERE id = ?`,
      ...values,
      expenseId
    );

    return result.changes;
  },

  deleteExpense: async (db: SQLite.SQLiteDatabase, expenseId: string) => {
    const result = await db.runAsync(
      'DELETE FROM expenses WHERE id = ?',
      expenseId
    );
    return result.changes;
  },

  clearExpensesByUser: async (db: SQLite.SQLiteDatabase, userId: string) => {
    const result = await db.runAsync(
      'DELETE FROM expenses WHERE user_id = ?',
      userId
    );
    return result.changes;
  }
};
