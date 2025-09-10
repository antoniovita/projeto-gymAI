import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ChatStatsSection from './comps/ChatStatsSection';
import { useChat, Message } from '../../../hooks/useChat';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  
  const {
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
    
    // Funções
    handleInputSubmit,
    clearMessages,
    initializeLlama,
    resetError,
    cancelGeneration,
  } = useChat();

  // Inicializa o Llama quando o componente monta
  useEffect(() => {
    if (!isReady && !isInitializing && !error) {
      initializeLlama();
    }
  }, []);

  // Exibe erro se houver
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Erro',
        `Houve um problema com o assistente: ${error}`,
        [
          { text: 'Tentar Novamente', onPress: () => { resetError(); initializeLlama(); } },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  }, [error]);

  // Estilos personalizados para o markdown
  const markdownStyles = {
    body: {
      color: '#ffffff',
      fontSize: 15,
      lineHeight: 22,
    },
    heading1: {
      color: '#ffffff',
      fontSize: 30,
      fontWeight: 'bold' as const,
      marginBottom: 12,
      marginTop: 16,
    },
    heading2: {
      color: '#ffffff',
      fontSize: 22,
      fontWeight: 'bold' as const,
      marginBottom: 8,
      marginTop: 12,
    },
    heading3: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold' as const,
      marginBottom: 6,
      marginTop: 10,
    },
    paragraph: {
      color: '#ffffff',
      fontSize: 17,
      lineHeight: 22,
      marginBottom: 8,
    },
    strong: {
      color: '#ffffff',
      fontWeight: 'bold' as const,
    },
    em: {
      color: '#ffffff',
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: '#52525b',
      color: '#ffffff',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    code_block: {
      backgroundColor: '#404040',
      color: '#ffffff',
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginVertical: 8,
    },
    fence: {
      backgroundColor: '#404040',
      color: '#ffffff',
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: '#374151',
      borderLeftWidth: 4,
      borderLeftColor: '#ffa41f',
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { flexDirection: 'row' as const, marginVertical: 2 },
    bullet_list_icon: { color: '#ffffff', marginRight: 8, fontSize: 15, lineHeight: 22 },
    bullet_list_content: { flex: 1 },
    ordered_list_content: { flex: 1 },
    table: {
      borderWidth: 1,
      borderColor: '#52525b',
      borderRadius: 4,
      marginVertical: 8,
    },
    thead: { backgroundColor: '#374151' },
    tbody: { backgroundColor: '#1f2937' },
    th: { borderWidth: 1, borderColor: '#52525b', padding: 8 },
    td: { borderWidth: 1, borderColor: '#52525b', padding: 8 },
    tr: { borderBottomWidth: 1, borderColor: '#52525b' },
    link: { color: '#ffa41f', textDecorationLine: 'underline' as const },
    text: { color: '#ffffff' },
    hr: { backgroundColor: '#52525b', height: 1, marginVertical: 16 },
  };

  // Função para renderizar cada mensagem
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    
    return (
      <View 
        className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}
        key={`message-${index}`}
      >
        <View className={`rounded-3xl px-4 py-3 ${
          isUser ? 'bg-[#1e1e1e]' : 'bg-transparent'
        }`}>
          {isUser ? (
            <Text className="text-white text-[15px] font-sans">
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {item.content}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  // Função para renderizar o indicador de digitação
  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View className="mb-6 items-start">
        <View className="rounded-3xl px-4 py-3 bg-zinc-700 max-w-[85%]">
          <View className="flex-row items-center">
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            <Text className="text-white ml-2 text-sm">
              {typingText || 'Pensando...'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Função para renderizar conteúdo vazio
  const renderEmptyState = () => {
    if (messages.length > 0 || isTyping) return null;
    
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Ionicons name="chatbubbles-outline" size={60} color="#52525b" />
        <Text className="text-zinc-400 text-center mt-4 text-base">
          Olá! Sou o Fuoco, seu assistente de produtividade{'\n'}Como posso te ajudar hoje?
        </Text>
      </View>
    );
  };

  // Função para enviar mensagem
  const handleSend = () => {
    if (!input.trim()) return;
    
    handleInputSubmit(input, setInput);
  };

  // Função para determinar se o botão de enviar deve estar ativo
  const isSendButtonActive = () => {
    return input.trim() && !isTyping && !isGenerating && (isReady || (!isInitializing && !isDownloading));
  };

  // Função para determinar o status do progresso
  const getProgressStatus = () => {
    if (isInitializing && !isDownloading) {
      return 'Inicializando modelo...';
    }
    if (isDownloading) {
      return `Baixando modelo... ${Math.round(downloadProgress)}%`;
    }
    if (isGenerating) {
      return 'Gerando resposta...';
    }
    if (isReady) {
      return 'Pronto para conversar!';
    }
    if (error) {
      return 'Erro - toque no botão de envio para tentar novamente';
    }
    return 'Preparando assistente...';
  };

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      {/* Header */}
      <View className="mt-8 px-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={clearMessages} className="w-[80px]">
          <Ionicons name="trash-outline" size={20} color="#A1A1AA" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Assistente</Text>
        </View>
        <TouchableOpacity 
          onPress={isGenerating ? cancelGeneration : undefined} 
          className="w-[80px] items-end"
        >
          {isGenerating && (
            <Ionicons name="stop" size={20} color="#ffa41f" />
          )}
        </TouchableOpacity>
      </View>

      {/* Seção de estatísticas */}
      <ChatStatsSection />

      {/* Área de chat */}
      <View className="flex-1 relative">
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => `message-${index}`}
          contentContainerStyle={{ 
            padding: 16, 
            paddingBottom: 20,
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
        />
      </View>

      {/* Composer */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="w-full rounded-t-[30px] pt-8 pl-6 pb-6" style={{ backgroundColor: '#1e1e1e' }}>
          <View className="flex-row pr-6">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#A1A1AA"
              multiline
              textAlignVertical="top"
              className="flex-1 font-sans text-white font-light text-xl"
              editable={!isTyping && !isGenerating}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={handleSend}
              className={`w-[40px] h-[40px] rounded-full mr-4 pl-1 justify-center items-center ${
                isSendButtonActive() ? 'bg-[#ffa41f]' : 'bg-zinc-600'
              }`}
              activeOpacity={0.8}
              disabled={!isSendButtonActive()}
            >
              <Ionicons 
                name="send" 
                size={18} 
                color={isSendButtonActive() ? '#ffffff' : '#52525b'} 
              />
            </TouchableOpacity>
          </View>

          {/* Barra de progresso e status */}
          {(isInitializing || isDownloading || isGenerating || !isReady) && (
            <View className="mt-4 mr-6">
              <View className="bg-zinc-700 h-2 rounded-full overflow-hidden">
                <View 
                  className="bg-[#ffa41f] h-full rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${isDownloading ? downloadProgress : (isReady ? 100 : 0)}%` 
                  }} 
                />
              </View>
              <Text className="text-zinc-400 text-xs text-center mt-1">
                {getProgressStatus()}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}