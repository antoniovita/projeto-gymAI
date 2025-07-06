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
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  color = 'white',
  label,
  onPress,
  rightIcon = 'chevron-forward',
}) => (
  <TouchableOpacity
    className="flex flex-row items-center justify-between py-7 border-b border-zinc-700"
    onPress={onPress}
  >
    <View className="flex flex-row items-center gap-3">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-white text-[16px] font-sans">{label}</Text>
    </View>
    <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
  </TouchableOpacity>
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                backgroundColor: '#18181b',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 40,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View className="w-12 h-1 bg-zinc-600 rounded-full self-center mb-6" />
            
            <View className="w-16 h-16 rounded-full items-center justify-center self-center mb-6">
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>

            <Text className="text-white text-xl font-sans text-center mb-3">
              {title}
            </Text>

            <Text className="text-zinc-400 text-base font-sans text-center mb-8 leading-6">
              {description}
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                className={`py-4`}
                onPress={onConfirm}
              >
                <Text className={`text-center text-base font-sans font-semibold ${destructive ? 'text-rose-400' : 'text-black'}`}>
                  {confirmText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-4 rounded-xl bg-zinc-800"
                onPress={handleClose}
              >
                <Text className="text-white text-center text-base font-sans">
                  {cancelText}
                </Text>
              </TouchableOpacity>
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
    <SafeAreaView className="flex-1 bg-zinc-900">
      <View className="mt-[20px] flex flex-row items-center px-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-sans text-[16px] ml-1">Voltar</Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center gap-3 mt-10 px-6">
        <View className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800">
          <Text className="text-lg font-sans text-white">{initials}</Text>
        </View>
        <Text className="text-white text-xl font-sans">{userName}</Text>
      </View>

      <ScrollView className="flex-1 mt-10 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-zinc-400 uppercase font-sans text-xs mb-2">Conta</Text>
        <SettingsItem
          icon="person-outline"
          label="Informações"
          onPress={() => navigation.navigate('InfoScreen')}
        />
        <SettingsItem
          icon="card-outline"
          label="Assinatura"
          onPress={() => Alert.alert('Configurações', 'Gerencie sua privacidade')}
        />

        <Text className="text-zinc-400 font-sans uppercase text-xs mt-6 mb-2">Dados</Text>
        <SettingsItem
          icon="barbell-outline"
          label="Remover dados de Treinos"
          onPress={confirmClearTrainings}
        />
        <SettingsItem
          icon="checkmark-done-outline"
          label="Remover dados de Tarefas"
          onPress={confirmClearTasks}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Suporte</Text>
        <SettingsItem
          icon="help-circle-outline"
          label="Ajuda & Suporte"
          onPress={() => navigation.navigate('HelpScreen')}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Conta</Text>
        <SettingsItem
          icon="refresh-outline"
          color="#ff7a7f"
          label="Restaurar"
          onPress={confirmLogout}
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