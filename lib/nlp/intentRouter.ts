import { parseExpense } from './expenseParser';
import { parseDate } from './dateParser';

export type IntentType = 'expense' | 'task' | 'unknown';

export async function detectIntent(text: string): Promise<IntentType> {
  if (await parseDate(text)) return 'task';
  if (await parseExpense(text)) return 'expense';
  return 'unknown';
}
