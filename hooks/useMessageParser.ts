import { detectIntent } from '../lib/nlp/intentRouter';
import { parseDate } from '../lib/nlp/dateParser';
import { extractTitle } from '../lib/nlp/entityExtractor';
import { parseExpense } from '../lib/nlp/expenseParser';
import { useTask } from './useTask';
import { useExpenses } from './useExpenses';

const GAIN_KEYWORDS = [
  'ganhei', 'ganho', 'ganhos', 'ganha',
  'recebi', 'receber', 'recebo', 'rebecebi', 'reçebi',
  'entrou', 'entram', 'entrada',
  'consegui', 'consigui', 'conseguir', 'consegi',
  'depositaram', 'deposito', 'depósito',
  'vendi', 'venda', 'vendido',
  'lucro', 'lucrei', 'lucrar',
  'pix recebido', 'pagaram', 'pagamento', 'pagaram-me'
];

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function inferExpenseType(text: string): 'Ganhos' | 'Perdas' {
  const input = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = input.split(/\s+/);

  for (const word of words) {
    for (const keyword of GAIN_KEYWORDS) {
      const cleanKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (levenshtein(word, cleanKeyword) <= 2) {
        return 'Ganhos';
      }
    }
  }

  return 'Perdas';
}

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
      userId,
      date,
      time,
      expense.type 
    );

    console.log('[NLP] Despesa criada:', expense, 'Tipo:', expense.type);
  }
}
    else if (intent === 'task') {
        const date = await parseDate(text);
        const nowISO = new Date().toISOString();
        const datetimeISO = date?.datetimeISO ?? nowISO;
        const rawText = date?.rawText ?? '';
        const title = await extractTitle(text, rawText);

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
