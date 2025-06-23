import nlp from 'compromise';
import { translateKeywordLocally, detectExpenseType } from './translator';

export type ParsedExpense = {
  title: string;
  price: number;
  type: 'Ganhos' | 'Perdas';
};

export async function parseExpense(text: string): Promise<ParsedExpense | null> {
  const original = text.toLowerCase();
  const translated = translateKeywordLocally(original);
  const doc = nlp(translated);

  const numbers = doc.numbers().toNumber().out('array');
  if (!numbers.length) return null;

  const price = parseFloat(numbers[0]);
  if (isNaN(price)) return null;

  let type = detectExpenseType(translated);

  if (!type || type !== 'Ganhos') {
    if (/\b(gastei|paguei|comprei|perdi|investi)\b/.test(translated)) {
      type = 'Perdas';
    } else if (/\b(recebi|ganhei|vendi|entrou|salário)\b/.test(translated)) {
      type = 'Ganhos';
    }
  }

  const cleanedTitle = text.trim().replace(/\s+/g, ' ');

  const capitalizedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

  return {
    title: capitalizedTitle,
    price,
    type,
  };
}
