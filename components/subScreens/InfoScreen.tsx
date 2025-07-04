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
import { useAuth } from '../../hooks/useAuth';

type InfoScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'InfoScreen'>;


interface ChangeNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName?: string;
}

export const ChangeNameModal: React.FC<ChangeNameModalProps> = ({
  visible,
  onClose,
  onSave,
  currentName,
}) => {
  const slideY = useRef(new Animated.Value(300)).current;
  const [name, setName] = useState('');

  // animate in on visible
  useEffect(() => {
    if (visible) {
      setName(currentName || '');
      slideY.setValue(300);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, currentName, slideY]);

  // animate out then close
  const handleClose = () => {
    Animated.timing(slideY, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // reset name
        setName('');
        onClose();
      }
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome válido.');
      return;
    }
    onSave(name.trim());
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            transform: [{ translateY: slideY }],
          }}
          className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[60%]"
        >
          {/* header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-sans text-[20px] font-bold">
              Alterar Nome
            </Text>
            <TouchableOpacity onPress={handleClose}>
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

          <TouchableOpacity
            onPress={handleSave}
            className="w-full bg-[#ff7a7f] py-3 rounded-2xl items-center mb-4"
          >
            <Text className="text-white font-sans font-bold text-base">
              Salvar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ChangePinModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (pin: string) => void;
}> = ({ visible, onClose, onSave }) => {
  const slideY = useRef(new Animated.Value(300)).current;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

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
    if (!/^\d?$/.test(text)) return;
    const arr = [...digits];
    arr[idx] = text;
    setDigits(arr);
    if (text !== '' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    } else if (text === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && digits[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const animateClose = (callback?: () => void) => {
    Animated.timing(slideY, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && callback) callback();
    });
  };

  const handleClose = () => {
    animateClose(onClose);
  };

  const handleSave = () => {
    if (digits.some(d => d === '')) {
      Alert.alert('Erro', 'Preencha os 6 dígitos do PIN.');
      return;
    }
    animateClose(() => {
      onSave(digits.join(''));
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 justify-end" />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{ transform: [{ translateY: slideY }] }}
          className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[60%]"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-sans text-[20px] font-bold">Alterar PIN</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-gray-300 font-sans mb-4">
              Defina um novo código de 6 dígitos para proteger sua conta.
            </Text>
            <View className="flex-row justify-center gap-2 mb-6">
              {digits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={ref => {
                    inputRefs.current[idx] = ref;
                  }}
                  className="w-12 h-[50px] bg-zinc-800 text-white rounded-lg text-center font-sans text-xl"
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  returnKeyType="done"
                />
              ))}
            </View>
          </ScrollView>

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

export default function InfoScreen() {
  const navigation = useNavigation<InfoScreenNavProp>();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const { changeName, changePin, userName, loading, removePin } = useAuth();

  const handleSaveName = async (newName: string) => {
    try {
      await changeName(newName);
      Alert.alert('Sucesso', 'Nome alterado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao alterar nome');
    }
  };

  const handleSavePin = async (newPin: string) => {
    try {
      await changePin(newPin);
      Alert.alert('Sucesso', 'PIN alterado com sucesso!');
    } catch (error: any) {
      console.log(error);
    }
  };

  const confirmRemovePin = () => {
    Alert.alert(
      'Remover PIN',
      'Tem certeza que deseja remover o PIN?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePin();
              Alert.alert('Sucesso', 'PIN removido com sucesso!');
            } catch {
              Alert.alert('Erro', 'Não foi possível remover o PIN.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white absolute left-[43%] font-sans text-[15px]">Informações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="mt-8 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity
          className="flex-row items-center py-7 border-b border-zinc-700"
          onPress={() => setShowNameModal(true)}
          disabled={loading}
        >
          <Ionicons name="person-outline" size={20} color="white" />
          <View className="ml-3 flex-1">
            <Text className="text-white font-sans text-[16px]">Alterar Nome de Usuário</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-7 border-b border-zinc-700"
          onPress={() => setShowPinModal(true)}
          disabled={loading}
        >
          <Ionicons name="key-outline" size={20} color="white" />
          <Text className="ml-3 text-white font-sans text-[16px]">Alterar PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-7 border-b border-zinc-700"
          onPress={confirmRemovePin}
          disabled={loading}
        >
          <Ionicons name="lock-open-outline" size={20} color="white" />
          <Text className="ml-3 text-white font-sans text-[16px]">Remover PIN</Text>
        </TouchableOpacity>
      </ScrollView>

      <ChangeNameModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSave={handleSaveName}
        currentName={userName || ''}
      />

      <ChangePinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSave={handleSavePin}
      />
    </SafeAreaView>
  );
}
