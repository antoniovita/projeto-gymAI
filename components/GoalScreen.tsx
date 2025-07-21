import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Slider from '@react-native-community/slider';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useGoal } from '../hooks/useGoal';
import { Goal } from '../api/model/Goal';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Update states
  const [updateName, setUpdateName] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showUpdateSection, setShowUpdateSection] = useState(false);

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
    setUpdateName('');
    setUpdateProgress(0);
    setShowUpdateSection(false);
    setIsModalVisible(true);
  };

  const handleOpenGoal = (goal: Goal) => {
    setModalMode('edit');
    setSelectedGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description ?? '');
    setSelectedDate(goal.deadline ? new Date(goal.deadline) : null);
    setUpdateName('');
    setUpdateProgress(goal.progress);
    setShowUpdateSection(false);
    setIsModalVisible(true);
  };

  const handleToggleUpdateSection = () => {
    const newShowUpdateSection = !showUpdateSection;
    setShowUpdateSection(newShowUpdateSection);
    if (newShowUpdateSection) {
      setUpdateProgress(selectedGoal?.progress || 0);
    }
  };

  const handleSaveGoal = async () => {
    if (!goalName.trim() || !goalDescription.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
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
          goalDescription,
          new Date().toISOString(),
          selectedDate?.toISOString() || null,
          userId
        );
        Alert.alert('Sucesso', 'Meta criada com sucesso!');
      }
      // Note: Para editar meta, use a função handleAddUpdate para alterar progresso
      
      // Reset form and close modal
      setGoalName('');
      setGoalDescription('');
      setSelectedDate(null);
      setUpdateName('');
      setUpdateProgress(0);
      setSelectedGoal(null);
      setIsModalVisible(false);
      
    } catch (err: any) {
      console.error('Error saving goal:', err);
      Alert.alert('Erro', err.message || 'Falha ao salvar meta');
    }
  };

  const handleAddUpdate = async () => {
    if (!updateName.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para o update');
      return;
    }

    if (!selectedGoal) {
      Alert.alert('Erro', 'Meta não encontrada');
      return;
    }

    if (updateProgress < 0 || updateProgress > 100) {
      Alert.alert('Erro', 'O progresso deve estar entre 0% e 100%');
      return;
    }

    if (updateProgress < selectedGoal.progress) {
      Alert.alert(
        'Atenção', 
        `O novo progresso (${updateProgress}%) é menor que o progresso atual (${selectedGoal.progress}%). Deseja continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => performUpdate() }
        ]
      );
      return;
    }

    performUpdate();
  };

  const performUpdate = async () => {
    try {
      await createUpdateGoal(selectedGoal!.id, updateProgress, updateName.trim());
      setUpdateName('');
      setUpdateProgress(selectedGoal!.progress); // Reset to current progress
      setShowUpdateSection(false);
      
      // Reload goals to get updated progress
      await loadGoals();
      
      Alert.alert('Sucesso', 'Update adicionado e progresso atualizado!');
    } catch (err: any) {
      console.error('Error adding update:', err);
      Alert.alert('Erro', err.message || 'Falha ao adicionar update');
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
              setIsModalVisible(false);
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
                <Text className="text-zinc-400 text-sm mb-2 font-sans">{item.description}</Text>
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

  const getGoalUpdates = () => {
    if (!selectedGoal) return [];
    return updates.filter((update: Update) => update.goalId === selectedGoal.id);
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
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderGoalItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Create/Edit Goal Modal */}
      <Modal
        transparent={false}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>
          {/* Floating Update Button - Only show in edit mode */}
          {modalMode === 'edit' && (
            <Pressable
              onPress={handleToggleUpdateSection}
              className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-30 rounded-full bg-rose-400 items-center justify-center shadow-lg"
            >
              <Ionicons 
                name={showUpdateSection ? "close" : "refresh"} 
                size={24} 
                color="black" 
              />
            </Pressable>
          )}

          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
              className="items-center flex flex-row"
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-white text-lg font-sans ml-1">Voltar</Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-4">
              {modalMode === 'create' && (
                <TouchableOpacity 
                  onPress={handleSaveGoal}
                  className="px-4 py-2"
                  disabled={!goalName.trim() || !goalDescription.trim() || loading}
                >
                  <Text className={`text-lg font-semibold font-sans ${
                    (!goalName.trim() || !goalDescription.trim() || loading) 
                      ? 'text-zinc-500' 
                      : 'text-rose-400'
                  }`}>
                      Criar Meta
                  </Text>
                </TouchableOpacity>
              )}
              
              {modalMode === 'edit' && selectedGoal && (
                <TouchableOpacity 
                  onPress={() => handleDeleteGoal(selectedGoal.id)}
                  className="px-4 py-2"
                  disabled={loading}
                >
                  <Text className={`text-lg font-semibold font-sans ${
                    loading ? 'text-zinc-500' : 'text-red-400'
                  }`}>
                      Excluir
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {/* Goal Name */}
            <View className="mt-3 mb-6">
              <TextInput
                placeholder={modalMode === 'create' ? "Nome da meta" : "Editar nome da meta"}
                placeholderTextColor="#71717a"
                value={goalName}
                onChangeText={setGoalName}
                className="text-white text-2xl font-sans"
                multiline
                autoFocus={modalMode === 'create'}
                editable={!loading}
              />
            </View>

            {/* Deadline */}
            <View className="mb-8">
              <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
                Prazo {modalMode === 'create' ? '(Opcional)' : ''}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)} 
                className="flex-row items-center bg-zinc-700/50 border border-rose-400/30 px-4 py-3 rounded-xl"
                disabled={loading}
              >
                <Ionicons name="calendar-outline" size={18} color="#fb7185" />
                <Text className="text-white text-base font-sans ml-2">
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : "Selecionar prazo "}
                </Text>
              </TouchableOpacity>
              
              {selectedDate && (
                <TouchableOpacity
                  onPress={() => setSelectedDate(null)}
                  className="flex-row items-center justify-center mt-2 py-2"
                  disabled={loading}
                >
                  <Text className="text-rose-400 text-sm font-sans">Remover prazo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Goal Description */}
            <View className="mb-8">
              <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
                Descrição
              </Text>
              <TextInput
                placeholder="Descreva sua meta..."
                placeholderTextColor="#71717a"
                className="text-white text-base leading-6 bg-zinc-700/30 font-sans border-zinc-600 rounded-xl px-4 py-3 min-h-[100px]"
                multiline
                textAlignVertical="top"
                value={goalDescription}
                onChangeText={setGoalDescription}
                editable={!loading}
              />
            </View>

            {modalMode === 'edit' && (
              <>
                {/* Current Progress Display */}
                <View className="mb-8">
                  <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
                    Progresso Atual
                  </Text>
                  <View className="bg-zinc-700/50 px-4 py-4 rounded-xl">
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-white font-sans">Progresso</Text>
                      <Text className="text-rose-400 font-medium font-sans">{selectedGoal?.progress || 0}%</Text>
                    </View>
                    
                    {/* Progress Bar */}
                    <View className="bg-zinc-600 h-3 rounded-full overflow-hidden">
                      <View 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${selectedGoal?.progress || 0}%`,
                          backgroundColor: getProgressColor(selectedGoal?.progress || 0)
                        }}
                      />
                    </View>
                    
                    <Text className="text-zinc-400 text-xs font-sans mt-2 text-center">
                      Use o botão flutuante para adicionar updates
                    </Text>
                  </View>
                </View>

                {/* Add Update Section */}
                {showUpdateSection && (
                  <View className="mb-8">
                    <Text className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wide">
                      Novo Update
                    </Text>

                    <View className="bg-zinc-700/30 border border-zinc-600 rounded-xl p-4">
                      {/* Update Description */}
                      <Text className="text-white font-medium mb-3 font-sans">Descrição do Update</Text>
                      <TextInput
                        placeholder="Ex: Completei tarefa X, finalizei etapa Y, atingi milestone Z..."
                        placeholderTextColor="#71717a"
                        className="text-white text-base bg-zinc-600/50 font-sans border border-zinc-500 rounded-lg px-3 py-3 mb-4"
                        multiline
                        value={updateName}
                        onChangeText={setUpdateName}
                        editable={!loading}
                      />

                      {/* Progress Update */}
                      <Text className="text-white font-medium mb-3 font-sans">Novo Progresso</Text>
                      <View className="bg-zinc-600/50 border border-zinc-500 rounded-lg p-4 mb-4">
                        <View className="flex-row justify-between mb-4">
                          <Text className="text-zinc-300 font-sans">Progresso</Text>
                          <Text className="text-rose-400 font-medium font-sans">{updateProgress}%</Text>
                        </View>
                        
                        <Slider
                          style={{ width: '100%', height: 40 }}
                          minimumValue={0}
                          maximumValue={100}
                          step={1}
                          value={updateProgress}
                          onValueChange={setUpdateProgress}
                          minimumTrackTintColor="#fb7185"
                          maximumTrackTintColor="#374151"
                          disabled={loading}
                        />
                        
                        <View className="flex-row justify-between mt-2">
                          <Text className="text-zinc-500 text-xs font-sans">0%</Text>
                          <Text className="text-zinc-500 text-xs font-sans">100%</Text>
                        </View>

                        {/* Progress Change Indicator */}
                        {updateProgress !== selectedGoal?.progress && (
                          <View className="mt-3 p-2 bg-zinc-800/50 rounded-lg">
                            <Text className="text-zinc-300 text-sm font-sans text-center">
                              {updateProgress > (selectedGoal?.progress || 0) 
                                ? `+${updateProgress - (selectedGoal?.progress || 0)}% de progresso` 
                                : `${updateProgress - (selectedGoal?.progress || 0)}% de progresso`
                              }
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity
                          onPress={() => {
                            setUpdateName('');
                            setUpdateProgress(selectedGoal?.progress || 0);
                            setShowUpdateSection(false);
                          }}
                          className="px-4 py-2"
                          disabled={loading}
                        >
                          <Text className="text-zinc-400 font-sans">Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={handleAddUpdate}
                          className="bg-rose-400 px-4 py-2 rounded-lg"
                          disabled={!updateName.trim() || loading}
                        >
                          <Text className={`font-semibold font-sans ${
                            (!updateName.trim() || loading) ? 'text-zinc-500' : 'text-black'
                          }`}>
                            Adicionar Update
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Updates List - Only for edit mode */}
                {getGoalUpdates().length > 0 && (
                  <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
                        Atualizações Recentes ({getGoalUpdates().length})
                      </Text>
                      <TouchableOpacity 
                        onPress={() => selectedGoal && clearUpdates()}
                        className="px-3 py-1"
                        disabled={loading}
                      >
                        <Text className="text-rose-400 font-sans text-sm">Limpar Todas</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {getGoalUpdates().map((update: Update, index: number) => (
                        <View key={index} className="bg-zinc-700/50 p-4 rounded-xl mr-3" style={{ minWidth: 250 }}>
                          <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-white font-medium text-sm font-sans">Update #{index + 1}</Text>
                            <TouchableOpacity 
                              onPress={() => removeUpdate(update.goalId)}
                              disabled={loading}
                            >
                              <Ionicons name="close-circle" size={18} color="#fb7185" />
                            </TouchableOpacity>
                          </View>
                          <Text className="text-zinc-300 text-sm font-sans leading-5">{update.name}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={selectedDate || new Date()}
            onConfirm={(selectedDate) => {
              setSelectedDate(selectedDate);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
            textColor="#000000"
            accentColor="#fb7185"
            buttonTextColorIOS="#fb7185"
            themeVariant="light"
            display="inline"
            locale="pt-BR"
            minimumDate={new Date()}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GoalScreen;