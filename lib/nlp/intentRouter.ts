import { parseExpense } from './expenseParser';
import { parseDate } from './dateParser';

export type IntentType = 'expense' | 'task' | 'unknown';

export async function detectIntent(text: string): Promise<IntentType> {
  if (await parseExpense(text)) return 'expense';
  if (await parseDate(text)) return 'task';
  return 'unknown';
}
