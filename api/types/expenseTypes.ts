export enum ExpenseType {
  GAIN = 'GAIN',
  LOSS = 'LOSS'
}

export interface Expense {
  id: string;
  name: string;
  date?: string;
  time?: string;
  amount: number; // em centavos
  expense_type: ExpenseType; // GAIN ou LOSS
  type?: string; // categoria da despesa/receita
  user_id: string;
}