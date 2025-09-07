import { PromptBuilder } from './types'
import { DefaultPrompt } from './skins/default'
// import { ZenPrompt } from './skins/zen'
// import { CyberPrompt } from './skins/cyber'

export type SkinId = 'fuoco'

const registry: Record<SkinId, PromptBuilder> = {
  fuoco: DefaultPrompt,
//   zen: ZenPrompt,
//   cyber: CyberPrompt,
}

// pegar builder por skin (com fallback)
export function getPromptBuilder(skin: SkinId = 'fuoco'): PromptBuilder {
  return registry[skin] ?? DefaultPrompt
}

// opcional: permitir registrar dinamicamente novas skins em runtime
export function registerPromptBuilder(key: SkinId | (string & {}), builder: PromptBuilder) {
  // atenção: para React Native (Metro), imports dinâmicos por string podem não bundle-ar.
  // mantenha as skins iniciais importadas estaticamente como acima.
  (registry as Record<string, PromptBuilder>)[key] = builder
}
