import nlp from 'compromise';
import { translateKeywordLocally, detectExpenseType } from './translator';

export type ParsedExpense = {
  title: string;
  price: number;
  type: 'GAIN' | 'LOSS';
};

function hasFinancialContext(text: string): boolean {
  const financialPatterns = [
    /\b(comprei|gastei|paguei|custou|preço|valor)\b/i,
    /\b(recebi|ganhei|vendi|rendeu|lucrei)\b/i,
    /\b(investi|emprestei|financiei|parcelei)\b/i,
    
    /\b(reais?|r\$|dinheiro|dólares?|euros?)\b/i,
    /\d+\s*(reais?|r\$|dólares?|euros?)/i,
    /r\$\s*\d+/i,
    
    /\b(conta|fatura|boleto|pagamento|transferência)\b/i,
    /\b(salário|comissão|desconto|taxa|juros)\b/i,
    /\b(cartão|débito|crédito|pix|dinheiro)\b/i,
    /\b(loja|mercado|supermercado|farmácia|posto)\b/i
  ];
  
  return financialPatterns.some(pattern => pattern.test(text));
}

function extractPrice(text: string): number | null {
  const doc = nlp(text);
  const numbers = doc.numbers().toNumber().out('array');
  
  if (!numbers.length) {
    const pricePatterns = [
      /r\$\s*(\d+(?:[.,]\d{2})?)/i,
      /(\d+(?:[.,]\d{2})?)\s*reais?/i,
      /(\d+(?:[.,]\d{2})?)\s*r\$/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const price = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(price)) return price;
      }
    }
    
    return null;
  }

  const price = parseFloat(numbers[0]);
  return isNaN(price) ? null : price;
}

function determineExpenseType(text: string): 'GAIN' | 'LOSS' {

  const expensePatterns = [
    /\b(gastei|paguei|comprei|perdi|custou)\b/i,
    /\b(investi|emprestei|financiei|parcelei)\b/i,
    /\b(conta|fatura|boleto|taxa|juros)\b/i,
    /\b(mercado|loja|supermercado|farmácia|posto|restaurante)\b/i
  ];
  
  const incomePatterns = [
    /\b(recebi|ganhei|vendi|lucrei|rendeu)\b/i,
    /\b(salário|comissão|bonus|prêmio|recompensa)\b/i,
    /\b(vendas?|lucro|rendimento|dividendos?)\b/i,
    /\b(entrou|creditou|depositou)\b/i
  ];
  
  const hasExpensePattern = expensePatterns.some(pattern => pattern.test(text));
  const hasIncomePattern = incomePatterns.some(pattern => pattern.test(text));
  
  if (hasExpensePattern && !hasIncomePattern) return 'LOSS';
  if (hasIncomePattern && !hasExpensePattern) return 'GAIN';
  
  if (/\b(comprei|gastei|paguei)\b/i.test(text)) return 'LOSS';
  if (/\b(recebi|ganhei|vendi)\b/i.test(text)) return 'GAIN';
  
  return 'LOSS';
}

export async function parseExpense(text: string): Promise<ParsedExpense | null> {
  const original = text.toLowerCase();
  const translated = translateKeywordLocally(original);
  
  if (!hasFinancialContext(translated)) {
    return null;
  }
  
  const price = extractPrice(translated);
  if (price === null || price <= 0) {
    return null;
  }
  
  let type = detectExpenseType(translated);
  
  if (!type) {
    type = determineExpenseType(translated);
  }
  
  if (!text || text.trim().length < 2) {
    return null;
  }
  
  return {
    title: text.charAt(0).toUpperCase() + text.slice(1),
    price,
    type,
  };
}