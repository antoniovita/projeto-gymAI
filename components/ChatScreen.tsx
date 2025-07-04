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
  FlatList,
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
import { SettingsModal } from './comps/configModal';


type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

const STORAGE_KEY = '@chat_messages';

const EmptyState = () => {
  return (
    <View className="flex-1 justify-center items-center mt-[70px] px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="gray" />
        </View>
        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
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

  const isGreeting = ['olá', 'oi', 'e aí', 'bom dia', 'boa tarde', 'boa noite'].some((word) =>
    lowerInput.includes(word)
  );

  const isIdentityQuestion = ['quem é você', 'quem é vc', 'qual seu nome', 'o que você é', 'você é quem', 'você faz o quê', 'o que você faz'].some((phrase) =>
    lowerInput.includes(phrase)
  );

  const intent = isThanks
    ? 'thanks'
    : isGreeting
    ? 'greeting'
    : isIdentityQuestion
    ? 'identity'
    : await processMessage(input);


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

    const greetingResponses = [
      'Olá! Como posso te ajudar hoje?',
      'Oi! Tudo bem por aí?',
      'E aí! Pronto para organizar o dia?',
      'Bom te ver por aqui! 😊',
    ];

    const fallbackResponses = [
      'Não entendi sua mensagem.',
      'Você pode reformular?',
      'Não consegui identificar o tipo de registro.',
      'Tente novamente com mais detalhes.',
    ];

    const identityResponses = [
    'Sou o Dayo, seu assistente pessoal. 😊',
    'Me chamo Dayo! Estou aqui pra te ajudar.',
    'Pode me chamar de Dayo. Estou sempre por aqui!',
    'Sou o Dayo, criado pra facilitar sua vida.',
    ];


const finalText =
  intent === 'expense'
    ? randomFrom(expenseResponses)
    : intent === 'task'
    ? randomFrom(taskResponses)
    : intent === 'thanks'
    ? randomFrom(thanksResponses)
    : intent === 'greeting'
    ? randomFrom(greetingResponses)
    : intent === 'identity'
    ? randomFrom(identityResponses)
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
        <Text className="text-3xl text-white font-medium font-sans mb-4">Meu Chat</Text>

        <View className="flex-row items-center gap-2 mt-2">

          <TouchableOpacity
            onPress={() => navigation.navigate('RoutineScreen')}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-3 py-1"
          >
            <Feather name="calendar" size={14} color="white" />
            <Text className="text-white font-sans font-medium text-sm">Rotina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-3 py-1"
          >
            <Ionicons name="options-outline" size={15} color="white" />
            <Text className="text-white font-sans font-medium text-sm">Opções</Text>
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
            {messages.length === 0 && !isTyping ? (
              <EmptyState />
            ) : (
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
            )}

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

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        fontSize={fontSize}
        setFontSize={setFontSize}
        clearMessages={clearMessages}
      />


    </SafeAreaView>
  );
}