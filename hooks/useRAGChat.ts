import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
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
  autoInit?: boolean // Nova opção para inicialização automática
}

export function useRAGChat(opts: Options = {}) {
  const {
    skin = 'fuoco',
    includeDefault = true,
    nPredict = 256,
    temperature = 0.7,
    top_p = 0.9,
    streaming = false,
    autoInit = true, // Por padrão, inicializa automaticamente
  } = opts

  const llamaRef = useRef<LlamaCtx | null>(null)
  const [modelReady, setModelReady] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUser, setLastUser] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [initializing, setInitializing] = useState(false)

  // garante modelo
  const ensureModel = useCallback(async () => {
    if (llamaRef.current) return llamaRef.current
    
    setInitializing(true)
    setDownloadProgress(0)
    
    try {
      const ctx = await bootstrapLlama((pct) => {
        setDownloadProgress(pct)
      })
      llamaRef.current = ctx
      setModelReady(true)
      setDownloadProgress(100)
      return ctx
    } catch (e: any) {
      setError(`Erro ao carregar modelo: ${e?.message ?? 'Erro desconhecido'}`)
      throw e
    } finally {
      setInitializing(false)
    }
  }, [])

  // Inicialização automática quando o hook é montado
  useEffect(() => {
    if (autoInit && !modelReady && !initializing && !llamaRef.current) {
      ensureModel().catch(console.error)
    }
  }, [autoInit, modelReady, initializing, ensureModel])

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
        // // salva user → histórico curto
        // await saveToHistory('user', q)
        
        // monta prompt (skin + contexto RAG)
        const prompt = await buildPrompt(q, skin, includeDefault)
        setLastPrompt(prompt)
        
        // garante o modelo (pode já estar carregado)
        const ctx = await ensureModel()
        
        // roda o modelo
        const text = await complete(ctx, prompt)
        setAnswer(text)
        console.log(text)
        
        // // salva assistant → histórico curto
        // await saveToHistory('assistant', text || '(vazio)')
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

  // Função para inicializar manualmente o modelo
  const initializeModel = useCallback(async () => {
    if (!modelReady && !initializing) {
      await ensureModel()
    }
  }, [modelReady, initializing, ensureModel])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setAnswer('')
    setLastUser('')
    setLastPrompt('')
  }, [])

  return useMemo(
    () => ({
      // ações principais
      run,
      reset,
      initializeModel, // Nova função para inicializar manualmente
      
      // estado
      loading,
      error,
      answer,
      lastUser,
      lastPrompt,
      
      // status do modelo
      modelReady,
      downloadProgress,
      initializing, // Novo estado para mostrar se está inicializando
    }),
    [run, reset, initializeModel, loading, error, answer, lastUser, lastPrompt, modelReady, downloadProgress, initializing]
  )
}