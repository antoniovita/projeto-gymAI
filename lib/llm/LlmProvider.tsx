import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { bootstrapLlama, LlamaCtx } from '../../llm.config'

type LlmState = {
  ctx: LlamaCtx | null
  ready: boolean
  error: string | null
  progress: number // 0..100 (download)
}

const LlmContext = createContext<LlmState>({ ctx: null, ready: false, error: null, progress: 0 })
export const useLlm = () => useContext(LlmContext)

/** 
 * Se quiser iniciar só após o usuário estar logado, passe `enabled={isAuthenticated}`.
 * Se quiser baixar antes do login (para “pré-aquecer”), passe enabled={true}.
 */
export function LlmProvider({ enabled = true, children }: { enabled?: boolean; children: React.ReactNode }) {
  const [ctx, setCtx] = useState<LlamaCtx | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!enabled || ready || ctx) return
      setError(null)
      setProgress(0)
      try {
        const c = await bootstrapLlama((p) => !cancelled && setProgress(p))
        if (!cancelled) {
          setCtx(c)
          setReady(true)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Falha ao iniciar LLM')
          setReady(false)
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [enabled, ready, ctx])

  const value = useMemo(() => ({ ctx, ready, error, progress }), [ctx, ready, error, progress])
  return <LlmContext.Provider value={value}>{children}</LlmContext.Provider>
}
