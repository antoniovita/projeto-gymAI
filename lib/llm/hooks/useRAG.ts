// src/hooks/useRAG.ts
import { useCallback, useMemo } from 'react'
import {
  loadDocuments,
  searchRelevantDocuments,
  generateRAGContext,
  saveToHistory,
  type MsgRole,
  buildPrompt,
} from '../rag/ragService'
import type { SkinId } from '../prompt'

type Options = {
  skin?: SkinId
  includeDefault?: boolean
}

export const useRAG = (opts: Options = {}) => {
  const skin = opts.skin ?? 'fuoco'
  const includeDefault = opts.includeDefault ?? true

  const searchDocuments = useCallback(async (query: string) => {
    const docs = await loadDocuments(skin, includeDefault)
    return searchRelevantDocuments(query, docs)
  }, [skin, includeDefault])

  const generateContextForQuery = useCallback((query: string) => {
    return generateRAGContext(query, skin, includeDefault)
  }, [skin, includeDefault])

  const saveConversation = useCallback((role: MsgRole, content: string) => {
    return saveToHistory(role, content)
  }, [])

  const buildPromptForQuery = useCallback((query: string) => {
    return buildPrompt(query, skin, includeDefault)
  }, [skin, includeDefault])

  return useMemo(
    () => ({
      searchDocuments,
      generateContextForQuery,
      saveConversation,
      buildPrompt: buildPromptForQuery,
    }),
    [searchDocuments, generateContextForQuery, saveConversation, buildPromptForQuery],
  )
}
