import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Easing,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from 'widgets/types';

type InfoScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'InfoScreen'>;

// Modal drawer for changing the user's name
const ChangeNameModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
}> = ({ visible, onClose, onSave }) => {
  const slideY = useRef(new Animated.Value(300)).current;
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.timing(slideY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(300);
      setName('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome válido.');
      return;
    }
    onSave(name.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1 justify-end" />
          </TouchableWithoutFeedback>
          <Animated.View
            style={{ transform: [{ translateY: slideY }] }}
            className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[60%]"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-sans text-[20px] font-bold">Alterar Nome</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-gray-300 font-sans mb-4">
                Atualize o nome que será exibido em seu perfil. Escolha um nome que seus contatos reconheçam facilmente.
              </Text>
              <TextInput
                className="bg-zinc-800 text-white rounded-xl px-4 py-4 font-sans text-base mb-6"
                placeholder="Digite novo nome"
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={setName}
              />
            </ScrollView>
            {/* Footer */}
            <TouchableOpacity
              onPress={handleSave}
              className="w-full bg-[#ff7a7f] py-3 rounded-2xl items-center mb-4"
            >
              <Text className="text-white font-sans font-bold text-base">Salvar</Text>
            </TouchableOpacity>
          </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Modal drawer for changing the user's PIN
const ChangePinModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (pin: string) => void;
}> = ({ visible, onClose, onSave }) => {
  const slideY = useRef(new Animated.Value(300)).current;
  const [digits, setDigits] = useState(['', '', '', '']);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(300);
      setDigits(['', '', '', '', '', '']);
    }
  }, [visible]);

  const handleChange = (text: string, idx: number) => {
    const arr = [...digits];
    arr[idx] = text;
    setDigits(arr);
  };

  const handleSave = () => {
    if (digits.some(d => d === '')) {
      Alert.alert('Erro', 'Preencha os 6 dígitos do PIN.');
      return;
    }
    onSave(digits.join(''));
    onClose();
  };

  return (

    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
            <TouchableWithoutFeedback onPress={onClose}>
              <View className="flex-1 justify-end" />
            </TouchableWithoutFeedback>
            <Animated.View
              style={{ transform: [{ translateY: slideY }] }}
              className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[60%]"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-sans text-[20px] font-bold">Alterar PIN</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {/* Body */}
              <ScrollView>
                <Text className="text-gray-300 font-sans mb-4">
                  Insira seu PIN atual e defina um novo código de 6 dígitos para proteger sua conta.
                </Text>
                <View className="flex-row justify-center space-x-4 mb-6">
                  {digits.map((d, idx) => (
                    <TextInput
                      key={idx}
                      className="w-12 h-12 bg-zinc-800 text-white rounded-lg text-center font-sans text-xl"
                      keyboardType="numeric"
                      maxLength={1}
                      placeholder="•"
                      placeholderTextColor="#555"
                      value={d}
                      onChangeText={text => handleChange(text, idx)}
                    />
                  ))}
                </View>
              </ScrollView>
              {/* Footer */}
              <TouchableOpacity
                onPress={handleSave}
                className="w-full bg-[#ff7a7f] py-3 rounded-2xl items-center mb-4"
              >
                <Text className="text-white font-sans font-bold text-base">Salvar</Text>
              </TouchableOpacity>
            </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Full InfoScreen component
export default function InfoScreen() {
  const navigation = useNavigation<InfoScreenNavProp>();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleSaveName = (newName: string) => {
    console.log('Novo nome:', newName);
    // TODO: API call to save name
  };

  const handleSavePin = (newPin: string) => {
    console.log('Novo PIN:', newPin);
    // TODO: API call to save PIN
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* Header */}
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white font-sans text-[18px]">Informações</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Options List */}
      <ScrollView className="mt-8 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity
          className="flex-row items-center py-7 border-b border-zinc-700"
          onPress={() => setShowNameModal(true)}
        >
          <Ionicons name="person-outline" size={20} color="white" />
          <Text className="ml-3 text-white font-sans text-[16px]">Alterar Nome de Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-7 border-b border-zinc-700"
          onPress={() => setShowPinModal(true)}
        >
          <Ionicons name="key-outline" size={20} color="white" />
          <Text className="ml-3 text-white font-sans text-[16px]">Alterar PIN</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}

          <ChangeNameModal
            visible={showNameModal}
            onClose={() => setShowNameModal(false)}
            onSave={handleSaveName}
          />

      <ChangePinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSave={handleSavePin}
      />
    </SafeAreaView>
  );
}
