import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from 'hooks/useAuth';
import { useTask } from 'hooks/useTask';
import { useWorkout } from 'hooks/useWorkout';
import { RootStackParamList } from 'widgets/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  label: string;
  onPress: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
};

const SettingsItem: React.FC<SettingsItemProps> = ({
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

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  destructive?: boolean;
};

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  icon,
  iconColor = '#ff7a7f',
  destructive = false,
}) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#27272a',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 40,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View className="w-12 h-1 bg-zinc-600 rounded-full self-center mb-8" />
            
            <View className={`w-16 h-16 rounded-full items-center justify-center self-center mb-6 ${destructive ? 'bg-rose-500/20' : 'bg-zinc-700'}`}>
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>

            <Text className="text-white text-xl font-sans text-center mb-3 font-medium">
              {title}
            </Text>

            <Text className="text-zinc-400 text-base font-sans text-center mb-8 leading-6 px-2">
              {description}
            </Text>

            <View className="gap-3">
              <Pressable
                className={`py-4 rounded-xl ${destructive ? 'bg-rose-500/20' : 'bg-rose-400'}`}
                onPress={onConfirm}
              >
                <Text className={`text-center text-base font-sans font-semibold ${destructive ? 'text-rose-400' : 'text-black'}`}>
                  {confirmText}
                </Text>
              </Pressable>

              <Pressable
                className="py-4 rounded-xl bg-zinc-700"
                onPress={handleClose}
              >
                <Text className="text-white text-center text-base font-sans">
                  {cancelText}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, userId, userName } = useAuth();
  const { clearTasksByUser } = useTask();
  const { clearWorkoutsByUser } = useWorkout();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    description: '',
    confirmText: '',
    cancelText: 'Cancelar',
    icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ff7a7f',
    destructive: false,
    onConfirm: () => {},
  });

  const showModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig(prev => ({ ...prev, ...config }));
    setModalVisible(true);
  };

  const confirmClearTrainings = () => {
    showModal({
      title: 'Remover Treinos',
      description: 'Tem certeza que deseja remover todos os dados de treinos? Esta ação não pode ser desfeita.',
      confirmText: 'Remover Treinos',
      icon: 'barbell-outline',
      iconColor: '#ff7a7f',
      destructive: true,
      onConfirm: () => {
        setModalVisible(false);
        Alert.alert(
          'Você tem certeza?',
          'Esta é sua última chance! Todos os treinos serão permanentemente removidos. Deseja continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Remover Definitivamente',
              style: 'destructive',
              onPress: async () => {
                try {
                  await clearWorkoutsByUser(userId!);
                  Alert.alert('Sucesso', 'Todos os treinos foram removidos com sucesso.');
                } catch (error) {
                  console.error('Erro ao limpar treinos:', error);
                  Alert.alert('Erro', 'Não foi possível remover os treinos.');
                }
              },
            },
          ]
        );
      },
    });
  };

  const confirmClearTasks = () => {
    showModal({
      title: 'Remover Tarefas',
      description: 'Tem certeza que deseja remover todos os dados de tarefas? Esta ação não pode ser desfeita.',
      confirmText: 'Remover Tarefas',
      icon: 'checkmark-done-outline',
      iconColor: '#ff7a7f',
      destructive: true,
      onConfirm: () => {
        setModalVisible(false);
        Alert.alert(
          'Você tem certeza?',
          'Esta é sua última chance! Todas as tarefas serão permanentemente removidas. Deseja continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Remover Definitivamente',
              style: 'destructive',
              onPress: async () => {
                try {
                  await clearTasksByUser(userId!);
                  Alert.alert('Sucesso', 'Todas as tarefas foram removidas com sucesso.');
                } catch (error) {
                  console.error('Erro ao limpar tarefas:', error);
                  Alert.alert('Erro', 'Não foi possível remover as tarefas.');
                }
              },
            },
          ]
        );
      },
    });
  };

  const confirmLogout = () => {
    showModal({
      title: 'Restaurar Conta',
      description: 'Ao restaurar sua conta, todos os dados locais serão perdidos e você será desconectado.',
      confirmText: 'Restaurar Conta',
      icon: 'refresh-outline',
      iconColor: '#ff7a7f',
      destructive: true,
      onConfirm: () => {
        setModalVisible(false);
        Alert.alert(
          'Você tem certeza?',
          'Você tem certeza absoluta que deseja restaurar sua conta? Todos os dados locais serão perdidos para sempre!',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Restaurar Definitivamente',
              style: 'destructive',
              onPress: async () => {
                try {
                  await logout();
                  navigation.navigate('WelcomeScreen');
                } catch (error) {
                  console.error('Erro ao fazer logout:', error);
                  Alert.alert('Erro', 'Não foi possível restaurar a conta.');
                }
              },
            },
          ]
        );
      },
    });
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
      {/* Header */}
      <View className="mt-5 px-4 mb-8 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[16px]">Configurações</Text>
        </View>
      </View>

      {/* User Profile Card */}
      <View className="px-4 pb-5">
        <View className="flex-row items-center justify-between px-4 py-4 rounded-2xl bg-[#35353a]">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 flex items-center justify-center rounded-full bg-rose-400">
              <Text className="text-lg font-sans text-black font-semibold">{initials}</Text>
            </View>
            <View className="flex-col">
              <Text className="text-zinc-400 font-sans text-xs mb-1">Usuário ativo</Text>
              <Text className="text-white text-lg font-sans font-medium">{userName}</Text>
            </View>
          </View>
          <View className="p-2 rounded-xl bg-zinc-700">
            <Ionicons name="person-outline" size={18} color="#a1a1aa" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionHeader title="Conta" />
        <SettingsItem
          icon="person-outline"
          label="Informações Pessoais"
          onPress={() => navigation.navigate('InfoScreen')}
        />
        <SettingsItem
          icon="card-outline"
          label="Plano & Assinatura"
          onPress={() => Alert.alert('Configurações', 'Gerencie sua assinatura')}
        />

        <SectionHeader title="Dados" />
        <SettingsItem
          icon="barbell-outline"
          color="#ff7a7f"
          label="Remover dados de Treinos"
          onPress={confirmClearTrainings}
          destructive={true}
        />
        <SettingsItem
          icon="checkmark-done-outline"
          color="#ff7a7f"
          label="Remover dados de Tarefas"
          onPress={confirmClearTasks}
          destructive={true}
        />

        <SectionHeader title="Suporte" />
        <SettingsItem
          icon="help-circle-outline"
          label="Ajuda & Suporte"
          onPress={() => navigation.navigate('HelpScreen')}
        />
        <SettingsItem
          icon="document-text-outline"
          label="Termos de Uso"
          onPress={() => Alert.alert('Termos', 'Visualizar termos de uso')}
        />
        <SettingsItem
          icon="shield-checkmark-outline"
          label="Política de Privacidade"
          onPress={() => Alert.alert('Privacidade', 'Visualizar política de privacidade')}
        />

        <SectionHeader title="Conta" />
        <SettingsItem
          icon="refresh-outline"
          color="#ff7a7f"
          label="Restaurar Conta"
          onPress={confirmLogout}
          destructive={true}
        />
      </ScrollView>

      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
        destructive={modalConfig.destructive}
      />
    </SafeAreaView>
  );
}