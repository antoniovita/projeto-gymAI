import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useGoal } from '../hooks/useGoal';
import { Goal } from '../api/model/Goal';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import GoalModal from './comps/GoalModal';

interface Update {
  goalId: string;
  name: string;
}

const EmptyState = ({ onCreateGoal }: { onCreateGoal: () => void }) => {
  return (
    <View className="flex-1 justify-center items-center mb-[60px] px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="flag-outline" size={60} color="gray" />
        </View>
        
        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma meta criada
        </Text>
        
        <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
          Crie sua primeira meta para começar
        </Text>
      </View>
    </View>
  );
};

const GoalScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const { 
    loading, 
    error, 
    updates, 
    goals,
    getGoals,
    createGoal, 
    createUpdateGoal, 
    deleteGoal,
    clearUpdates, 
    removeUpdate,
    clearError 
  } = useGoal();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form states
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load goals from API
  const loadGoals = useCallback(async () => {
    if (!userId) return;
    
    try {
      setRefreshing(true);
      clearError();
      await getGoals(userId);
    } catch (err: any) {
      console.error('Error loading goals:', err);
      Alert.alert('Erro', 'Falha ao carregar metas');
    } finally {
      setRefreshing(false);
    }
  }, [userId, getGoals, clearError]);

  useEffect(() => {
    loadGoals();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedGoal(null);
    setGoalName('');
    setGoalDescription('');
    setSelectedDate(null);
    setIsModalVisible(true);
  };

  const handleOpenGoal = (goal: Goal) => {
    setModalMode('edit');
    setSelectedGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description ?? '');
    setSelectedDate(goal.deadline ? new Date(goal.deadline) : null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setGoalName('');
    setGoalDescription('');
    setSelectedDate(null);
    setSelectedGoal(null);
    setIsModalVisible(false);
  };

  const handleSaveGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome da meta');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado');
      return;
    }

    try {
      if (modalMode === 'create') {
        await createGoal(
          goalName,
          goalDescription || '', // Permite descrição vazia
          new Date().toISOString(),
          selectedDate?.toISOString() || null,
          userId
        );
        Alert.alert('Sucesso', 'Meta criada com sucesso!');
      }
      
      // Reset form and close modal
      handleCloseModal();
      
    } catch (err: any) {
      console.error('Error saving goal:', err);
      Alert.alert('Erro', err.message || 'Falha ao salvar meta');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Excluir meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              handleCloseModal();
              Alert.alert('Sucesso', 'Meta excluída com sucesso!');
            } catch (err: any) {
              console.error('Error deleting goal:', err);
              Alert.alert('Erro', err.message || 'Falha ao excluir meta');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCreateUpdate = async (goalId: string, progress: number, description: string) => {
    await createUpdateGoal(goalId, progress, description);
    // Reload goals to get updated progress
    await loadGoals();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Sem prazo';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return '#10b981'; // green
    if (progress >= 50) return '#f59e0b'; // yellow
    return '#ff7a7f'; // red/pink
  };

  const renderLeftActions = (goal: Goal) => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#f43f5e',
        backgroundColor: '#f43f5e',
        paddingHorizontal: 16,
        height: '100%',
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 32,
          }}
          onPress={() => handleDeleteGoal(goal.id)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(item)}
        leftThreshold={40}
        rightThreshold={40}
        overshootLeft={false}
        overshootRight={false}
        dragOffsetFromLeftEdge={80}
        friction={1}
      >
        <TouchableOpacity onPress={() => handleOpenGoal(item)}>
          <View className="w-full flex flex-col justify-center px-6 py-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white text-lg font-medium mb-1 font-sans">{item.name}</Text>
                {item.description && (
                  <Text className="text-zinc-400 text-sm mb-2 font-sans">{item.description}</Text>
                )}
                <Text className="text-zinc-500 text-xs font-sans">Prazo: {formatDate(item.deadline)}</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View>
              <View className="flex flex-row justify-between mb-2">
                <Text className="text-zinc-400 text-sm font-sans">Progresso</Text>
                <Text className="text-white text-sm font-medium font-sans">{item.progress}%</Text>
              </View>
              <View className="bg-zinc-600 h-2 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${item.progress}%`,
                    backgroundColor: getProgressColor(item.progress)
                  }}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const handleRefresh = () => {
    loadGoals();
  };

  if (loading && goals.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-800 justify-center items-center">
        <Text className="text-white text-lg font-sans">Carregando metas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      {/* Floating Action Buttons */}
      <Pressable
      onPress={handleOpenCreate}
      className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
      <Ionicons name="add" size={32} color="black" />
      </Pressable>

      <View className="absolute bottom-[6%] left-6 z-20">
      <Pressable
        onPress={handleGoBack}
        className="flex-row items-center bg-rose-400 px-4 h-[50px] rounded-full"
      >
        <Ionicons name="chevron-back" size={20} color="black" />
        <Text className="text-black font-sans text-lg ml-1">Voltar</Text>
      </Pressable>
      </View>

      {/* Header */}
      <View className="flex flex-col px-6 mt-[40px] mb-5">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-3xl text-white font-medium font-sans">Metas</Text>
        
        <View className="flex flex-row items-center space-x-4">
        <Pressable onPress={handleRefresh} disabled={refreshing}>
          <Ionicons 
          name="refresh" 
          size={24} 
          color={refreshing ? "#71717a" : "#fb7185"} 
          />
        </Pressable>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
        <Text className="text-red-400 font-sans text-sm">{error}</Text>
        <TouchableOpacity onPress={clearError} className="mt-2">
          <Text className="text-red-300 font-sans text-xs">Dispensar</Text>
        </TouchableOpacity>
        </View>
      )}
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
      <EmptyState onCreateGoal={handleOpenCreate} />
      ) : (
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoalItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
      )}

      {/* Goal Modal */}
      <GoalModal
      isVisible={isModalVisible}
      onClose={handleCloseModal}
      mode={modalMode}
      selectedGoal={selectedGoal}
      goalName={goalName}
      setGoalName={setGoalName}
      goalDescription={goalDescription}
      setGoalDescription={setGoalDescription}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onSaveGoal={handleSaveGoal}
      onDeleteGoal={selectedGoal ? handleDeleteGoal : async () => {}}
      loading={loading}
      updates={updates}
      clearUpdates={clearUpdates}
      removeUpdate={removeUpdate}
      onCreateUpdate={handleCreateUpdate}
      />
    </SafeAreaView>
  );
};

export default GoalScreen;
            