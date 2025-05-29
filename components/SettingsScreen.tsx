import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

function SettingsItem({ icon, color = "white", label, onPress, rightIcon = "chevron-forward" }) {
  return (
    <TouchableOpacity
      className="flex flex-row items-center justify-between py-4 border-b border-zinc-700"
      onPress={onPress}
    >
      <View className="flex flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color={color} />
        <Text className="text-white text-[16px]">{label}</Text>
      </View>
      <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("Antônio Vita");
  const [modalVisible, setModalVisible] = useState(false);
  const [action, setAction] = useState(null);

  const handleAction = (type) => {
    setAction(type);
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (action === 'clearTrainings') {
      console.log("Treinos limpos");
    } else if (action === 'clearTasks') {
      console.log("Tasks limpas");
    } else if (action === 'logout') {
      console.log("Logout");
      navigation.navigate('Login');
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">

      {/* Header */}
      <View className="mt-3 flex flex-row items-center px-5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-medium text-[16px] ml-1">Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Perfil */}
      <View className="flex flex-row items-center gap-3 mt-10 px-6">
        <View className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800">
          <Text className="text-lg font-semibold text-white">
            {name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </Text>
        </View>
        <Text className="text-white text-xl font-semibold">{name}</Text>
      </View>

      {/* Opções */}
      <View className="mt-10 px-6">
        
        {/* Conta */}
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

        {/* Dados */}
        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Dados</Text>
        <SettingsItem
          icon="barbell-outline"
          label="Dados de Treinos"
          onPress={() => handleAction('clearTrainings')}
        />
        <SettingsItem
          icon="checkmark-done-outline"
          label="Dados de Tarefas"
          onPress={() => handleAction('clearTasks')}
        />

        {/* Ajuda */}
        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Suporte</Text>
        <SettingsItem
          icon="help-circle-outline"
          label="Ajuda"
          onPress={() => Alert.alert('Ajuda', 'Entre em contato com o suporte')}
        />

        {/* Sair */}
        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Conta</Text>
        <SettingsItem
          icon="log-out-outline"
          color="#ef4444"
          label="Sair"
          rightIcon="chevron-forward"
          onPress={() => handleAction('logout')}
        />
      </View>

      {/* Modal de Confirmação */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-zinc-800 p-6 rounded-xl w-3/4">
            <Text className="text-white text-xl font-bold mb-4">Tem certeza?</Text>
            <Text className="text-zinc-300 mb-6">
              {action === 'logout' && 'Você deseja sair da sua conta?'}
              {action === 'clearTrainings' && 'Isso irá remover todos os dados de treinos.'}
              {action === 'clearTasks' && 'Isso irá remover todos os dados de tarefas.'}
            </Text>
            <View className="flex flex-row justify-end gap-4">
              <Pressable onPress={() => setModalVisible(false)}>
                <Text className="text-zinc-400 text-lg">Cancelar</Text>
              </Pressable>
              <Pressable onPress={confirmAction}>
                <Text className="text-red-500 text-lg">Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
