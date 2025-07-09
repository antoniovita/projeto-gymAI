import { parseExpense } from './expenseParser';
import { parseDate } from './dateParser';

export type IntentType = 'expense' | 'task' | 'unknown';

function hasStrongFinancialContext(text: string): boolean {
  const strongFinancialPatterns = [
    // verbos financeiros específicos
    /\b(comprei|gastei|paguei|custou|preço|valor)\b/i,
    /\b(recebi|ganhei|vendi|rendeu|lucrei)\b/i,
    /\b(investi|emprestei|financiei|parcelei)\b/i,
    
    // valores monetários explícitos
    /\d+\s*(reais?|r\$|dólares?|euros?)/i,
    /r\$\s*\d+/i,
    
    // contexto comercial/financeiro
    /\b(conta|fatura|boleto|pagamento|transferência)\b/i,
    /\b(salário|comissão|desconto|taxa|juros)\b/i,
    /\b(cartão|débito|crédito|pix)\b/i
  ];
  
  return strongFinancialPatterns.some(pattern => pattern.test(text));
}

function hasStrongTaskContext(text: string): boolean {
  const strongTaskPatterns = [

    // verbos de ação/intenção
    /\b(vou|preciso|tenho que|devo|deveria|quero)\b/i,
    /\b(fazer|terminar|completar|entregar|finalizar)\b/i,
    
    // compromissos/eventos
    /\b(reunião|encontro|consulta|visita|compromisso|evento)\b/i,
    /\b(médico|dentista|trabalho|escritório|faculdade|escola)\b/i,
    
    // ações de movimento/localização
    /\b(ir ao|ir para|ir em|ir no|ir na|buscar|pegar)\b/i,
    
    // agendamento
    /\b(agendar|marcar|programar|lembrar)\b/i,
    
    // tarefas domésticas/pessoais
    /\b(limpar|organizar|arrumar|estudar|treinar)\b/i,
    
    // indicadores temporais que sugerem tarefas/compromissos
    /\b(horas?|hrs?|hr|h)\b/i,
    /\b\d{1,2}:\d{2}\b/i, // 14:30, 9:15
    /\b\d{1,2}h\d{0,2}\b/i, // 14h30, 9h
    /\b\d{1,2}\s*(horas?|hrs?|hr|h)\b/i, // 2 horas, 3hrs, 4hr, 5h
    
    // dias da semana (forte indicador de agendamento)
    /\b(segunda|terça|quarta|quinta|sexta|sábado|domingo)(-feira)?\b/i,
    
    // períodos do dia
    /\b(manhã|tarde|noite|madrugada)\b/i,
    
    // expressões temporais
    /\b(hoje|amanhã|ontem|agora|depois|logo|cedo)\b/i,
    /\b(amn|amnh|dps|hj|agr|ont)\b/i, // abreviações
    
    // datas
    /\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/i,
    /\b\d{1,2}-\d{1,2}(-\d{2,4})?\b/i,
    
    // preposições temporais
    /\b(às|ao|na|no|em|para|até|desde|a partir de)\b/i,
    
    // expressões de proximidade temporal
    /\b(próxima|próximo|essa|este|esta)\b/i
  ];
  
  return strongTaskPatterns.some(pattern => pattern.test(text));
}

function isAmbiguousContext(text: string): boolean {
  const ambiguousPatterns = [
    /\b(mercado|supermercado|farmácia|posto)\b/i, 
    /\b(loja|shopping|centro)\b/i,
    /\b(banco|agência)\b/i
  ];
  
  return ambiguousPatterns.some(pattern => pattern.test(text));
}

function hasTimeIndicators(text: string): boolean {
  const timeIndicators = [
    /\b\d{1,2}:\d{2}\b/i, 
    /\b\d{1,2}h\d{0,2}\b/i,
    /\b\d{1,2}\s*(horas?|hrs?|hr|h)\b/i,
    /\b(às|ao)\s*\d{1,2}(:\d{2}|h)/i, 
    /\b(de|das)\s*\d{1,2}(:\d{2}|h)/i,
  ];
  
  return timeIndicators.some(pattern => pattern.test(text));
}

export async function detectIntent(text: string): Promise<IntentType> {
  if (!text.trim()) return 'unknown';
  
  const normalizedText = text.toLowerCase();
  
  const hasExpense = await parseExpense(text);
  const hasDate = await parseDate(text);
  
  const strongFinancial = hasStrongFinancialContext(normalizedText);
  const strongTask = hasStrongTaskContext(normalizedText);
  const isAmbiguous = isAmbiguousContext(normalizedText);
  const hasTimeInfo = hasTimeIndicators(normalizedText);
  
  if (hasTimeInfo && !strongFinancial) {
    return 'task';
  }
  
  if (hasExpense && strongFinancial && !strongTask) {
    return 'expense';
  }
  
  if (hasDate && strongTask && !strongFinancial) {
    return 'task';
  }
  
  if (hasExpense && hasDate) {
    if (isAmbiguous) {
      if (strongFinancial) return 'expense';
      if (strongTask || hasTimeInfo) return 'task';
    }
    
    if (hasTimeInfo && !strongFinancial) return 'task';
    
    return 'expense';
  }
  
  if (hasExpense) return 'expense';
  if (hasDate) return 'task';
  
  return 'unknown';
}