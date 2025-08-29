import { useState, useRef } from 'react';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import { useMessageParser } from './useMessageParser';

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

const STORAGE_KEY = '@chat_messages';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  
  const { userId } = useAuth();
  const { processMessage } = useMessageParser(userId);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

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

  const loadMessages = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  };

  const handleInputSubmit = async (input: string, setInput: (value: string) => void) => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const updatedMessages = [...messages, userMessage];

    if (isTyping) {
      return;
    }

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

        intent = await processMessage(input);
    }

    // delay realista para simular processamento
    const thinkingTime = Math.random() * 1500 + 800; 

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

      let index = 0;
      setTypingText('');
      const typingSpeed = Math.random() * 30 + 25; 

      const interval = setInterval(() => {
        setTypingText((prev) => {
          const next = finalText.slice(0, index + 1);
          index++;
          if (index === finalText.length) {
            clearInterval(interval);
            // pausa antes de finalizar
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

  return {
    messages,
    isTyping,
    typingText,
    flatListRef,
    handleInputSubmit,
    clearMessages,
    loadMessages
  };
};