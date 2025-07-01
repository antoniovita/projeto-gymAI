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
  Alert,
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
  notificationsEnabled,
  setNotificationsEnabled,
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

                

                {/* Histórico */}
                <View className="py-3">
                  <Text className="text-gray-300 text-lg mb-2 font-sans">Histórico</Text>
                <TouchableOpacity
                style={{ backgroundColor: '#262626' }}
                onPress={() => {
                    Alert.alert(
                    'Limpar Conversa',
                    'Tem certeza que deseja apagar todas as mensagens?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                        text: 'Apagar',
                        style: 'destructive',
                        onPress: clearMessages,
                        },
                    ],
                    { cancelable: true }
                    );
                }}
                className="bg-zinc-600 py-3 px-4 rounded-xl items-center"
                >
                <Text className="text-rose-400 font-sans font-medium text-base">Apagar Conversa</Text>
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
