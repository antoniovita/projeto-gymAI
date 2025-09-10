import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import { useMessageParser } from './useMessageParser';
import { bootstrapLlama, LlamaCtx, stopWords } from '../llm.config';

const STORAGE_KEY = '@chat_messages';

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const useChat = () => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { userId } = useAuth();
  const { processMessage } = useMessageParser(userId);
  const flatListRef = useRef<FlatList<Message>>(null);
  
  const contextRef = useRef<LlamaCtx | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveMessages = useCallback(async (updated: Message[]) => {
    setMessages(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      scrollToBottom();
    } catch (error) {
      console.error('[useChat] Erro ao salvar mensagens:', error);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        setMessages(parsedMessages);
        console.log('[useChat] Mensagens carregadas:', parsedMessages.length);
      }
    } catch (error) {
      console.error('[useChat] Erro ao carregar mensagens:', error);
    }
  }, []);


  const typeOut = useCallback(async (finalText: string, baseMessages: Message[]) => {
  return new Promise<void>((resolve) => {
    let index = 0;
    setTypingText('');

    const typingSpeed = Math.random() * 15 + 25;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(async () => {
      setTypingText((prev) => {
        const next = finalText.slice(0, index + 1);
        index++;

        if (index >= finalText.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setTimeout(async () => {
            const systemReply: Message = { role: 'assistant', content: finalText };
            const finalMessages = [...baseMessages, systemReply];
            await saveMessages(finalMessages);
            setIsTyping(false);
            setTypingText('');
            resolve();
          }, 200);
        }
        return next;
      });
    }, typingSpeed);
  });
}, [saveMessages]);



  const clearMessages = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
      console.log('[useChat] Histórico de mensagens limpo');
    } catch (error) {
      console.error('[useChat] Erro ao limpar mensagens:', error);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const initializeLlama = useCallback(async () => {
    if (isInitializing || isReady) return;
    
    try {
      setError(null);
      setIsInitializing(true);
      setIsDownloading(false);
      setDownloadProgress(0);
      
      console.log('[useChat] Iniciando bootstrap do modelo Llama...');
      
      const ctx = await bootstrapLlama((progress) => {
        console.log('[useChat] Download progress:', progress + '%');
        setIsDownloading(progress < 100);
        setDownloadProgress(progress);
      });
      
      contextRef.current = ctx;
      setIsReady(true);
      setIsDownloading(false);
      setDownloadProgress(100);
      
      console.log('[useChat] Modelo Llama inicializado com sucesso!');
      
    } catch (err) {
      console.error('[useChat] Erro na inicialização do Llama:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido na inicialização');
      setIsReady(false);
    } finally {
      setIsInitializing(false);
      setIsDownloading(false);
    }
  }, [isInitializing, isReady]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current && isGenerating) {
      abortControllerRef.current.abort();
      console.log('[useChat] Cancelando geração...');
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);
    setTypingText('');
  }, [isGenerating]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);


  const sendMessageToLlama = useCallback(async (
    message: string,
    currentMessages: Message[],
    systemPrompt: string = 'Você é um assistente de produtividade chamado Fuoco. Não responda que você é uma IA.'
  ) => {
    if (!contextRef.current || !isReady || isGenerating) {
      console.warn('[useChat] Contexto Llama não disponível ou já gerando resposta');
      return null;
    }

    try {
      setError(null);
      setIsGenerating(true);
      
      const contextMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...currentMessages,
        { role: 'user', content: message }
      ];
      
      console.log('[useChat] Enviando mensagem para o Llama...');
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const { text } = await contextRef.current.completion({
        messages: contextMessages,
        n_predict: 512,
        temperature: 0.4,
        top_p: 0.9,
        stop: stopWords,
      });
      
      if (abortController.signal.aborted) {
        console.log('[useChat] Geração cancelada pelo usuário');
        return null;
      }
      
      console.log('[useChat] Resposta do Llama gerada com sucesso');
      return text.trim();
      
    } catch (err) {
      console.error('[useChat] Erro ao gerar resposta do Llama:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido na geração');
      throw err;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [isReady, isGenerating]);


  const handleOtherCases = useCallback(async (input: string, intent: string, currentMessages: Message[]) => {
    try {
      console.log('[useChat] Processando com Llama para intent:', intent);

      if (!isReady && !isInitializing) {
        console.log('[useChat] Inicializando Llama...');
        await initializeLlama();
      }
      if (isInitializing) {
        console.log('[useChat] Aguardando inicialização do Llama...');
        return;
      }
      if (error) {
        console.error('[useChat] Erro no Llama:', error);
        const errorMessage: Message = { role: 'assistant', content: 'Desculpe, houve um erro interno. Tente novamente.' };
        const updatedMessages = [...currentMessages, errorMessage];
        await saveMessages(updatedMessages);
        return;
      }
      if (!isReady) {
        console.log('[useChat] Llama não está pronto');
        return;
      }

      console.log('[useChat] Enviando mensagem para o Llama...');

      const response = await sendMessageToLlama(input, currentMessages);

      if (response) {

        await typeOut(response, currentMessages);
      } else {
        console.log('[useChat] Nenhuma resposta retornada do Llama');
        setIsTyping(false);
        setTypingText('');
      }

    } catch (error) {
      console.error('[useChat] Erro ao processar mensagem com Llama:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.' };
      const updatedMessages = [...currentMessages, errorMessage];
      await saveMessages(updatedMessages);
      setIsTyping(false);
      setTypingText('');
    }
  }, [isReady, isInitializing, error, initializeLlama, sendMessageToLlama, saveMessages, typeOut]);


  const handleInputSubmit = useCallback(async (input: string, setInput: (value: string) => void) => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    if (isTyping) {
      return;
    }
    
    await saveMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    
    const intent = await processMessage(input);
    console.log('[useChat] Intent detectado:', intent);
    
    if (intent === 'expense' || intent === 'task') {
      const thinkingTime = Math.random() * 1000 + 800;
      setTimeout(async () => {
        let finalText = '';
        
        if (intent === 'expense') {
          const expenseResponses = [
            'Despesa registrada com sucesso! 💰',
            'Anotado: uma nova despesa foi salva!',
            'Gasto adicionado à sua lista. Tudo organizado!',
            'Sua despesa foi registrada. Controle sempre em dia! 📊',
            'Perfeito! Mais uma despesa catalogada.',
            'Registrado! Sua organização financeira agradece. 💪'
          ];
          finalText = expenseResponses[Math.floor(Math.random() * expenseResponses.length)];
        } else if (intent === 'task') {
          const taskResponses = [
            'Tarefa registrada com sucesso! ✅',
            'Nova tarefa adicionada à sua lista!',
            'Está na lista! Tarefa salva e organizada.',
            'Tarefa anotada com sucesso! Vamos produzir! 🚀',
            'Registrado! Sua produtividade agradece.',
            'Perfeito! Mais uma tarefa no seu planejamento.'
          ];
          finalText = taskResponses[Math.floor(Math.random() * taskResponses.length)];
        }
        
        // Animação de digitação para despesas e tarefas
        let index = 0;
        setTypingText('');
        const typingSpeed = Math.random() * 20 + 25;
        
        const interval = setInterval(() => {
          setTypingText((prev) => {
            const next = finalText.slice(0, index + 1);
            index++;
            if (index === finalText.length) {
              clearInterval(interval);

              setTimeout(async () => {
                const systemReply: Message = { 
                  role: 'assistant', 
                  content: finalText 
                };
                const finalMessages = [...updatedMessages, systemReply];
                await saveMessages(finalMessages);
                setIsTyping(false);
                setTypingText('');
              }, 200);
            }
            return next;
          });
        }, typingSpeed);
      }, thinkingTime);
    } else {
      // Para outros casos, usa o Llama diretamente
      console.log('[useChat] Chamando handleOtherCases...');
      await handleOtherCases(input, intent, updatedMessages);
      setIsTyping(false);
      setTypingText('');
    }
  }, [messages, isTyping, processMessage, saveMessages, handleOtherCases]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-carregar mensagens na inicialização
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    // Estados do chat
    messages,
    isTyping,
    typingText,
    flatListRef,
    
    // Estados do Llama
    isInitializing,
    isDownloading,
    downloadProgress,
    isReady,
    error,
    isGenerating,
    
    // Funções principais
    handleInputSubmit,
    clearMessages,
    loadMessages,
    
    // Funções do Llama
    initializeLlama,
    resetError,
    cancelGeneration,
    
    // Função auxiliar
    handleOtherCases,
  };
};