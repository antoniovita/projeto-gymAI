import nlp from 'compromise';
import { translateKeywordLocally } from './translator';

export async function extractTitle(originalText: string, excludeText: string): Promise<string> {
  const cleaned = originalText.replace(excludeText, '').trim();
  const translated = translateKeywordLocally(cleaned);

  const doc = nlp(translated);
  const nouns = doc.nouns().out('text');

  return nouns || cleaned || 'Tarefa';
}
