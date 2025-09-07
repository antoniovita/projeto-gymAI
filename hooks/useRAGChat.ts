import { useCallback, useMemo, useRef, useState } from 'react'
import { buildPrompt, saveToHistory } from '../lib/llm/rag/ragService'        
import { bootstrapLlama, stopWords, type LlamaCtx } from '../llm.config'
import type { SkinId } from '../lib/llm/prompt'

type Options = {
  skin?: SkinId
  includeDefault?: boolean
  nPredict?: number
  temperature?: number
  top_p?: number
  streaming?: boolean
}

export function useRAGChat(opts: Options = {}) {
  const {
    skin = 'fuoco',
    includeDefault = true,
    nPredict = 256,
    temperature = 0.7,
    top_p = 0.9,
    streaming = false,
  } = opts

  const llamaRef = useRef<LlamaCtx | null>(null)

  const [modelReady, setModelReady] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lastUser, setLastUser] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [answer, setAnswer] = useState('')

  // garante modelo
  const ensureModel = useCallback(async () => {
    if (llamaRef.current) return llamaRef.current
    const ctx = await bootstrapLlama((pct) => setDownloadProgress(pct))
    llamaRef.current = ctx
    setModelReady(true)
    return ctx
  }, [])

  // executa a completion (com/sem streaming)
  const complete = useCallback(
    async (ctx: LlamaCtx, prompt: string) => {
      if (!streaming) {
        const res = await ctx.completion({
          prompt,
          n_predict: nPredict,
          temperature,
          top_p,
          stop: stopWords,
        })
        return (res?.text ?? '').trim()
      }

      // STREAMING
      let out = ''
      const res = await ctx.completion(
        {
          prompt,
          n_predict: nPredict,
          temperature,
          top_p,
          stop: stopWords,
        },
        ({ token }) => {
          out += token
          setAnswer((prev) => prev + token)
        }
      )
      return (res?.text ?? out).trim()
    },
    [nPredict, temperature, top_p, streaming]
  )

  // função principal: recebe a pergunta do usuário e retorna a resposta
  const run = useCallback(
    async (userPrompt: string) => {
      const q = userPrompt.trim()
      if (!q) return ''

      setLoading(true)
      setError(null)
      setAnswer('')
      setLastUser(q)
      setLastPrompt('')

      try {
        // salva user → histórico curto
        await saveToHistory('user', q)

        // monta prompt (skin + contexto RAG)
        const prompt = await buildPrompt(q, skin, includeDefault)
        setLastPrompt(prompt)

        // garante o modelo
        const ctx = await ensureModel()

        // roda o modelo
        const text = await complete(ctx, prompt)
        setAnswer(text)

        // salva assistant → histórico curto
        await saveToHistory('assistant', text || '(vazio)')

        return text
      } catch (e: any) {
        const msg = e?.message ?? 'Erro ao executar prompt'
        setError(msg)
        return ''
      } finally {
        setLoading(false)
      }
    },
    [skin, includeDefault, ensureModel, complete]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setAnswer('')
    setLastUser('')
    setLastPrompt('')
  }, [])

  return useMemo(
    () => ({
      // ação principal
      run,
      reset,

      // estado
      loading,
      error,
      answer,
      lastUser,
      lastPrompt,

      // status do modelo
      modelReady,
      downloadProgress,
    }),
    [run, reset, loading, error, answer, lastUser, lastPrompt, modelReady, downloadProgress]
  )
}
