const keywordMap: Record<string, string> = {
  // Despesas
  'comprei': 'bought',
  'comprar': 'buy',
  'compra': 'purchase',
  'gastei': 'spent',
  'gastou': 'spent',
  'gastando': 'spending',
  'gasto': 'spent',
  'pagamento': 'payment',
  'paguei': 'paid',
  'pagar': 'pay',
  'investi': 'invested',
  'investimento': 'investment',
  'usei': 'used',
  'perdi': 'lost',
  'doei': 'donated',
  'transferi': 'transferred',
  'enviei': 'sent',
  'retirei': 'withdrew',
  'retirada': 'withdrawal',

  // Ganhos
  'ganhei': 'earned',
  'ganho': 'gain',
  'ganhos': 'earnings',
  'ganhando': 'earning',
  'recebi': 'received',
  'receita': 'income',
  'consegui': 'got',
  'achei': 'found',
  'vendi': 'sold',
  'venda': 'sale',
  'depositaram': 'deposited',
  'deposito': 'deposit',
  'salario': 'salary',
  'salário': 'salary',
  'pagaram': 'paid me',
  'pix recebido': 'pix received',
  'pix': 'pix',

  // Expressões de dinheiro
  'grana': 'money',
  'bufunfa': 'cash',
  'dinheiro': 'money',
  'real': 'real',
  'reais': 'reais',
  'r$': 'reais',
  'valeu': 'received',
  'entrou': 'came in',
  'saiu': 'went out',

  // Expressões
  'gastei com': 'spent on',
  'paguei por': 'paid for',
  'ganhei de': 'earned from',
  'recebi de': 'received from',
  'vendi para': 'sold to',
  'doei para': 'donated to',
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')               
    .replace(/[\u0300-\u036f]/g, '')  
    .toLowerCase();
}

export function translateKeywordLocally(text: string): string {
  const normalized = normalizeText(text);
  return Object.entries(keywordMap).reduce((translated, [pt, en]) => {
    const normKey = normalizeText(pt);
    return translated.replace(new RegExp(`\\b${normKey}\\b`, 'gi'), en);
  }, normalized);
}

export function detectExpenseType(translatedText: string): 'Ganhos' | 'Perdas' {
  const lower = translatedText.toLowerCase();

  const gainKeywords = [
    'earned', 'gain', 'received', 'got', 'found', 'salary',
    'sold', 'deposited', 'income', 'pix received', 'paid me',
  ];

  const lossKeywords = [
    'lost', 'spent', 'paid', 'donated', 'withdrew', 'bought', 'used', 'gave', 'transferred',
  ];

  if (gainKeywords.some(k => lower.includes(k))) return 'Ganhos';
  if (lossKeywords.some(k => lower.includes(k))) return 'Perdas';
  return 'Perdas';
}
