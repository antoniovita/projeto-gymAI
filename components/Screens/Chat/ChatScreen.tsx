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
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ChatStatsSection from './comps/ChatStatsSection';
import { useChat, Message } from '../../../hooks/useChat';
import GradientIcon from 'components/generalComps/GradientIcon';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  
  const {
    // estados do chat
    messages,
    isThinking,
    isTyping,
    typingText,
    flatListRef,
    
    // estados do Llama
    isInitializing,
    isDownloading,
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
      fontSize: 16,
      lineHeight: 25,
      fontFamily: 'Poppins_400Regular',
    },
    heading1: {
      color: '#ffffff',
      fontSize: 30,
      lineHeight: 25,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      marginTop: 16,
    },
    heading2: {
      color: '#ffffff',
      fontSize: 22,
      lineHeight: 25,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 8,
      marginTop: 12,
    },
    heading3: {
      color: '#ffffff',
      fontSize: 20,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 6,
      lineHeight: 25,
      marginTop: 10,
    },
    paragraph: {
      color: '#ffffff',
      fontSize: 17,
      lineHeight: 25,
      wordSpacing: 20,
      marginBottom: 8,
    },
    strong: {
      color: '#ffffff',
      fontFamily: 'Poppins_600SemiBold',
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
    bullet_list_icon: { color: '#ffffff', marginRight: 8, fontSize: 60, lineHeight: 54},
    bullet_list_content: { flex: 1 },
    ordered_list_content: { flex: 1 },
   table: {
    borderWidth: 1,
    borderColor: '#3E3F4B',
    borderRadius: 6,
    marginVertical: 10,
  },
  thead: { backgroundColor: '#202123' },
  tbody: { backgroundColor: '#202123' },
  th: {
    borderWidth: 1,
    borderColor: '#3E3F4B',
    padding: 10,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  td: {
    borderWidth: 1,
    borderColor: '#3E3F4B',
    padding: 10,
    color: '#E5E7EB',
  },
  tr: { borderBottomWidth: 1, borderColor: '#3E3F4B' },
  link: { color: '#10A37F', textDecorationLine: 'underline' as const },
  text: { color: '#E5E7EB' },
  hr: { backgroundColor: '#3E3F4B', height: 1, marginVertical: 16 },

  };

  // Função para renderizar cada mensagem
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    
    return (
      <View 
        className={` ${isUser ? 'items-end' : 'items-start'}`}
        key={`message-${index}`}
      >
        <View className={`rounded-3xl mb-2 ${
          isUser ? 'px-5 bg-[#1e1e1e] max-w-[85%]' : 'bg-transparent px-1'
        } py-3`}>
          {isUser ? (
            <Text className="text-white text-[16px] font-poppins">
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

  // Função para renderizar o indicador de digitação com animação
  const renderTypingIndicator = () => {
    const showTyping = isTyping || isThinking;
    
    if (!showTyping) return null;
    
    return (
      <View className="mb-6 items-start">
        <View className="rounded-3xl px-1 py-3 bg-transparent">
          {typingText && typingText.length > 0 ? (
            // Se há texto sendo digitado, mostra com animação caractere por caractere
            <Markdown style={markdownStyles}>
              {typingText + ' |'}
            </Markdown>
          ) : (
            // Estados de loading padrão
            <View className="flex-row items-center">
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
              <Text className="text-white ml-2 text-[16px] font-poppins">
                {isThinking && 'Pensando...'}
              </Text>
            </View>
          )}
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

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      {/* Header */}
      <View className="mt-5 mb-2 px-4 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-poppins text-[18px] font-medium">Assistente</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          <Pressable onPress={clearMessages}>
            <GradientIcon name='trash'/>
          </Pressable>
        </View>
      </View>

      {/* Seção de estatísticas */}
      <ChatStatsSection isTyping={isTyping}/>

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
          onContentSizeChange={() => {
            // Auto scroll para a última mensagem
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
          }}
        />
      </View>

      {/* Composer */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="w-full rounded-t-[30px] pt-6 pl-6 pb-6" style={{ backgroundColor: '#1e1e1e' }}>
          <View className="flex-row pr-6">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#A1A1AA"
              multiline
              maxLength={500}
              textAlignVertical="top"
              className="flex-1 font-poppins text-white font-light text-xl max-h-32"
              editable={!isTyping && !isGenerating}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              returnKeyType="send"
            />

            {isTyping? (

            <TouchableOpacity
              onPress={cancelGeneration}
              className={`w-[43px] h-[43px] rounded-full mr-4 justify-center items-center bg-white
              }`}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="stop" 
                size={20} 
                color= 'black' 
              />
            </TouchableOpacity>

            ) : (            
              
              <TouchableOpacity
              onPress={handleSend}
              className={`w-[43px] h-[43px] rounded-full mr-4 justify-center items-center bg-white
              }`}
              activeOpacity={0.8}
              disabled={!isSendButtonActive()}
            >
              <Ionicons 
                name="arrow-up" 
                size={23} 
                color='black'
              />
            </TouchableOpacity>
          )
          }
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}