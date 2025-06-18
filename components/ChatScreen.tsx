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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import { useEffect, useState } from 'react';
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

  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useAuth();
  const { processMessage } = useMessageParser(userId);

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
  };

  const clearMessages = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  const handleInputSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    await saveMessages(updatedMessages);

    const intent = await processMessage(input);

    const systemReply: ChatMessage = {
      role: 'ai',
      text:
        intent === 'expense'
          ? 'Despesa registrada com sucesso!'
          : intent === 'task'
          ? 'Tarefa registrada com sucesso!'
          : 'Não entendi sua mensagem.',
    };

    const finalMessages = [...updatedMessages, systemReply];
    await saveMessages(finalMessages);
    setInput('');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">

          <View className="absolute self-center top-[6%]">
            <Image
              source={require('../assets/dayo.png')}
              className="w-[130px] h-[130px]"
              resizeMode="contain"
            />
          </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableOpacity
          className="absolute top-[6%] right-5 z-10 h-[30px] w-[30px] justify-center items-center"
          onPress={() => navigation.navigate('SettingsScreen')}
        >
           <Feather name="settings" size={22} color="#ff7a7f" />
        </TouchableOpacity>

        <TouchableOpacity
          className="absolute top-[6%] right-[15%] z-10 h-[30px] w-[30px] justify-center items-center"
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#ff7a7f" />
        </TouchableOpacity>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between mt-[100px]">
            <FlatList
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View className={`mb-6 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <View
                    className={`rounded-2xl px-4 py-2 ${
                      item.role === 'user' ? 'bg-rose-500' : 'bg-zinc-700'
                    }`}
                  >
                    <Text className="text-white text-lg font-sans ">{item.text}</Text>
                  </View>
                </View>
              )}
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
            {/* Dark Mode */}
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

            {/* Tamanho da Fonte */}
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

            {/* Cores de Tema */}
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

            {/* Limpar mensagens */}
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
