import * as chrono from 'chrono-node';
import nlp from 'compromise';
import nlpDates from 'compromise-dates';
import { translateKeywordLocally } from './translator';

nlp.plugin(nlpDates);

function normalizeText(text: string): string {
  return text
    .replace(/\b(\d{1,2})\s+horas?\b/gi, '$1:00')
    .replace(/\b(\d{1,2})\s*h\b/gi, '$1:00')

    .replace(/\bamn\b/gi, 'amanhã')
    .replace(/\bamnh\b/gi, 'amanhã')
    .replace(/\bdps\b/gi, 'depois')
    .replace(/\bhj\b/gi, 'hoje')
    .replace(/\bagr\b/gi, 'agora')
    .replace(/\bont\b/gi, 'ontem');
}

function hasStrongFinancialContext(text: string): boolean {
  const financialPatterns = [
    /\b(comprei|gastei|paguei|custou|preço|valor|emprestei)\b/i,
    /\b(recebi|ganhei|vendi|rendeu|lucrei)\b/i,
    /\b(reais?|r\$|dinheiro|dólares?|euros?)\b/i,
    /\d+\s*(reais?|r\$|dólares?|euros?)/i,
    /r\$\s*\d+/i,
    /\b(investimento|empréstimo|financiamento|parcela)\b/i,
    /\b(conta|fatura|boleto|pagamento)\b/i
  ];
  return financialPatterns.some(pattern => pattern.test(text));
}

function hasStrongTaskContext(text: string): boolean {
  const taskPatterns = [
    /\b(vou|preciso|tenho que|devo|deveria|tenho|horas|hrs|hr|h)\b/i,
    /\b(reunião|encontro|consulta|visita|compromisso)\b/i,
    /\b(lembrar|fazer|terminar|completar|entregar)\b/i,
    /\b(ir ao|ir para|ir em|ir no|ir na)\b/i,
    /\b(agenda|marcar|agendar|programar)\b/i,
    /\b(médico|dentista|trabalho|escritório|faculdade)\b/i
  ];
  return taskPatterns.some(pattern => pattern.test(text));
}

function isTemporalExpression(text: string): boolean {
  const temporalOnly = /^(hoje|amanhã|ontem|agora|depois|manhã|tarde|noite|segunda|terça|quarta|quinta|sexta|sábado|domingo|\d{1,2}:\d{2}|\d{1,2}h|\d{1,2} horas?|horas?|h)$/i;
  return temporalOnly.test(text.trim());
}

export async function parseDate(text: string): Promise<{ datetimeISO: string; rawText: string } | null> {
  const normalizedText = normalizeText(text);

  if (hasStrongFinancialContext(normalizedText) && !isTemporalExpression(normalizedText)) {
    if (!hasStrongTaskContext(normalizedText)) {
      return null;
    }
  }

  const chronoResult = chrono.pt.parse(normalizedText);
  if (chronoResult.length > 0) {
    const date = chronoResult[0].date();
    return {
      datetimeISO: date.toISOString(),
      rawText: text,
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
        rawText: text,
      };
    }
  }

  return null;
}