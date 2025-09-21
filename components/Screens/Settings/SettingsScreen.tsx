import React, { useState, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from 'hooks/useAuth';
import { useTask } from 'hooks/useTask';
import { useWorkout } from 'hooks/useWorkout';
import { RootStackParamList } from 'tabs/types';
import GradientIcon from '../../generalComps/GradientIcon';
import { useChat } from 'components/Screens/Chat/chatHelpers';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onPress,
  rightIcon = 'chevron-forward',
}) => (
  <Pressable
    className="flex flex-row items-center justify-between px-6 h-[70px] border-b border-neutral-700 bg-zinc-800"
    onPress={onPress}
  >
    <View className="flex flex-row items-center gap-3">
      <View className={`w-8 h-8 rounded-lg items-center justify-center bg-orange-500/20`}>
        <GradientIcon name={icon} size={18}/>
      </View>
      <Text className="text-[16px] font-sans text-gray-300">
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
};

const BottomSheetModal = React.forwardRef<{ handleClose: () => void }, BottomSheetModalProps>(
  ({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    icon,
    iconColor = '#ff7a7f',
  }, ref) => {
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    };

    React.useImperativeHandle(ref, () => ({
      handleClose,
    }));

    React.useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
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
            duration: 400,
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
              
              <View className="w-16 h-16 rounded-full items-center justify-center self-center mb-6 bg-rose-500/20">
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
                  className="py-4 rounded-xl bg-rose-500/20"
                  onPress={onConfirm}
                >
                  <Text className="text-center text-base font-sans font-semibold text-rose-400">
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
  }
);

export default function SettingsScreen() {

  const { clearMessages } = useChat()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, userId, userName } = useAuth();
  const { clearTasksByUser } = useTask();
  const { clearWorkoutsByUser } = useWorkout();

  const [modalVisible, setModalVisible] = useState(false);
  const modalRef = useRef<{ handleClose: () => void }>(null);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    description: '',
    confirmText: '',
    cancelText: 'Cancelar',
    icon: 'warning' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ff7a7f',
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
      icon: 'barbell',
      iconColor: '#ff7a7f',
      onConfirm: () => {
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
                  modalRef.current?.handleClose();
                  Alert.alert('Sucesso', 'Todos os treinos foram removidos com sucesso.');
                } catch (error) {
                  console.error('Erro ao limpar treinos:', error);
                  modalRef.current?.handleClose();
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
      icon: 'checkmark-done',
      iconColor: '#ff7a7f',
      onConfirm: () => {
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
                  modalRef.current?.handleClose();
                  Alert.alert('Sucesso', 'Todas as tarefas foram removidas com sucesso.');
                } catch (error) {
                  console.error('Erro ao limpar tarefas:', error);
                  modalRef.current?.handleClose();
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
      icon: 'refresh',
      iconColor: '#ff7a7f',
      onConfirm: () => {
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
                  modalRef.current?.handleClose();
                  navigation.navigate('WelcomeScreen');
                } catch (error) {
                  console.error('Erro ao fazer logout:', error);
                  modalRef.current?.handleClose();
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
          <Text className="ml-1 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[16px]">Configurações</Text>
        </View>
      </View>

      {/* User Profile Card */}
      <View className="px-4 pb-5">
        <View className="flex-row items-center justify-between px-4 py-4 rounded-2xl bg-[#35353a]">
          <View className="flex-row items-center gap-4">
            <LinearGradient
              colors={['#FFD45A', '#FFA928', '#FF7A00']}
              style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "100%"}}
            >
              <Text className="text-xl font-sans text-black font-semibold">{initials}</Text>
            </LinearGradient>
            <View className="flex-col">
              <Text className="text-zinc-400 font-sans text-xs mb-1">Usuário ativo</Text>
              <Text className="text-white text-lg font-sans font-medium">{userName}</Text>
            </View>
          </View>
          <View className="p-2 rounded-xl bg-zinc-700">
            <Ionicons name="person" size={18} color="#a1a1aa" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionHeader title="Conta" />
        <SettingsItem
          icon="person"
          label="Informações Pessoais"
          onPress={() => navigation.navigate('InfoScreen')}
        />
        <SettingsItem
          icon="card"
          label="Plano & Assinatura"
          onPress={() => Alert.alert('Configurações', 'Gerencie sua assinatura')}
        />

        <SectionHeader title="Dados" />
        <SettingsItem
          icon="barbell"
          label="Remover dados de Academia"
          onPress={confirmClearTrainings}
        />

        <SettingsItem
          icon="calendar"
          label="Remover dados de Tarefas"
          onPress={confirmClearTasks}
        />

        <SettingsItem
          icon="wallet"
          label="Remover dados das Despesas"
          onPress={() => console.log("oi")}
        />

        <SettingsItem
          icon="chatbubble-ellipses"
          label="Remover dados de Conversas"
          onPress={clearMessages}
        />

        <SectionHeader title="Suporte" />
        <SettingsItem
          icon="help-circle"
          label="Ajuda & Suporte"
          onPress={() => navigation.navigate('HelpScreen')}
        />
        <SettingsItem
          icon="document-text"
          label="Termos de Uso"
          onPress={() => Alert.alert('Termos', 'Visualizar termos de uso')}
        />
        <SettingsItem
          icon="shield-checkmark"
          label="Política de Privacidade"
          onPress={() => Alert.alert('Privacidade', 'Visualizar política de privacidade')}
        />

        <SectionHeader title="Conta" />
        <SettingsItem
          icon="refresh"
          label="Restaurar Conta"
          onPress={confirmLogout}
        />
      </ScrollView>

      <BottomSheetModal
        ref={modalRef}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </SafeAreaView>
  );
}