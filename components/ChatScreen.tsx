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
  Pressable,
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

  const handleInputSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    await saveMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const expandAbbreviations = (text: string) => {
      const abbreviations = {
        'vc': 'você',
        'q': 'que',
        'pq': 'porque',
        'tbm': 'também',
        'tb': 'também',
        'mt': 'muito',
        'mto': 'muito',
        'blz': 'beleza',
        'vlw': 'valeu',
        'flw': 'falou',
        'fds': 'fim de semana',
        'td': 'tudo',
        'tds': 'todos',
        'msm': 'mesmo',
        'aki': 'aqui',
        'ai': 'aí',
        'eh': 'é',
        'neh': 'né',
        'ne': 'né',
        'pra': 'para',
        'pro': 'para o',
        'numa': 'numa',
        'nao': 'não',
        'vo': 'vou',
        'ta': 'está',
        'tá': 'está',
        'bjs': 'beijos',
        'bjss': 'beijos',
        'kk': 'haha',
        'kkk': 'haha',
        'rs': 'risos',
        'rsrs': 'risos'
      };

      let expandedText = text;
      Object.entries(abbreviations).forEach(([abbr, full]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        expandedText = expandedText.replace(regex, full);
      });
      return expandedText;
    };

    const processedInput = expandAbbreviations(normalizeText(input));
    const originalInput = input.trim().toLowerCase();

    const thanksPatterns = [
      /\b(obrigad[ao]|valeu|vlw|agradec|brigad[ao]|thanks|obg)\b/i,
      /\b(muito obrigad[ao]|mt obrigad[ao]|mto obrigad[ao])\b/i
    ];

    const greetingPatterns = [
      /\b(ola|olá|oi|e ai|eai|coe|salve|fala|bom dia|boa tarde|boa noite)\b/i,
      /\b(como vai|como vc ta|como voce esta|tudo bem|td bem|blz)\b/i,
      /\b(hey|hello|hi|opa|oie)\b/i
    ];

    const identityPatterns = [
      /\b(quem (e |é )(voce|vc|tu)|qual (seu|teu) nome|o que (voce|vc) (e|é)|voce (e|é) quem)\b/i,
      /\b(voce faz o que|o que voce faz|me fala sobre voce|se apresenta)\b/i,
      /\b(quem sou eu falando|com quem estou falando|voce eh o que)\b/i
    ];

    const helpPatterns = [
      /\b(ajuda|socorro|help|como usar|como funciona|o que posso fazer|me ajuda)\b/i,
      /\b(nao sei|nao entendi|confuso|perdido|não sei usar)\b/i
    ];

    const complimentPatterns = [
      /\b(legal|massa|top|maneiro|dahora|show|bacana|incrivel|otimo|excelente)\b/i,
      /\b(gostei|adorei|amei|perfeito|muito bom|mt bom|mto bom)\b/i
    ];

    const farewellPatterns = [
      /\b(tchau|bye|falou|flw|ate logo|ate mais|xau|adeus|fui)\b/i,
      /\b(ja vou|tenho que ir|vou nessa|ate a proxima)\b/i
    ];

    const jokePatterns = [
      /\b(piada|conta uma piada|me faz rir|algo engracado|haha|kkkk?|rs+)\b/i,
      /\b(zoeira|brincadeira|gracinha|meme)\b/i
    ];

    const matchesPattern = (patterns: RegExp[]) => {
      return patterns.some(pattern => pattern.test(processedInput) || pattern.test(originalInput));
    };

    let intent = 'unknown';
    if (matchesPattern(thanksPatterns)) {
      intent = 'thanks';
    } else if (matchesPattern(greetingPatterns)) {
      intent = 'greeting';
    } else if (matchesPattern(identityPatterns)) {
      intent = 'identity';
    } else if (matchesPattern(helpPatterns)) {
      intent = 'help';
    } else if (matchesPattern(complimentPatterns)) {
      intent = 'compliment';
    } else if (matchesPattern(farewellPatterns)) {
      intent = 'farewell';
    } else if (matchesPattern(jokePatterns)) {
      intent = 'joke';
    } else {
      // Tentar processar como despesa ou tarefa
      intent = await processMessage(input);
    }

    // Delay realista para simular processamento
    const thinkingTime = Math.random() * 1500 + 800; // 800ms a 2.3s

    setTimeout(async () => {
      const responses = {
        expense: [
          'Despesa registrada com sucesso! 💰',
          'Anotado: uma nova despesa foi salva!',
          'Gasto adicionado à sua lista. Tudo organizado!',
          'Sua despesa foi registrada. Controle sempre em dia! 📊',
          'Perfeito! Mais uma despesa catalogada.',
          'Registrado! Sua organização financeira agradece. 💪'
        ],
        task: [
          'Tarefa registrada com sucesso! ✅',
          'Nova tarefa adicionada à sua lista!',
          'Está na lista! Tarefa salva e organizada.',
          'Tarefa anotada com sucesso! Vamos produzir! 🚀',
          'Registrado! Sua produtividade agradece.',
          'Perfeito! Mais uma tarefa no seu planejamento.'
        ],
        thanks: [
          'De nada! Sempre por aqui pra te ajudar. 😊',
          'Disponha! É um prazer ajudar.',
          'Fico feliz em ser útil! 🙂',
          'Sempre que precisar, estarei aqui.',
          'Imagina! Estamos juntos nessa jornada.',
          'Por nada! Adoro quando consigo ajudar.'
        ],
        greeting: [
          'Olá! Como posso te ajudar hoje? 😊',
          'Oi! Tudo bem por aí? Vamos organizar o dia?',
          'E aí! Pronto para registrar suas tarefas e despesas?',
          'Bom te ver por aqui! Como posso facilitar sua vida hoje? 🙂',
          'Salve! Vamos colocar tudo em ordem?',
          'Opa! Chegou na hora certa. O que vamos organizar hoje?'
        ],
        identity: [
          'Sou o Dayo, seu assistente pessoal! 😊 Estou aqui para ajudar você a organizar tarefas e despesas.',
          'Me chamo Dayo! Sou especializado em te ajudar com organização pessoal.',
          'Pode me chamar de Dayo. Minha missão é facilitar sua vida com organização! 🎯',
          'Sou o Dayo, criado especialmente para te ajudar a manter tudo em ordem.',
          'Eu sou o Dayo! Seu companheiro digital para organização e produtividade. 🤖'
        ],
        help: [
          'Posso te ajudar a registrar tarefas e despesas! Só me falar o que precisa anotar. 📝',
          'Estou aqui para organizar sua vida! Conte-me sobre suas tarefas ou gastos.',
          'Minha especialidade é organização. Diga-me o que quer registrar e eu cuido do resto! 💼',
          'Funcionamento simples: me fale suas tarefas ou despesas e eu organizo tudo para você.',
          'Precisa de ajuda? É só falar sobre o que quer anotar - tarefas, gastos, lembretes...'
        ],
        compliment: [
          'Que bom que gostou! Fico feliz em ajudar. 😊',
          'Obrigado pelo carinho! Sempre dando meu melhor para você.',
          'Que legal! Adoro quando consigo ser útil. 🙂',
          'Fico muito feliz com seu feedback! Vamos continuar organizando tudo.',
          'Valeu! É motivador saber que estou no caminho certo. 💪'
        ],
        farewell: [
          'Tchau! Volte sempre que precisar. 👋',
          'Até mais! Estarei aqui quando precisar de mim.',
          'Falou! Foi um prazer ajudar. Até a próxima! 😊',
          'Tchau tchau! Sua organização está em boas mãos.',
          'Até logo! Qualquer coisa, é só chamar. 🙂'
        ],
        joke: [
          'Haha! Adoro um bom humor. Mas vamos focar na organização? 😄',
          'Rindo aqui! Que tal registrarmos algumas tarefas agora? 😊',
          'Você é engraçado! Vamos colocar essa energia na produtividade?',
          'Hahaha! Gosto do seu astral. Bora organizar as coisas? 🎯',
          'Rsrs! Diversão é importante, mas organização também. Vamos nessa! 😄'
        ],
        unknown: [
          'Não consegui entender completamente. Você quer registrar uma tarefa ou despesa? 🤔',
          'Hmm, não identifiquei se é uma tarefa ou gasto. Pode reformular?',
          'Não ficou muito claro para mim. Que tipo de registro você quer fazer?',
          'Desculpa, não entendi direito. Pode explicar melhor o que precisa anotar?',
          'Me ajuda aqui? Não consegui identificar se é tarefa, despesa ou outra coisa.',
          'Poxa, não captei. Tenta me explicar de outro jeito? 😅'
        ]
      };

      const responseArray = responses[intent as keyof typeof responses] || responses.unknown;
      const finalText = responseArray[Math.floor(Math.random() * responseArray.length)];

      // Efeito de digitação mais realista
      let index = 0;
      setTypingText('');
      const typingSpeed = Math.random() * 30 + 25; // Velocidade variável entre 25-55ms

      const interval = setInterval(() => {
        setTypingText((prev) => {
          const next = finalText.slice(0, index + 1);
          index++;
          if (index === finalText.length) {
            clearInterval(interval);
            // Pequena pausa antes de finalizar
            setTimeout(() => {
              const systemReply: ChatMessage = { role: 'ai', text: finalText };
              const finalMessages = [...updatedMessages, systemReply];
              saveMessages(finalMessages);
              setIsTyping(false);
              setTypingText('');
            }, 200);
          }
          return next;
        });
      }, typingSpeed);
    }, thinkingTime);
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

      <View className="px-4 mb-4 mt-3">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('RoutineScreen')}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-5 py-2"
          >
            <Feather name="calendar" size={15} color="white" />
            <Text className="text-white font-sans font-medium text-[13.5px]">Rotina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-5 py-2"
          >
            <Feather name="settings" size={15} color="white" />
            <Text className="text-white font-sans font-medium text-[13px]">Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="flex-row items-center gap-2 bg-zinc-700 rounded-xl px-5 py-2"
          >
            <Ionicons name="options-outline" size={17} color="white" />
            <Text className="text-white font-sans font-medium text-[13px]">Opções</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between">
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
                      <Text className="text-white text-[15px] font-sans max-w-[280px]">{item.text}</Text>
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
                  className="w-[30px] h-[30px] rounded-full mr-4 pl-1 mt-2 bg-rose-400 justify-center items-center"
                  onPress={handleInputSubmit}
                >
                  <Ionicons name="send" size={16} color="black" />
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