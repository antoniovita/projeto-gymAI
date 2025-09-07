// aqui se cria os docs defaults que serao usados no RAG

import { Document } from '../types'

export function defaultDocuments(): Document[] {
  const now = Date.now()
  return [
    {
      id: 'prod_001',
      content:
        'A técnica Pomodoro ajuda a manter foco: 25 min de trabalho + 5 min de pausa. Após 4 ciclos, pausa maior.',
      metadata: { title: 'Técnica Pomodoro', category: 'produtividade', tags: ['foco', 'tempo', 'técnica'], timestamp: now },
    },
    {
      id: 'prod_002',
      content:
        'Para reduzir distrações: silencie notificações, organize o espaço e defina horários para checar mensagens.',
      metadata: { title: 'Eliminando Distrações', category: 'produtividade', tags: ['foco', 'organização'], timestamp: now },
    },
    {
      id: 'mot_001',
      content:
        'A motivação vem da ação. Comece pequeno, celebre vitórias curtas e mantenha o ritmo.',
      metadata: { title: 'Mantendo a Motivação', category: 'motivação', tags: ['motivação', 'ação', 'progresso'], timestamp: now },
    },
    {
      id: 'org_001',
      content:
        'Priorize: Urgente+Importante (faça), Importante+Não urgente (planeje), Urgente+Não importante (delegue).',
      metadata: { title: 'Matriz de Prioridades', category: 'organização', tags: ['prioridade', 'planejamento'], timestamp: now },
    },
  ]
}
