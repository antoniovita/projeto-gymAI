// funcao que relaciona a skin com os docs

import { defaultDocuments } from './providers/default'
import { fuocoDocuments } from './providers/fuoco'
// import { zenDocuments } from './providers/zen'
// import { cyberDocuments } from './providers/cyber'
import { Document } from './types'
import type { SkinId } from '../prompt'

const skinProviders: Partial<Record<SkinId, () => Document[]>> = {
  fuoco: fuocoDocuments,
//   zen: zenDocuments,
//   cyber: cyberDocuments,
}

/**
 * Retorna os documentos iniciais para uma skin.
 * - includeDefault = true → concatena docs default + docs da skin
 * - includeDefault = false → somente docs da skin
 */
export function getInitialDocumentsForSkin(
  skin?: SkinId,
  includeDefault: boolean = true,
): Document[] {
  const base = includeDefault ? defaultDocuments() : []
  const skinDocs = skin ? (skinProviders[skin]?.() ?? []) : []
  return [...base, ...skinDocs]
}

export type { Document }
