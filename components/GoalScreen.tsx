import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGoal } from '../hooks/useGoal';
import { Goal } from '../api/model/Goal';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import GoalModal from './comps/GoalModal';
import LoadingSpinner from './comps/LoadingSpinner';

const EmptyState = ({ onCreateGoal }: { onCreateGoal: () => void }) => {
  return (
    <View className="flex-1 justify-center items-center px-8 pb-[160px]">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="trophy-outline" size={60} color="gray" />
        </View>
        
        <Text className="text-neutral-400 text-xl font-sans mb-2 text-center">
          Nenhuma meta criada
        </Text>
        
        <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
          Crie sua primeira meta para começar
        </Text>
      </View>
    </View>
  );
};

const StatisticsView = ({ goals }: { goals: Goal[] }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.progress >= 100).length;
  const inProgressGoals = goals.filter(goal => goal.progress > 0 && goal.progress < 100).length;
  const notStartedGoals = goals.filter(goal => goal.progress === 0).length;
  
  const averageProgress = totalGoals > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
    : 0;

  const overdueGoals = goals.filter(goal => {
    if (!goal.deadline) return false;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    return deadline < today && goal.progress < 100;
  }).length;

  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Calculando metas próximas ao prazo (próximos 7 dias)
  const upcomingGoals = goals.filter(goal => {
    if (!goal.deadline || goal.progress >= 100) return false;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  return (
    <View className="px-6 mb-4">
      <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-[#35353a] mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="p-2 rounded-xl"
            style={{
              backgroundColor: 'rgba(251, 113, 133, 0.15)'
            }}
          >
            <Ionicons name="stats-chart" size={16} color="#fb7185" />
          </View>
          <View className="flex-col">
            <Text className="text-zinc-400 font-sans text-xs mb-1">Estatísticas gerais</Text>
            <Text className="text-white font-sans text-sm font-semibold">
              {totalGoals} {totalGoals === 1 ? 'meta' : 'metas'}  •  {averageProgress}% de progresso médio
            </Text>
          </View>
        </View>
      </View>

      {/* Caixas de estatísticas detalhadas */}
      <View className="flex-row items-center gap-2">
        <Pressable className="flex-row items-center gap-1.5 bg-zinc-700 rounded-xl px-3 py-1 flex-1">
          <Feather name="check-circle" size={14} color="#10b981" />
            <Text className="text-white font-sans text-sm">{completedGoals} concluídas </Text>
        </Pressable>

        <Pressable className="flex-row items-center gap-1.5 bg-zinc-700 rounded-xl px-3 py-1 flex-1">
          <Ionicons name="time-outline" size={15} color="#f59e0b" />
            <Text className="text-white font-sans text-sm">{upcomingGoals} {goals.length == 1 ? "pendente" : "pendentes"}</Text>
        </Pressable>

        <Pressable className="flex-row items-center gap-1.5 bg-zinc-700 rounded-xl px-3 py-1 flex-1">
          <Feather name="x-circle" size={14} color="#ff7a7f" />
            <Text className="text-white font-sans text-sm">{overdueGoals} {overdueGoals == 1 ? "atrasada" : "atrasadas"}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const GoalScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const { 
    loading, 
    saving,
    error, 
    updates, 
    goals,
    getGoals,
    createGoal, 
    createUpdateGoal, 
    editGoal,
    deleteGoal,
    clearUpdates, 
    removeUpdate,
    removeSpecificUpdate,
    clearError 
  } = useGoal();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form states
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load goals from API
  const loadGoals = useCallback(async () => {
    if (!userId) return;
    
    try {
      clearError();
      await getGoals(userId);
    } catch (err: any) {
      console.error('Error loading goals:', err);
      Alert.alert('Erro', 'Falha ao carregar metas');
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

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
          goalDescription || '',
          new Date().toISOString(),
          selectedDate?.toISOString() || null,
          userId
        );
      } else if (modalMode === 'edit' && selectedGoal) {
        await editGoal(
          selectedGoal.id,
          goalName,
          goalDescription || '',
          selectedDate?.toISOString() || null
        );
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
      <View className="flex-row items-center justify-start border-t bg-rose-500 px-4 h-full">
        <Pressable
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
        </Pressable>
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
        <Pressable onPress={() => handleOpenGoal(item)}>
          <View className="w-full flex flex-col justify-center px-6 py-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white text-lg mb-1 font-sans line-clamp-1">{item.name}</Text>
                {item.description && (
                  <Text className="text-zinc-400 text-sm mb-2 font-sans line-clamp-1">{item.description}</Text>
                )}
                <Text className="text-zinc-500 text-xs font-sans">{formatDate(item.deadline)}</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View>
              <View className="flex absolute bottom-2 right-1 flex-row justify-between mb-2">
                <Text className="text-white text-sm font-sans">{item.progress}%</Text>
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
        </Pressable>
      </Swipeable>
    );
  };

  const handleRefresh = () => {
    loadGoals();
  };

  const isCurrentlyLoading = loading || saving;

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      <LoadingSpinner visible={isCurrentlyLoading} />
      
      {/* Floating Action Buttons */}
      <Pressable
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
        <Feather name="plus" strokeWidth={3} size={32} color="black" />
      </Pressable>

      {/* Header */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <Pressable onPress={handleGoBack} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-1 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Metas</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          <Pressable 
            onPress={handleRefresh}
          >
            <Ionicons name="refresh-circle" size={26} color="#ff7a7f" />
          </Pressable>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View className="mx-6 mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <Text className="text-red-400 font-sans text-sm">{error}</Text>
          <Pressable onPress={clearError} className="mt-2">
            <Text className="text-red-300 font-sans text-xs">Dispensar</Text>
          </Pressable>
        </View>
      )}

      <StatisticsView goals={goals} />

      {/* Goals List */}
      {goals.length === 0 ? (
        <EmptyState onCreateGoal={handleOpenCreate} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoalItem}
          contentContainerStyle={{ paddingBottom: 120 }}
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
        onDeleteGoal={selectedGoal ? handleDeleteGoal : async () => { } }
        loading={saving}
        updates={updates}
        clearUpdates={clearUpdates}
        removeUpdate={removeUpdate}
        onCreateUpdate={handleCreateUpdate}
        removeSpecificUpdate={removeSpecificUpdate}
      />
    </SafeAreaView>
  );
};

export default GoalScreen;