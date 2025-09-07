// docs exclusivos da skin

import { Document } from '../types'

export function fuocoDocuments(): Document[] {
  const now = Date.now()
  return [
    {
      id: 'fuoco_ignite_001',
      content:
        'Acenda a chama com um Sprint de 15 minutos. Zero distrações. Ao terminar, registre a vitória.',
      metadata: { title: 'Faísca Inicial', category: 'rituais', tags: ['entrada', 'ignição'], timestamp: now },
    },
  ]
}
