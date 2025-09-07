// components/Screens/Test/TestScreen.tsx
import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { LlmContext } from '../App';
import { stopWords } from '../llm.config';
import { SimpleRAG, FuocoPersonality, useRAG, Document } from '../lib/llm/ragSystem';

const TestScreen: React.FC = () => {
  const { ctx, ready, progress, error } = useContext(LlmContext);
  const [userText, setUserText] = useState('Olá! Preciso de ajuda para ser mais produtivo no trabalho.');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [showRAGDocs, setShowRAGDocs] = useState(false);
  const [relevantDocs, setRelevantDocs] = useState<Document[]>([]);
  
  const { generateContextForQuery, saveConversation, searchDocuments } = useRAG();

  // Verifica se pode enviar
  const canSend = useMemo(() => {
    return !!ctx && ready && !isRunning && userText.trim().length > 0;
  }, [ctx, ready, isRunning, userText]);

  const bufferRef = useRef('');

  // Inicializa documentos padrão na primeira execução
  useEffect(() => {
    SimpleRAG.loadDocuments().then(docs => {
      if (docs.length === 0) {
        SimpleRAG.saveDocuments(SimpleRAG.getDefaultDocuments());
      }
    });
  }, []);

  async function handleSend() {
    if (!ctx) {
      setRunError('Fuoco não está disponível no momento 🔥');
      return;
    }

    setIsRunning(true);
    setRunError(null);
    setOutput('');
    bufferRef.current = '';

    try {
      // Salva pergunta do usuário no histórico
      await saveConversation('user', userText.trim());
      
      // Busca documentos relevantes para mostrar na UI
      const docs = await searchDocuments(userText.trim());
      setRelevantDocs(docs);
      
      // Gera contexto RAG
      const ragContext = await generateContextForQuery(userText.trim());
      
      // Formata prompt para Fuoco
      const systemMessage = FuocoPersonality.formatUserMessage(userText.trim(), ragContext);
      
      const res = await ctx.completion(
        {
          messages: [
            { 
              role: 'user', 
              content: systemMessage
            },
          ],
          n_predict: 200,
          stop: stopWords,
          temperature: 0.7,
        },
        // Callback de streaming
        (data) => {
          const { token } = data || {};
          if (typeof token === 'string' && token.length > 0) {
            bufferRef.current += token;
            setOutput(bufferRef.current);
          }
        }
      );

      // Garante texto final completo
      if (res?.text && res.text.length > 0 && res.text !== bufferRef.current) {
        setOutput(res.text);
        bufferRef.current = res.text;
      }
      
      // Salva resposta no histórico
      const finalResponse = res?.text || bufferRef.current;
      if (finalResponse) {
        await saveConversation('assistant', finalResponse);
      }
      
    } catch (e: any) {
      console.error('Erro na inferência:', e);
      setRunError(e?.message ?? 'Fuoco teve dificuldades para responder 🔥');
    } finally {
      setIsRunning(false);
    }
  }

  function handleClear() {
    setOutput('');
    setRunError(null);
    setRelevantDocs([]);
    bufferRef.current = '';
  }

  async function handleClearHistory() {
    Alert.alert(
      'Limpar Histórico',
      'Isso apagará toda a conversa com Fuoco. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await SimpleRAG.saveToHistory('assistant', ''); // Limpa histórico
              handleClear();
              Alert.alert('Sucesso', 'Histórico limpo! Fuoco está pronto para uma nova conversa 🔥');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível limpar o histórico');
            }
          }
        }
      ]
    );
  }

  const getStatusInfo = () => {
    if (error) {
      return {
        label: `Fuoco indisponível: ${error}`,
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: '💥'
      };
    }
    
    if (!ready) {
      return {
        label: `Despertando Fuoco... ${progress}%`,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: '🔥'
      };
    }
    
    if (!ctx) {
      return {
        label: 'Fuoco adormecido',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: '😴'
      };
    }
    
    return {
      label: 'Fuoco desperto e pronto ⚡',
      color: '#10B981',
      bgColor: '#D1FAE5',
      icon: '🔥'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={{ flex: 1, padding: 16, gap: 16 }}>
        {/* Header */}
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#DC2626', marginBottom: 4 }}>
            🔥 Fuoco
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            Espírito de Fogo e Produtividade
          </Text>
          
          {/* Status Badge */}
          <View style={{
            backgroundColor: statusInfo.bgColor,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}>
            <Text style={{ fontSize: 14 }}>{statusInfo.icon}</Text>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '600',
              color: statusInfo.color 
            }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Documentos Relevantes */}
        {relevantDocs.length > 0 && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 12,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B'
          }}>
            <Pressable onPress={() => setShowRAGDocs(!showRAGDocs)}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#92400E' }}>
                🧠 Sabedoria Ancestral Ativada ({relevantDocs.length}) {showRAGDocs ? '▼' : '▶'}
              </Text>
            </Pressable>
            
            {showRAGDocs && (
              <View style={{ marginTop: 8 }}>
                {relevantDocs.map((doc, i) => (
                  <Text key={doc.id} style={{ fontSize: 11, color: '#92400E', marginBottom: 4 }}>
                    • {doc.metadata.title}: {doc.content.substring(0, 100)}...
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Input Section */}
        <View style={{ 
          borderWidth: 2, 
          borderColor: '#FCA5A5', 
          borderRadius: 16, 
          padding: 16,
          backgroundColor: '#FFFBEB'
        }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: '#DC2626',
            marginBottom: 8 
          }}>
            💬 Fale com Fuoco
          </Text>
          
          <TextInput
            value={userText}
            onChangeText={setUserText}
            placeholder="Como posso ajudar a acender sua produtividade? 🔥"
            multiline
            style={{
              minHeight: 100,
              borderWidth: 1,
              borderColor: '#FED7AA',
              borderRadius: 12,
              padding: 12,
              backgroundColor: 'white',
              textAlignVertical: 'top',
              fontSize: 16,
              lineHeight: 22
            }}
            editable={!isRunning}
          />
          
          {/* Action Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            gap: 12, 
            marginTop: 12,
            justifyContent: 'space-between'
          }}>
            <Pressable
              onPress={handleClearHistory}
              style={{
                backgroundColor: '#FEE2E2',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FECACA',
              }}
            >
              <Text style={{ 
                color: '#DC2626', 
                fontWeight: '600',
                fontSize: 12
              }}>
                🗑️ Histórico
              </Text>
            </Pressable>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleClear}
                disabled={isRunning || (!output && !runError)}
                style={{
                  backgroundColor: '#F3F4F6',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  opacity: (isRunning || (!output && !runError)) ? 0.5 : 1
                }}
              >
                <Text style={{ 
                  color: '#374151', 
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Limpar
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleSend}
                disabled={!canSend}
                style={{
                  backgroundColor: canSend ? '#DC2626' : '#9CA3AF',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  shadowColor: canSend ? '#DC2626' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontWeight: '700',
                  fontSize: 14
                }}>
                  {isRunning ? '🔥 Pensando...' : '⚡ Enviar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Output Section */}
        <View style={{ 
          flex: 1, 
          borderWidth: 2, 
          borderColor: '#FCA5A5', 
          borderRadius: 16, 
          backgroundColor: 'white',
          overflow: 'hidden'
        }}>
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#FED7AA',
            backgroundColor: '#FFFBEB'
          }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#DC2626'
            }}>
              🔥 Sabedoria de Fuoco
            </Text>
          </View>
          
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading State */}
            {isRunning && !output && (
              <View style={{ 
                alignItems: 'center', 
                justifyContent: 'center',
                paddingVertical: 32
              }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔥</Text>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={{ 
                  marginTop: 12, 
                  fontSize: 14, 
                  color: '#DC2626',
                  fontWeight: '600'
                }}>
                  Fuoco está canalizando sabedoria...
                </Text>
              </View>
            )}
            
            {/* Error State */}
            {runError && (
              <View style={{
                backgroundColor: '#FEE2E2',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#EF4444'
              }}>
                <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 16 }}>
                  💥 {runError}
                </Text>
                <Text style={{ color: '#DC2626', marginTop: 4, fontSize: 12 }}>
                  A chama se apagou momentaneamente. Tente novamente.
                </Text>
              </View>
            )}
            
            {/* Output Text */}
            {!runError && (
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: '#111827'
              }}>
                {output || (isRunning ? '' : '🔥 Fuoco aguarda sua pergunta para acender a chama da produtividade...\n\nPergunte sobre técnicas de foco, organização, motivação ou qualquer desafio de produtividade!')}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TestScreen;