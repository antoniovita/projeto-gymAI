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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '../../../hooks/useChat';
import ChatStatsSection from './comps/ChatStatsSection';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    messages,
    isTyping,
    typingText,
    handleInputSubmit,
    loadMessages
  } = useChat();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, typingText]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const onSubmit = () => {
    if (input.trim()) { // Só envia se tiver conteúdo
      handleInputSubmit(input, setInput);
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>

      <View className="mt-8 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Assistente</Text>
        </View>
        <View className="w-[80px]" />
      </View>

      <ChatStatsSection  />


      <View className="flex-1 relative">
          <ScrollView 
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollToBottom()}
          >
            {messages.map((item, index) => (
              <View key={index} className={`mb-6 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                <View
                  className={`rounded-3xl px-4 py-3 max-w-[280px] ${
                    item.role === 'user' ? 'bg-[#1e1e1e]' : 'bg-zinc-700'
                  }`}
                >
                  <Text className="text-white text-[15px] font-sans">{item.text.trim()}</Text>
                </View>
              </View>
            ))}
            
            {isTyping && (
              <View className="mb-6 items-start">
                <View className="rounded-3xl px-4 py-3 bg-zinc-700 max-w-[280px]">
                  {typingText ? (
                    <Text className="text-white text-[15px] font-sans">{typingText}</Text>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                    </View>
                  )}
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
                placeholder="Digite algo..."
                placeholderTextColor="#A1A1AA"
                value={input}
                onChangeText={setInput}
                multiline
                textAlignVertical="top"
                className="flex-1 font-sans text-white font-light text-xl"
                onSubmitEditing={onSubmit}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                className={`w-[30px] h-[30px] rounded-full mr-4 pl-1 mt-2 justify-center items-center ${
                  input.trim() ? 'bg-[#ffa41f]' : 'bg-zinc-600'
                }`}
                onPress={onSubmit}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={16} color={input.trim() ? "black" : "#A1A1AA"} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}