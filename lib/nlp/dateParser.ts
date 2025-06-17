import * as chrono from 'chrono-node';
import nlp from 'compromise';
import nlpDates from 'compromise-dates';
import { translateKeywordLocally } from './translator'; 

nlp.plugin(nlpDates);

export async function parseDate(text: string): Promise<{ datetimeISO: string, rawText: string } | null> {
  // 1. Tenta com chrono-node em pt
  const chronoResult = chrono.pt.parse(text);
  if (chronoResult.length > 0) {
    const date = chronoResult[0].date();
    return {
      datetimeISO: date.toISOString(),
      rawText: chronoResult[0].text,
    };
  }

  // 2. Tenta com compromise em texto traduzido localmente
  const translated = translateKeywordLocally(text); // tradução local por palavras
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
