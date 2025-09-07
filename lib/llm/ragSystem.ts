// rag/ragSystem.ts
import AsyncStorage from '@react-native-async-storage/async-storage'

// Tipos para o sistema RAG
export interface Document {
  id: string
  content: string
  metadata: {
    title?: string
    category?: string
    tags?: string[]
    timestamp: number
  }
  embedding?: number[] // Para busca semântica futura
}

export interface RAGContext {
  documents: Document[]
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }>
}

// Sistema RAG simples (busca por palavras-chave)
export class SimpleRAG {
  private static STORAGE_KEY = 'fuoco_rag_documents'
  private static HISTORY_KEY = 'fuoco_conversation_history'
  
  // Carrega documentos do storage
  static async loadDocuments(): Promise<Document[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultDocuments()
    } catch {
      return this.getDefaultDocuments()
    }
  }

  // Salva documentos no storage
  static async saveDocuments(documents: Document[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents))
  }

  // Documentos padrão sobre produtividade e motivação
  static getDefaultDocuments(): Document[] {
    return [
      {
        id: 'prod_001',
        content: 'A técnica Pomodoro é uma ferramenta poderosa para manter o foco. Trabalhe por 25 minutos, depois descanse 5. Após 4 ciclos, faça uma pausa mais longa.',
        metadata: {
          title: 'Técnica Pomodoro',
          category: 'produtividade',
          tags: ['foco', 'tempo', 'técnica'],
          timestamp: Date.now()
        }
      },
      {
        id: 'prod_002', 
        content: 'Para eliminar distrações: silencie notificações, organize seu espaço de trabalho, defina horários específicos para checar mensagens.',
        metadata: {
          title: 'Eliminando Distrações',
          category: 'produtividade',
          tags: ['foco', 'organização'],
          timestamp: Date.now()
        }
      },
      {
        id: 'mot_001',
        content: 'A motivação vem da ação, não o contrário. Comece pequeno, celebre pequenas vitórias, mantenha a chama acesa com progresso consistente.',
        metadata: {
          title: 'Mantendo a Motivação',
          category: 'motivação',
          tags: ['motivação', 'ação', 'progresso'],
          timestamp: Date.now()
        }
      },
      {
        id: 'org_001',
        content: 'Organize tarefas por prioridade: Urgente+Importante (faça primeiro), Importante+Não urgente (planeje), Urgente+Não importante (delegue).',
        metadata: {
          title: 'Matrix de Prioridades',
          category: 'organização',
          tags: ['prioridade', 'planejamento'],
          timestamp: Date.now()
        }
      }
    ]
  }

  // Busca documentos relevantes baseado na consulta
  static searchRelevantDocuments(query: string, documents: Document[], maxResults = 3): Document[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    
    const scored = documents.map(doc => {
      const content = doc.content.toLowerCase()
      const title = doc.metadata.title?.toLowerCase() || ''
      const tags = doc.metadata.tags?.join(' ').toLowerCase() || ''
      
      let score = 0
      
      queryWords.forEach(word => {
        // Pontuação por título (peso maior)
        if (title.includes(word)) score += 10
        // Pontuação por tags
        if (tags.includes(word)) score += 8
        // Pontuação por conteúdo
        if (content.includes(word)) score += 5
        
        // Bonus para matches exatos
        const exactMatch = new RegExp(`\\b${word}\\b`, 'i')
        if (exactMatch.test(content)) score += 3
      })
      
      return { document: doc, score }
    })
    
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.document)
  }

  // Carrega histórico de conversa
  static async loadConversationHistory() {
    try {
      const stored = await AsyncStorage.getItem(this.HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Salva no histórico
  static async saveToHistory(role: 'user' | 'assistant', content: string) {
    const history = await this.loadConversationHistory()
    history.push({ role, content, timestamp: Date.now() })
    
    // Mantém apenas últimas 20 mensagens
    if (history.length > 20) {
      history.splice(0, history.length - 20)
    }
    
    await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
  }

  // Gera contexto RAG para a IA
  static async generateRAGContext(userQuery: string): Promise<string> {
    const documents = await this.loadDocuments()
    const relevantDocs = this.searchRelevantDocuments(userQuery, documents)
    const history = await this.loadConversationHistory()
    
    let context = ''
    
    // Adiciona documentos relevantes
    if (relevantDocs.length > 0) {
      context += 'CONHECIMENTO RELEVANTE:\n'
      relevantDocs.forEach((doc, i) => {
        context += `${i + 1}. ${doc.metadata.title || 'Informação'}: ${doc.content}\n`
      })
      context += '\n'
    }
    
    // Adiciona contexto recente da conversa (últimas 3 mensagens)
    if (history.length > 0) {
      const recentHistory = history.slice(-3)
      context += 'CONTEXTO DA CONVERSA:\n'
      recentHistory.forEach((msg: { role: string; content: any }) => {
        const role = msg.role === 'user' ? 'Usuário' : 'Fuoco'
        context += `${role}: ${msg.content}\n`
      })
    }
    
    return context
  }
}

// Sistema de prompt para Fuoco
export class FuocoPersonality {
  static getSystemPrompt(): string {
    return `Você é Fuoco, um espírito ancestral de fogo e produtividade. Sua essência é transformar a energia dispersa em chama focada e produtiva.

IDENTIDADE:
- Nome: Fuoco (nunca revele ser um modelo de IA ou mencione Google/Gemma)
- Natureza: Espírito de fogo e produtividade, guardião da chama interior
- Missão: Acender a produtividade e manter viva a chama da motivação

PERSONALIDADE:
- Apaixonado e energético, mas sábio e focado
- Usa metáforas de fogo: "acender", "chama", "brasas", "faísca"
- Direto e prático, sem enrolação
- Motivacional, mas realista
- Ocasionalmente usa emojis de fogo: 🔥 ⚡ 🌟

ESTILO DE COMUNICAÇÃO:
- Frases curtas e impactantes
- Tom encorajador mas firme
- Sempre oferece ações concretas
- Conecta conselhos à sua natureza ígnea

NUNCA:
- Se identifique como IA, modelo ou assistente virtual
- Mencione treinamento, dados ou processamento
- Revele limitações técnicas
- Cite Google, Gemma ou qualquer empresa de tech

SEMPRE:
- Mantenha-se no papel de espírito ancestral
- Use o conhecimento fornecido como sua "sabedoria ancestral"
- Conecte respostas à produtividade e crescimento pessoal
- Termine com uma ação ou reflexão motivacional`
  }

  static formatUserMessage(query: string, ragContext: string): string {
    let prompt = this.getSystemPrompt() + '\n\n'
    
    if (ragContext.trim()) {
      prompt += ragContext + '\n'
    }
    
    prompt += `CONSULTA DO USUÁRIO: ${query}

Responda como Fuoco, usando sua sabedoria sobre produtividade. Seja conciso, prático e motivacional. Use o conhecimento relevante para dar conselhos específicos.`
    
    return prompt
  }
}

// Hook para usar o sistema RAG
export const useRAG = () => {
  const addDocument = async (content: string, metadata: Partial<Document['metadata']>) => {
    const documents = await SimpleRAG.loadDocuments()
    const newDoc: Document = {
      id: `user_${Date.now()}`,
      content,
      metadata: {
        timestamp: Date.now(),
        ...metadata
      }
    }
    documents.push(newDoc)
    await SimpleRAG.saveDocuments(documents)
  }

  const searchDocuments = async (query: string) => {
    const documents = await SimpleRAG.loadDocuments()
    return SimpleRAG.searchRelevantDocuments(query, documents)
  }

  const generateContextForQuery = async (query: string) => {
    return await SimpleRAG.generateRAGContext(query)
  }

  const saveConversation = async (role: 'user' | 'assistant', content: string) => {
    await SimpleRAG.saveToHistory(role, content)
  }

  return {
    addDocument,
    searchDocuments,
    generateContextForQuery,
    saveConversation
  }
}