

import AsyncStorage from '@react-native-async-storage/async-storage'
import { getPromptBuilder, type SkinId } from '../prompt' 
import { getInitialDocumentsForSkin, type Document } from '../docs'
export type MsgRole = 'user' | 'assistant'
export type HistoryMsg = { role: MsgRole; content: string; timestamp: number }

const DOCS_KEY = 'fuoco_rag_documents'
const HISTORY_KEY = 'fuoco_conversation_history'

export async function loadDocuments(
  skin?: SkinId,
  includeDefault: boolean = true,
): Promise<Document[]> {
  try {
    const raw = await AsyncStorage.getItem(DOCS_KEY)
    if (raw) return JSON.parse(raw)

    const seeded = getInitialDocumentsForSkin(skin, includeDefault)
    if (seeded.length) await saveDocuments(seeded)
    return seeded
  } catch {
    const seeded = getInitialDocumentsForSkin(skin, includeDefault)
    if (seeded.length) await saveDocuments(seeded)
    return seeded
  }
}

export async function saveDocuments(documents: Document[]) {
  await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(documents))
}

// busca contexto nos documentos
export function searchRelevantDocuments(query: string, documents: Document[], maxResults = 3): Document[] {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)

  const scored = documents.map((doc) => {
    const content = doc.content.toLowerCase()
    const title = (doc.metadata.title ?? '').toLowerCase()
    const tags = (doc.metadata.tags ?? []).join(' ').toLowerCase()

    let score = 0
    for (const w of words) {
      if (title.includes(w)) score += 3
      if (tags.includes(w)) score += 2
      if (content.includes(w)) score += 1
    }
    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.doc)
}

// carrega um historico de conversa
export async function loadHistory(): Promise<HistoryMsg[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveToHistory(role: MsgRole, content: string, keepLastN = 20) {
  const history = await loadHistory()
  history.push({ role, content, timestamp: Date.now() })
  if (history.length > keepLastN) history.splice(0, history.length - keepLastN)
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// --------------------- Contexto RAG ---------------------


// gera o contexto com base nos docs, no historico e no prompt da skin
export async function generateRAGContext(
  userQuery: string,
  skin?: SkinId,
  includeDefault: boolean = true,
): Promise<string> {
  const docs = await loadDocuments(skin, includeDefault)
  const top = searchRelevantDocuments(userQuery, docs, 3)
  const history = await loadHistory()
  const recent = history.slice(-3)

  let ctx = ''
  if (top.length) {
    ctx += 'CONHECIMENTO RELEVANTE:\n'
    top.forEach((d, i) => {
      ctx += `${i + 1}. ${d.metadata.title ?? 'Informação'}: ${d.content}\n`
    })
    ctx += '\n'
  }
  if (recent.length) {
    ctx += 'CONTEXTO DA CONVERSA:\n'
    recent.forEach((m) => {
      ctx += `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}\n`
    })
  }
  return ctx
}

// ----------------- Prompt por skin -----------------
export async function buildPrompt(
  query: string,
  skin: SkinId = 'fuoco',
  includeDefault: boolean = true,
): Promise<string> {
  const ragContext = await generateRAGContext(query, skin, includeDefault)
  return getPromptBuilder(skin).formatUserMessage(query, ragContext)
}
