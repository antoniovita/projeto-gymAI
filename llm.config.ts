import RNFS from 'react-native-fs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initLlama, loadLlamaModelInfo } from 'llama.rn'

const MODEL_URL =
  'https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/google_gemma-3-1b-it-Q4_K_M.gguf'
const MODEL_ID = 'google_gemma-3-1b-it'
const MODEL_VERSION = 'Q4_K_M@1'
const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/models`
const LOCAL_MODEL_FILENAME = `${MODEL_ID}-${MODEL_VERSION}.gguf`
const LOCAL_MODEL_PATH = `${MODELS_DIR}/${LOCAL_MODEL_FILENAME}`
const LLAMA_MODEL_PATH = `file://${LOCAL_MODEL_PATH}`
const MODEL_META_KEY = `model_meta:${MODEL_ID}`

export type LlamaCtx = Awaited<ReturnType<typeof initLlama>>
type ModelMeta = { version: string; path: string; bytes?: number }

async function ensureModelsDir() {
  const exists = await RNFS.exists(MODELS_DIR)
  if (!exists) await RNFS.mkdir(MODELS_DIR)
}

async function getSavedMeta(): Promise<ModelMeta | null> {
  const raw = await AsyncStorage.getItem(MODEL_META_KEY)
  return raw ? (JSON.parse(raw) as ModelMeta) : null
}

async function setSavedMeta(meta: ModelMeta) {
  await AsyncStorage.setItem(MODEL_META_KEY, JSON.stringify(meta))
}

async function downloadModel(toFile: string, onProgress?: (pct: number) => void) {
  const tempPath = `${toFile}.partial`
  
  try {
    // Remove arquivos temporários anteriores se existirem
    const tempExists = await RNFS.exists(tempPath)
    if (tempExists) {
      console.log('[llm] removendo arquivo temporário anterior')
      await RNFS.unlink(tempPath)
    }

    const res = RNFS.downloadFile({
      fromUrl: MODEL_URL,
      toFile: tempPath,
      progressDivider: 5,
      progress: (p) => {
        if (p.contentLength > 0 && onProgress) {
          onProgress(Math.floor((p.bytesWritten / p.contentLength) * 100))
        }
      },
      begin: (info) => {
        if (onProgress) onProgress(0)
        console.log('[llm] iniciando download', info.contentLength, 'bytes')
      },
    })

    const { statusCode, bytesWritten } = await res.promise
    if (statusCode && statusCode >= 400) {
      throw new Error(`HTTP ${statusCode}`)
    }

    // Verifica se arquivo final já existe e remove antes de mover
    const finalExists = await RNFS.exists(toFile)
    if (finalExists) {
      console.log('[llm] removendo arquivo final anterior')
      await RNFS.unlink(toFile)
    }

    // Move o arquivo temporário para o local final
    await RNFS.moveFile(tempPath, toFile)
    
    if (onProgress) onProgress(100)
    console.log('[llm] download concluído:', bytesWritten, 'bytes')
    
    return bytesWritten
  } catch (e) {
    // Limpeza em caso de erro
    try {
      const exists = await RNFS.exists(tempPath)
      if (exists) {
        console.log('[llm] limpando arquivo temporário após erro')
        await RNFS.unlink(tempPath)
      }
    } catch {}
    throw e
  }
}

async function ensureModel(onProgress?: (pct: number) => void): Promise<string> {
  await ensureModelsDir()
  
  const saved = await getSavedMeta()
  const sameVersion = saved?.version === MODEL_VERSION
  const fileExists = await RNFS.exists(LOCAL_MODEL_PATH)
  
  // Se já temos a versão correta e o arquivo existe, usa ele
  if (sameVersion && fileExists) {
    console.log('[llm] usando modelo existente')
    if (onProgress) onProgress(100)
    return LLAMA_MODEL_PATH
  }

  // Se arquivo existe mas versão é diferente, verifica integridade
  if (fileExists && !sameVersion) {
    console.log('[llm] verificando integridade do arquivo existente')
    try {
      // Tenta carregar info do modelo para validar integridade
      await loadLlamaModelInfo(`file://${LOCAL_MODEL_PATH}`)
      console.log('[llm] arquivo existente está íntegro, atualizando metadata')
      
      // Atualiza metadata se arquivo está íntegro
      const stats = await RNFS.stat(LOCAL_MODEL_PATH)
      await setSavedMeta({ 
        version: MODEL_VERSION, 
        path: LLAMA_MODEL_PATH, 
        bytes: stats.size 
      })
      
      if (onProgress) onProgress(100)
      return LLAMA_MODEL_PATH
    } catch (e) {
      console.log('[llm] arquivo existente corrompido, será baixado novamente')
      // Arquivo corrompido, será baixado novamente
    }
  }

  // Limpa versões antigas desse modelo
  console.log('[llm] limpando versões antigas')
  try {
    const files = await RNFS.readDir(MODELS_DIR)
    await Promise.all(
      files
        .filter((f) => 
          f.isFile() && 
          f.name.startsWith(`${MODEL_ID}-`) && 
          !f.name.includes(MODEL_VERSION)
        )
        .map((f) => RNFS.unlink(f.path).catch((err) => 
          console.warn(`Erro ao remover ${f.name}:`, err.message)
        ))
    )
  } catch (e) {
    console.warn('[llm] erro ao limpar arquivos antigos:', e)
  }

  // Download do modelo
  console.log('[llm] baixando modelo...')
  if (onProgress) onProgress(0)
  
  const bytes = await downloadModel(LOCAL_MODEL_PATH, onProgress)
  
  // Salva metadata
  await setSavedMeta({ 
    version: MODEL_VERSION, 
    path: LLAMA_MODEL_PATH, 
    bytes 
  })
  
  console.log('[llm] modelo baixado e configurado com sucesso')
  return LLAMA_MODEL_PATH
}

export const stopWords = [
  '</s>', 
  '<|end|>', 
  '<|eot_id|>', 
  '<|end_of_text|>', 
  '<|im_end|>', 
  '<|EOT|>', 
  '<|END_OF_TURN_TOKEN|>', 
  '<|end_of_turn|>', 
  '<|endoftext|>'
]

/** Inicializa o llama.rn (baixa se precisar) e devolve o context pronto */
export async function bootstrapLlama(onProgress?: (pct: number) => void): Promise<LlamaCtx> {
  try {
    const modelPath = await ensureModel(onProgress)
    
    console.log('[llm] carregando informações do modelo')
    const info = await loadLlamaModelInfo(modelPath)
    console.log('[llm] Model Info:', info)
    
    console.log('[llm] inicializando contexto LLM')
    const ctx = await initLlama({
      model: modelPath,
      use_mlock: true,
      n_ctx: 2048,
      n_gpu_layers: 99, // efeito só no iOS
    })
    
    console.log('[llm] LLM inicializado com sucesso')
    return ctx
  } catch (error) {
    console.error('[llm] Erro ao inicializar LLM:', error)
    throw error
  }
}