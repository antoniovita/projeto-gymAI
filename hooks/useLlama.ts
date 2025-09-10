import { useState, useEffect, useRef, useCallback } from 'react'
import { bootstrapLlama, LlamaCtx, stopWords } from '../llm.config'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface UseLlamaState {

  isInitializing: boolean
  isDownloading: boolean
  downloadProgress: number
  isReady: boolean
  error: string | null
  
  isGenerating: boolean
  messages: Message[]
  
  initialize: () => Promise<void>
  sendMessage: (message: string, systemPrompt?: string) => Promise<void>
  clearMessages: () => void
  cancelGeneration: () => void
  resetError: () => void
}

export function useLlama(): UseLlamaState {

  const [isInitializing, setIsInitializing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  
  const contextRef = useRef<LlamaCtx | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const initialize = useCallback(async () => {
    if (isInitializing || isReady) return
    
    try {
      setError(null)
      setIsInitializing(true)
      setIsDownloading(false)
      setDownloadProgress(0)
      
      console.log('[useLlama] Iniciando bootstrap do modelo...')
      
      const ctx = await bootstrapLlama((progress) => {
        console.log('[useLlama] Download progress:', progress + '%')
        setIsDownloading(progress < 100)
        setDownloadProgress(progress)
      })
      
      contextRef.current = ctx
      setIsReady(true)
      setIsDownloading(false)
      setDownloadProgress(100)
      
      console.log('[useLlama] Modelo inicializado com sucesso!')
      
    } catch (err) {
      console.error('[useLlama] Erro na inicialização:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido na inicialização')
      setIsReady(false)
    } finally {
      setIsInitializing(false)
      setIsDownloading(false)
    }
  }, [isInitializing, isReady])

  const sendMessage = useCallback(async (
    message: string, 
    systemPrompt: string = 'Você é um assistente de produtivdade chamado Fuoco.'
  ) => {
    if (!contextRef.current || !isReady || isGenerating) {
      console.warn('[useLlama] Contexto não disponível ou já gerando resposta')
      return
    }

    try {
      setError(null)
      setIsGenerating(true)
      
      const userMessage: Message = { role: 'user', content: message }
      setMessages(prev => [...prev, userMessage])
      
      const contextMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage
      ]
      
      console.log('[useLlama] Enviando mensagem para o modelo...')
      
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      
      const { text } = await contextRef.current.completion({
        messages: contextMessages,
        n_predict: 512,
        temperature: 0.7,
        top_p: 0.9,
        stop: stopWords,
      })
      
      if (abortController.signal.aborted) {
        console.log('[useLlama] Geração cancelada pelo usuário')
        return
      }
      
      // Adiciona resposta do assistente
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: text.trim() 
      }
      setMessages(prev => [...prev, assistantMessage])
      
      console.log('[useLlama] Resposta gerada com sucesso')
      
    } catch (err) {
      console.error('[useLlama] Erro ao gerar resposta:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido na geração')
      
      // Remove a mensagem do usuário em caso de erro
      setMessages(prev => prev.slice(0, -1))
      
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [isReady, isGenerating, messages])

  // Função para limpar mensagens
  const clearMessages = useCallback(() => {
    setMessages([])
    console.log('[useLlama] Histórico de mensagens limpo')
  }, [])

  // Função para cancelar geração
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current && isGenerating) {
      abortControllerRef.current.abort()
      console.log('[useLlama] Cancelando geração...')
    }
  }, [isGenerating])

  // Função para resetar erro
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // Estados de inicialização
    isInitializing,
    isDownloading,
    downloadProgress,
    isReady,
    error,
    
    // Estados de chat
    isGenerating,
    messages,
    
    // Funções
    initialize,
    sendMessage,
    clearMessages,
    cancelGeneration,
    resetError,
  }
}