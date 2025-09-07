import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatStatsSection from './comps/ChatStatsSection';
import { useRAGChat } from '../../../hooks/useRAGChat';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type MarkdownElement = {
  type: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'code' | 'codeblock' | 'quote' | 'list' | 'table' | 'text' | 'checkbox';
  content: string;
  key: string;
  language?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  checked?: boolean;
};

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { 
    run, 
    reset, 
    loading, 
    error, 
    answer, 
    modelReady, 
    downloadProgress,
  } = useRAGChat({
    skin: 'fuoco',
    includeDefault: true,
    nPredict: 128,
    temperature: 0.7,
    top_p: 0.9,
    streaming: true,
  });

  // Função para limpar "Resposta:" do início da mensagem
  const cleanResponse = (text: string): string => {
    return text.replace(/^Resposta:\s*/i, '').trim();
  };

  // Scroll automático para o fim quando novas mensagens chegam
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Adiciona mensagem do usuário
  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  // Adiciona mensagem do assistente
  const addAssistantMessage = (text: string) => {
    const cleanedText = cleanResponse(text);
    const newMessage: Message = {
      id: Date.now().toString() + '_assistant',
      text: cleanedText,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  // Atualiza a última mensagem do assistente (para streaming)
  const updateLastAssistantMessage = (text: string) => {
    const cleanedText = cleanResponse(text);
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      
      if (lastMessage && !lastMessage.isUser) {
        lastMessage.text = cleanedText;
      } else {
        newMessages.push({
          id: Date.now().toString() + '_assistant',
          text: cleanedText,
          isUser: false,
          timestamp: new Date(),
        });
      }
      
      return newMessages;
    });
    scrollToBottom();
  };

  // Função para processar texto com formatação Markdown
  const processMarkdownText = (text: string): MarkdownElement[] => {
    if (!text) return [];
    
    const elements: MarkdownElement[] = [];
    const lines = text.split('\n');
    let currentIndex = 0;
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLanguage = '';
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push({
            type: 'codeblock',
            content: codeBlockContent.trim(),
            language: codeBlockLanguage,
            key: `codeblock_${currentIndex++}`
          });
          inCodeBlock = false;
          codeBlockContent = '';
          codeBlockLanguage = '';
        } else {
          // Start code block
          inCodeBlock = true;
          codeBlockLanguage = trimmedLine.slice(3);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      // Table detection
      if (trimmedLine.includes('|') && !inTable) {
        // Start table
        inTable = true;
        tableHeaders = trimmedLine.split('|').map(h => h.trim()).filter(h => h);
        continue;
      } else if (inTable && trimmedLine.includes('|')) {
        if (trimmedLine.match(/^\s*\|[\s\-:]+\|\s*$/)) {
          // Table separator line - skip
          continue;
        }
        const row = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        tableRows.push(row);
        continue;
      } else if (inTable && !trimmedLine.includes('|')) {
        // End table
        elements.push({
          type: 'table',
          content: '',
          headers: tableHeaders,
          rows: tableRows,
          key: `table_${currentIndex++}`
        });
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        elements.push({
          type: 'h3',
          content: trimmedLine.slice(4),
          key: `h3_${currentIndex++}`
        });
      } else if (trimmedLine.startsWith('## ')) {
        elements.push({
          type: 'h2',
          content: trimmedLine.slice(3),
          key: `h2_${currentIndex++}`
        });
      } else if (trimmedLine.startsWith('# ')) {
        elements.push({
          type: 'h1',
          content: trimmedLine.slice(2),
          key: `h1_${currentIndex++}`
        });
      }
      // Checkbox lists
      else if (trimmedLine.match(/^\d+\.\s+\*\*(.*?)\*\*/) || trimmedLine.match(/^-\s+\[.\]\s+/)) {
        const isChecked = trimmedLine.includes('[x]') || trimmedLine.includes('[X]');
        const content = trimmedLine.replace(/^-\s+\[.\]\s+/, '').replace(/^\d+\.\s+\*\*(.*?)\*\*/, '$1');
        elements.push({
          type: 'checkbox',
          content,
          checked: isChecked,
          key: `checkbox_${currentIndex++}`
        });
      }
      // Numbered/bullet lists
      else if (trimmedLine.match(/^\d+\.\s+/) || trimmedLine.match(/^-\s+/) || trimmedLine.match(/^\*\s+/)) {
        const content = trimmedLine.replace(/^\d+\.\s+/, '').replace(/^[-*]\s+/, '');
        elements.push({
          type: 'list',
          content,
          key: `list_${currentIndex++}`
        });
      }
      // Quotes
      else if (trimmedLine.startsWith('> ')) {
        elements.push({
          type: 'quote',
          content: trimmedLine.slice(2),
          key: `quote_${currentIndex++}`
        });
      }
      // Regular text with inline formatting
      else if (trimmedLine) {
        elements.push({
          type: 'text',
          content: line,
          key: `text_${currentIndex++}`
        });
      }
      // Empty line
      else {
        elements.push({
          type: 'text',
          content: '',
          key: `empty_${currentIndex++}`
        });
      }
    }

    // Handle remaining table if exists
    if (inTable && tableHeaders.length > 0) {
      elements.push({
        type: 'table',
        content: '',
        headers: tableHeaders,
        rows: tableRows,
        key: `table_${currentIndex++}`
      });
    }

    return elements;
  };

  // Função para renderizar inline formatting (bold, italic, code)
  const renderInlineText = (text: string) => {
    if (!text) return null;

    const parts = [];
    let currentIndex = 0;
    
    // Regex para encontrar formatação inline
    const inlineRegex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)/g;
    let match;
    
    while ((match = inlineRegex.exec(text)) !== null) {
      // Adiciona texto antes da formatação
      if (match.index > currentIndex) {
        const beforeText = text.substring(currentIndex, match.index);
        parts.push(
          <Text key={`text_${currentIndex}`} className="text-white text-base font-sans">
            {beforeText}
          </Text>
        );
      }
      
      if (match[1]) {
        // Bold **text**
        parts.push(
          <Text key={`bold_${match.index}`} className="text-white text-base font-bold font-sans">
            {match[2]}
          </Text>
        );
      } else if (match[3]) {
        // Italic *text*
        parts.push(
          <Text key={`italic_${match.index}`} className="text-white text-base italic font-sans">
            {match[4]}
          </Text>
        );
      } else if (match[5]) {
        // Code `text`
        parts.push(
          <View key={`code_${match.index}`} className="bg-zinc-600 px-1 rounded">
            <Text className="text-green-300 text-sm font-mono">
              {match[6]}
            </Text>
          </View>
        );
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Adiciona texto restante
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      parts.push(
        <Text key={`text_${currentIndex}`} className="text-white text-base font-sans">
          {remainingText}
        </Text>
      );
    }
    
    // Se não há formatação, retorna texto simples
    if (parts.length === 0) {
      return (
        <Text className="text-white text-base font-sans">
          {text}
        </Text>
      );
    }
    
    return <Text>{parts}</Text>;
  };

  // Função para renderizar cada elemento
  const renderMarkdownElement = (element: MarkdownElement) => {
    switch (element.type) {
      case 'h1':
        return (
          <Text key={element.key} className="text-white text-2xl font-bold font-sans mb-3 mt-2">
            {element.content}
          </Text>
        );
      case 'h2':
        return (
          <Text key={element.key} className="text-white text-xl font-bold font-sans mb-2 mt-2">
            {element.content}
          </Text>
        );
      case 'h3':
        return (
          <Text key={element.key} className="text-white text-lg font-bold font-sans mb-2 mt-1">
            {element.content}
          </Text>
        );
      case 'quote':
        return (
          <View key={element.key} className="border-l-4 border-blue-500 pl-4 py-2 my-2 bg-zinc-800">
            <Text className="text-gray-300 text-base italic font-sans">
              {element.content}
            </Text>
          </View>
        );
      case 'list':
        return (
          <View key={element.key} className="flex-row mb-1">
            <Text className="text-white text-base font-sans mr-2">•</Text>
            {renderInlineText(element.content)}
          </View>
        );
      case 'checkbox':
        return (
          <View key={element.key} className="flex-row items-center mb-1">
            <Text className="text-white text-base font-sans mr-2">
              {element.checked ? '☑️' : '☐'}
            </Text>
            {renderInlineText(element.content)}
          </View>
        );
      case 'codeblock':
        return (
          <View key={element.key} className="bg-zinc-900 p-3 rounded-lg my-2">
            {element.language && (
              <Text className="text-gray-400 text-xs mb-2 font-mono">
                {element.language}
              </Text>
            )}
            <Text className="text-green-300 text-sm font-mono">
              {element.content}
            </Text>
          </View>
        );
      case 'table':
        return (
          <View key={element.key} className="my-3">
            {/* Table Headers */}
            <View className="flex-row border-b border-zinc-600 pb-2 mb-2">
              {element.headers?.map((header, index) => (
                <Text key={index} className="flex-1 text-white font-bold text-sm text-center">
                  {header}
                </Text>
              ))}
            </View>
            {/* Table Rows */}
            {element.rows?.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row py-1">
                {row.map((cell, cellIndex) => (
                  <Text key={cellIndex} className="flex-1 text-white text-sm text-center">
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      case 'text':
      default:
        if (!element.content.trim()) {
          return <View key={element.key} className="h-2" />;
        }
        return (
          <View key={element.key} className="mb-1">
            {renderInlineText(element.content)}
          </View>
        );
    }
  };

  // Função para renderizar texto formatado
  const renderFormattedText = (text: string) => {
    const elements = processMarkdownText(text);
    
    return (
      <View>
        {elements.map(element => renderMarkdownElement(element))}
      </View>
    );
  };

  // Monitora mudanças na resposta (streaming)
  useEffect(() => {
    if (answer) {
      updateLastAssistantMessage(answer);
    }
  }, [answer]);

  // Monitora erros
  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
    }
  }, [error]);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    if (!modelReady && downloadProgress < 100) {
      Alert.alert('Aguarde', `Modelo carregando... ${downloadProgress.toFixed(1)}%`);
      return;
    }

    // Adiciona mensagem do usuário
    addUserMessage(text);
    setInputText('');
    
    // Adiciona mensagem vazia do assistente (será preenchida via streaming)
    addAssistantMessage('');

    try {
      // Executa o RAG
      await run(text);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.isUser) {
      // Mensagem do usuário - mantém o layout original em balãozinho
      return (
        <View key={message.id} className="mb-4 items-end">
          <View className="max-w-[85%] p-4 rounded-2xl bg-blue-600">
            <Text className="text-white text-base font-sans">
              {message.text}
            </Text>
          </View>
          <Text className="text-zinc-400 text-xs mt-1 font-sans">
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      );
    } else {
      // Mensagem da IA - largura total, centralizada, sem balãozinho
      return (
        <View key={message.id} className="mb-4 w-full">
          <View className="w-full px-2">
            {renderFormattedText(message.text)}
          </View>
          <Text className="text-zinc-400 text-xs mt-2 text-center font-sans">
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      <View className="mt-8 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Assistente</Text>
          {!modelReady && downloadProgress > 0 && downloadProgress < 100 && (
            <Text className="text-zinc-400 text-xs font-sans mt-1">
              Carregando modelo... {downloadProgress.toFixed(1)}%
            </Text>
          )}
        </View>
        <TouchableOpacity 
          className="w-[80px] items-end"
          onPress={() => {
            setMessages([]);
            reset();
          }}
        >
          <Ionicons name="refresh" size={24} color="#A1A1AA" />
        </TouchableOpacity>
      </View>

      <ChatStatsSection />

      <View className="flex-1 relative">
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-zinc-400 text-center font-sans text-base">
                {!modelReady && downloadProgress > 0 && downloadProgress < 100
                  ? `Preparando o assistente...\n${downloadProgress.toFixed(1)}%`
                  : 'Comece uma conversa enviando uma mensagem'}
              </Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          
          {loading && (
            <View className="w-full mb-4">
              <View className="w-full px-2">
                <Text className="text-zinc-400 font-sans">Digitando...</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="w-full rounded-t-[30px] pt-8 pl-6 pb-6" style={{ backgroundColor: '#1e1e1e' }}>
            <View className="flex-row pr-6">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={
                  !modelReady && downloadProgress < 100
                    ? "Aguardando modelo..."
                    : loading
                      ? "Processando..."
                      : "Digite algo..."
                }
                placeholderTextColor="#A1A1AA"
                multiline
                textAlignVertical="top"
                className="flex-1 font-sans text-white font-light text-xl max-h-[120px]"
                blurOnSubmit={false}
                onSubmitEditing={handleSendMessage}
                editable={!loading && modelReady}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={loading || !inputText.trim() || (!modelReady && downloadProgress < 100)}
                className={`w-[30px] h-[30px] rounded-full mr-4 pl-1 mt-2 justify-center items-center ${
                  loading || !inputText.trim() || (!modelReady && downloadProgress < 100)
                    ? 'bg-zinc-700' 
                    : 'bg-blue-600'
                }`}
              >
                <Ionicons 
                  name={loading ? "hourglass" : "send"} 
                  size={16} 
                  color={loading || !inputText.trim() || (!modelReady && downloadProgress < 100) ? "#6B7280" : "#FFFFFF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}