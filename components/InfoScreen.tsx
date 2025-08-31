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
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from 'widgets/types';
import { useAuth } from '../hooks/useAuth';

type InfoScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'InfoScreen'>;

type InfoItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  label: string;
  onPress: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  color = 'white',
  label,
  onPress,
  rightIcon = 'chevron-forward',
  destructive = false,
}) => (
  <Pressable
    className="flex flex-row items-center justify-between px-6 h-[70px] border-b border-neutral-700 bg-zinc-800"
    onPress={onPress}
  >
    <View className="flex flex-row items-center gap-3">
      <View className={`w-8 h-8 rounded-lg items-center justify-center ${destructive ? 'bg-rose-500/20' : 'bg-zinc-700'}`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className={`text-[16px] font-sans ${destructive ? 'text-rose-400' : 'text-gray-300'}`}>
        {label}
      </Text>
    </View>
    <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
  </Pressable>
);

type SectionHeaderProps = {
  title: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View className="px-4 pt-6">
    <Text className="text-neutral-400 font-sans uppercase text-sm tracking-wide">
      {title}
    </Text>
  </View>
);

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
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            transform: [{ translateY: slideY }],
          }}
          className="bg-[#1e1e1e] rounded-t-3xl p-6 max-h-[60%]"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-sans text-[20px]">
              Alterar Nome
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-gray-300 font-sans mb-4">
              Atualize o nome que será exibido em seu perfil.
            </Text>
            <TextInput
              className="bg-zinc-800 text-white rounded-xl px-4 py-4 font-sans text-lg mb-6"
              placeholder="Digite novo nome"
              placeholderTextColor="#a1a1aa"
              value={name}
              onChangeText={setName}
            />
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className="w-full bg-[#ff7a7f] py-3 rounded-xl items-center mb-4"
          >
            <Text className="text-black font-sans text-lg">
              Salvar mudanças
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
            <Text className="text-white font-sans text-[20px]">Alterar PIN</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-gray-300 font-sans mb-4">
              Defina um novo código de 6 dígitos para proteger sua conta.
            </Text>
            <View className="flex-row justify-center gap-3 mb-6">
              {digits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={ref => {
                    inputRefs.current[idx] = ref;
                  }}
                  className="w-14 h-[65px] bg-zinc-800 text-white rounded-xl text-center font-sans text-2xl"
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
            className="w-full bg-[#ff7a7f] py-3 rounded-xl items-center mb-4"
          >
            <Text className="text-black font-sans text-lg">Salvar mudanças</Text>
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
    <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
      {/* Header */}
      <View className="mt-5 px-4 mb-2 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[16px]">Informações</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionHeader title="Perfil" />
        <InfoItem
          icon="person-outline"
          label="Alterar Nome de Usuário"
          onPress={() => setShowNameModal(true)}
        />

        <SectionHeader title="Segurança" />
        <InfoItem
          icon="key-outline"
          label="Alterar PIN"
          onPress={() => setShowPinModal(true)}
        />
        <InfoItem
          icon="lock-open-outline"
          color="#ff7a7f"
          label="Remover PIN"
          onPress={confirmRemovePin}
          destructive={true}
        />
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