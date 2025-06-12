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
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "../widgets/types";
import { useState } from 'react';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          className="bg-transparent h-[30px] w-[30px] absolute top-5 right-5 justify-center items-center z-10"
          onPress={() => navigation.navigate('SettingsScreen')}
        >
          <Ionicons name="cog" size={30} color="#ff7a7f" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-transparent h-[30px] w-[30px] absolute top-5 right-[15%] justify-center items-center z-10"
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="notifications-circle-outline" size={30} color="#ff7a7f" />
        </TouchableOpacity>

        <View className="absolute top-[-3%] left-[2%] z-10">
          <Image
            source={require('../assets/dayo.png')}
            className="w-[120px] h-[120px]"
            resizeMode="contain"
          />
        </View>


        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end">
            <View
              className="w-full rounded-t-[30px] pt-8 pl-6 pb-6"
              style={{ backgroundColor: '#1e1e1e' }}
            >
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
                  onPress={() => {
                    console.log('Enviar:', input);
                    setInput('');
                  }}
                >
                  <Ionicons name="caret-forward" size={18} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal de Configurações */}
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
                      {size === 'small'
                        ? 'Pequena'
                        : size === 'medium'
                        ? 'Média'
                        : 'Grande'}
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
                    style={{
                      backgroundColor: color,
                      borderColor: input ? undefined : '#fff',
                    }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-rose-500 py-3 rounded-xl items-center mb-4"
            onPress={() => {
              // Salvar configurações: aplicar tema, notificações etc.
              setSettingsVisible(false);
            }}
          >
            <Text className="text-white text-lg font-semibold">Salvar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
