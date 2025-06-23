import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Switch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  clearMessages: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  darkMode,
  setDarkMode,
  notificationsEnabled,
  setNotificationsEnabled,
  fontSize,
  setFontSize,
  clearMessages,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/70 justify-end">
          <TouchableWithoutFeedback>
            <Animated.View
              style={{ transform: [{ translateY: slideAnim }] }}
              className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[80%]"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-2xl font-bold font-sans">Configurações</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView className="mb-4">
                {/* Modo Escuro */}
                <View className="flex-row justify-between items-center py-3 border-b border-zinc-700">
                  <Text className="text-gray-300 text-lg font-sans">Modo Escuro</Text>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#767577', true: '#f43f5e' }}
                    thumbColor={darkMode ? '#ff7a7f' : '#f4f3f4'}
                  />
                </View>

                {/* Notificações */}
                <View className="flex-row justify-between items-center py-3 border-b border-zinc-700">
                  <Text className="text-gray-300 text-lg font-sans">Notificações</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#767577', true: '#f43f5e' }}
                    thumbColor={notificationsEnabled ? '#ff7a7f' : '#f4f3f4'}
                  />
                </View>

                {/* Fonte */}
                <View className="py-3 border-b border-zinc-700">
                  <Text className="text-gray-300 text-lg mb-2 font-sans">Tamanho da Fonte</Text>
                  <View className="flex-row items-center justify-between">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setFontSize(size)}
                        className={`px-4 py-1 rounded-full border-2 ${
                          fontSize === size ? 'border-rose-400' : 'border-zinc-700'
                        }`}
                      >
                        <Text
                          className={`text-white font-sans ${
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
                  <Text className="text-gray-300 text-lg mb-2 font-sans">Tema</Text>
                  <View className="flex-row gap-3">
                    {['#ff7a7f', '#22d3ee', '#f59e0b', '#a3e635'].map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => console.log('Tema alterado para', color)}
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: color, borderColor: '#fff' }}
                      />
                    ))}
                  </View>
                </View>

                {/* Histórico */}
                <View className="py-3">
                  <Text className="text-gray-300 text-lg mb-2 font-sans">Histórico</Text>
                  <TouchableOpacity
                    onPress={clearMessages}
                    className="bg-rose-600 py-2 px-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-sans">Limpar Conversa</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="bg-rose-500 py-3 rounded-xl items-center mb-4"
                onPress={onClose}
              >
                <Text className="text-white text-lg font-semibold font-sans">Salvar</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
