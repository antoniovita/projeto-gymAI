//nlp imports
import { detectIntent } from '../nlp/intentRouter';
import { parseDate } from '../nlp/dateParser';
import { parseExpense } from '../nlp/expenseParser';

//hooks imports
import { useTask } from './useTask';
import { useExpenses } from './useExpenses';

//types
import { ExpenseType } from 'api/types/expenseTypes';


export function useMessageParser(userId: string | null) {
  const { createTask } = useTask();
  const { createExpense } = useExpenses();

  const processMessage = async (text: string): Promise<'task' | 'expense' | 'unknown'> => {
    if (!text.trim() || !userId) return 'unknown';

    const intent = await detectIntent(text);

    try {
      if (intent === 'expense') {
        const expense = await parseExpense(text);
        if (expense) {
          const now = new Date();
          const date = now.toISOString().split('T')[0];
          const time = now.toISOString();

          await createExpense(
            expense.title,
            expense.price,
            expense.type as ExpenseType,
            userId,
            date,
            time,
          );

          console.log('[NLP] Despesa criada:', expense, 'Tipo:', expense.type);
        }
      } else if (intent === 'task') {
        const dateResult = await parseDate(text);
        const nowISO = new Date().toISOString();
        const datetimeISO = dateResult?.datetimeISO ?? nowISO;
        
        const title = (dateResult?.rawText || text.trim()).replace(/^./, c => c.toUpperCase());

        await createTask(title, '', datetimeISO, userId);
        console.log('[NLP] Tarefa criada:', { title, datetime: datetimeISO });
      }
    } catch (err) {
      console.error('[NLP] Erro ao processar mensagem:', err);
    }

    return intent;
  };

  return { processMessage };
}