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

  const type = detectExpenseType(translated);

  const cleaned = translated
    .replace(numbers[0], '')
    .replace(/(bought|spent|paid|for|on|received|won|reais|real|r\$|by|from|earned|gain|got|found|salary|sold|pix received|paid me|lost|in|at|na|no|de|do|da|por)/gi, '')
    .trim();

  const nouns = nlp(cleaned).nouns().out('array');
  let title = nouns.length > 0
    ? nouns[nouns.length - 1]
    : cleaned || 'Entrada/Saída';

  title = title.replace(/\s+/g, ' ').trim();

  return {
    title,
    price,
    type,
  };
}
