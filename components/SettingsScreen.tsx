import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'hooks/useAuth';
import { RootStackParamList } from 'widgets/types';

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
      <Text className="text-white text-[16px]">{label}</Text>
    </View>
    <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  // Substitua este valor pelo nome real vindo do contexto ou props
  const userName = 'Usuário';

  const confirmClearTrainings = () => {
    Alert.alert(
      'Tem certeza?',
      'Isso irá remover todos os dados de treinos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: () => console.log('Treinos limpos') },
      ]
    );
  };

  const confirmClearTasks = () => {
    Alert.alert(
      'Tem certeza?',
      'Isso irá remover todos os dados de tarefas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: () => console.log('Tasks limpas') },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      'Tem certeza?',
      'Você deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Welcome');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <View className="mt-[20px] flex flex-row items-center px-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-medium text-[16px] ml-1">Voltar</Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center gap-3 mt-10 px-6">
        <View className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800">
          <Text className="text-lg font-semibold text-white">
            {userName.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <Text className="text-white text-xl font-semibold">{userName}</Text>
      </View>

      <ScrollView className="flex-1 mt-10 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-zinc-400 uppercase text-xs mb-2">Conta</Text>
        <SettingsItem
          icon="person-outline"
          label="Informações"
          onPress={() => Alert.alert('Em breve', 'Função de editar informações ainda não implementada')}
        />
        <SettingsItem
          icon="notifications-outline"
          label="Notificações"
          onPress={() => Alert.alert('Configurações', 'Gerencie suas notificações')}
        />
        <SettingsItem
          icon="lock-closed-outline"
          label="Privacidade"
          onPress={() => Alert.alert('Configurações', 'Gerencie sua privacidade')}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Dados</Text>
        <SettingsItem
          icon="barbell-outline"
          label="Dados de Treinos"
          onPress={confirmClearTrainings}
        />
        <SettingsItem
          icon="checkmark-done-outline"
          label="Dados de Tarefas"
          onPress={confirmClearTasks}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Suporte</Text>
        <SettingsItem
          icon="help-circle-outline"
          label="Ajuda"
          onPress={() => Alert.alert('Ajuda', 'Entre em contato com o suporte')}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Conta</Text>
        <SettingsItem
          icon="log-out-outline"
          color="#ef4444"
          label="Sair"
          onPress={confirmLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
