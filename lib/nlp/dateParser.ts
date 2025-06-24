import * as chrono from 'chrono-node';
import nlp from 'compromise';
import nlpDates from 'compromise-dates';
import { translateKeywordLocally } from './translator';

nlp.plugin(nlpDates);

function normalizeText(text: string): string {
  return text
    .replace(/\bamn\b/gi, 'amanhã')
    .replace(/\bamnh\b/gi, 'amanhã')
    .replace(/\bdps\b/gi, 'depois')
    .replace(/\bhj\b/gi, 'hoje')
    .replace(/\bagr\b/gi, 'agora')
    .replace(/\bont\b/gi, 'ontem');
}

export async function parseDate(text: string): Promise<{ datetimeISO: string, rawText: string } | null> {
  const normalizedText = normalizeText(text);

  const chronoResult = chrono.pt.parse(normalizedText);
  if (chronoResult.length > 0) {
    const date = chronoResult[0].date();
    return {
      datetimeISO: date.toISOString(),
      rawText: chronoResult[0].text,
    };
  }

  const translated = translateKeywordLocally(normalizedText);
  const doc = nlp(translated);
  const dates = (doc as any).dates().json();

  if (dates.length > 0) {
    const dateStr = dates[0].dates[0]?.start;
    if (dateStr) {
      const date = new Date(dateStr);
      return {
        datetimeISO: date.toISOString(),
        rawText: dates[0].text,
      };
    }
  }

  return null;
}
