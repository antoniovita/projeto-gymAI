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
  Modal,
  Switch,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useMessageParser } from '../hooks/useMessageParser';

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

const STORAGE_KEY = '@chat_messages';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useAuth();
  const { processMessage } = useMessageParser(userId);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    })();
  }, []);

  const saveMessages = async (updated: ChatMessage[]) => {
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    scrollToBottom();
  };

  const clearMessages = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const randomFrom = (options: string[]) => {
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleInputSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    await saveMessages(updatedMessages);

    setInput('');
    setIsTyping(true);

    const lowerInput = input.trim().toLowerCase();

    const isThanks = ['obrigado', 'valeu', 'agradecido', 'obrigada'].some((word) =>
      lowerInput.includes(word)
    );

    const intent = isThanks ? 'thanks' : await processMessage(input);

    setTimeout(async () => {
      const expenseResponses = [
        'Despesa registrada com sucesso!',
        'Anotado: uma nova despesa!',
        'Gasto adicionado à sua lista.',
        'Sua despesa foi salva.',
      ];

      const taskResponses = [
        'Tarefa registrada com sucesso!',
        'Nova tarefa adicionada!',
        'Está na lista! Tarefa salva.',
        'Tarefa anotada com sucesso!',
      ];

      const thanksResponses = [
        'De nada! Sempre por aqui. 😊',
        'Disponha!',
        'Fico feliz em ajudar!',
        'Sempre que precisar, estou aqui.',
      ];

      const fallbackResponses = [
        'Não entendi sua mensagem.',
        'Você pode reformular?',
        'Não consegui identificar o tipo de registro.',
        'Tente novamente com mais detalhes.',
      ];

      const finalText =
        intent === 'expense'
          ? randomFrom(expenseResponses)
          : intent === 'task'
          ? randomFrom(taskResponses)
          : intent === 'thanks'
          ? randomFrom(thanksResponses)
          : randomFrom(fallbackResponses);

      let index = 0;
      setTypingText('');

      const interval = setInterval(() => {
        setTypingText((prev) => {
          const next = finalText.slice(0, index + 1);
          index++;

          if (index === finalText.length) {
            clearInterval(interval);
            const systemReply: ChatMessage = { role: 'ai', text: finalText };
            const finalMessages = [...updatedMessages, systemReply];
            saveMessages(finalMessages);
            setIsTyping(false);
            setTypingText('');
          }

          return next;
        });
      }, 25);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <View className="flex flex-col px-6 mt-[40px]">
        <Text className="text-3xl text-white font-medium font-sans mb-4">Your Chat</Text>

        <View className="flex-row items-center gap-2 mt-2">
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="flex-row items-center gap-2 bg-neutral-700 rounded-xl px-3 py-1"
          >
            <Ionicons name="options-outline" size={15} color="#ff7a7f" />
            <Text className="text-[#ff7a7f] font-sans font-medium text-sm">Opções</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-3 py-1"
          >
            <Feather name="settings" size={14} color="white" />
            <Text className="text-white font-sans font-medium text-sm">Configurações</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between mt-[20px]">
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View className={`mb-6 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <View
                    className={`rounded-3xl px-4 py-3 ${
                      item.role === 'user' ? 'bg-rose-500' : 'bg-zinc-700'
                    }`}
                  >
                    <Text className="text-white text-[15px] font-sans">{item.text}</Text>
                  </View>
                </View>
              )}
              ListFooterComponent={
                isTyping ? (
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
                ) : null
              }
            />

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
                />
                <TouchableOpacity
                  className="w-[28px] h-[28px] rounded-full mr-8 mt-2 bg-rose-400 justify-center items-center"
                  onPress={handleInputSubmit}
                >
                  <Ionicons name="caret-forward" size={18} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal de configurações */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
          <View className="flex-1 bg-black/60 justify-end" />
        </TouchableWithoutFeedback>

        <View className="bg-zinc-800 rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-2xl font-bold">Configurações</Text>
            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mb-4">
            {/* Modo escuro */}
            <View className="flex-row justify-between items-center py-3 border-b border-zinc-700">
              <Text className="text-gray-300 text-lg">Modo Escuro</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#f43f5e' }}
                thumbColor={darkMode ? '#ff7a7f' : '#f4f3f4'}
              />
            </View>

            {/* Notificações */}
            <View className="flex-row justify-between items-center py-3 border-b border-zinc-700">
              <Text className="text-gray-300 text-lg">Notificações</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#f43f5e' }}
                thumbColor={notificationsEnabled ? '#ff7a7f' : '#f4f3f4'}
              />
            </View>

            {/* Fonte */}
            <View className="py-3 border-b border-zinc-700">
              <Text className="text-gray-300 text-lg mb-2">Tamanho da Fonte</Text>
              <View className="flex-row items-center justify-between">
                {['small', 'medium', 'large'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setFontSize(size as any)}
                    className={`px-4 py-1 rounded-full border-2 ${
                      fontSize === size ? 'border-rose-400' : 'border-zinc-700'
                    }`}
                  >
                    <Text
                      className={`text-white ${
                        fontSize === size ? 'font-semibold' : 'font-light'
                      }`}
                    >
                      {size === 'small' ? 'Pequena' : size === 'medium' ? 'Média' : 'Grande'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tema */}
            <View className="py-3">
              <Text className="text-gray-300 text-lg mb-2">Tema</Text>
              <View className="flex-row gap-3">
                {['#ff7a7f', '#22d3ee', '#f59e0b', '#a3e635'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => console.log('Tema alterado para', color)}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: input ? undefined : '#fff' }}
                  />
                ))}
              </View>
            </View>

            {/* Histórico */}
            <View className="py-3">
              <Text className="text-gray-300 text-lg mb-2">Histórico</Text>
              <TouchableOpacity
                onPress={clearMessages}
                className="bg-rose-600 py-2 px-4 rounded-xl items-center"
              >
                <Text className="text-white">Limpar Conversa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-rose-500 py-3 rounded-xl items-center mb-4"
            onPress={() => setSettingsVisible(false)}
          >
            <Text className="text-white text-lg font-semibold">Salvar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
