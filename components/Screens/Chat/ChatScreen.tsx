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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../widgets/types';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '../../../hooks/useChat';
import { OUTLINE } from '../../../imageConstants'

const EmptyState = () => {
  return (
    <View className="flex-1 justify-center items-center mt-[70px] px-8 pb-20">
      <View className="items-center">
        <View className="ml-10">

          <Image style={{width: 140, height: 130}} source={OUTLINE.fuocoCHAT}></Image>

        </View>
        <Text className="text-neutral-400 text-xl mt-3 font-medium font-sans mb-2 text-center">
          Nenhuma conversa ainda
        </Text>
        <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
          Comece uma conversa para registrar suas tarefas e despesas
        </Text>
      </View>
    </View>
  );
};


export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    messages,
    isTyping,
    typingText,
    flatListRef,
    handleInputSubmit,
    clearMessages,
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
    handleInputSubmit(input, setInput);
    setTimeout(() => {
      scrollToBottom();
    }, 50);
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
      {messages.length === 0 && !isTyping ? (
        <EmptyState />
      ) : (
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
                className={`rounded-3xl px-4 py-3 ${
                  item.role === 'user' ? 'bg-[#1e1e1e]' : 'bg-zinc-700'
                }`}
              >
                <Text className="text-white text-[15px] font-sans max-w-[280px]">{item.text.trim()}</Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View className="mb-6 items-start">
              <View className="rounded-3xl px-4 py-3 bg-zinc-700">
                <Text className="text-white text-[15px] font-sans">
                  {typingText ? (
                    <Text className="text-white text-[15px] font-sans">{typingText}</Text>
                  ) : (
                    <Ionicons name="ellipsis-horizontal" size={20} color="#white" />
                  )}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

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
                className="w-[30px] h-[30px] rounded-full mr-4 pl-1 mt-2 bg-[#ffa41f] justify-center items-center"
                onPress={onSubmit}
              >
                <Ionicons name="send" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}