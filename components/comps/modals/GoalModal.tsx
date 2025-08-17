import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Slider from '@react-native-community/slider';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Goal } from '../../api/model/Goal';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Update {
  goalId: string;
  name: string;
  progress: number;
  timestamp: string;
  previousProgress: number;
}

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  selectedGoal: Goal | null;
  goalName: string;
  setGoalName: (name: string) => void;
  goalDescription: string;
  setGoalDescription: (description: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  onSaveGoal: () => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  loading: boolean;
  updates: Update[];
  clearUpdates: () => void;
  removeUpdate: (goalId: string) => void;
  removeSpecificUpdate: (goalId: string, timestamp: string) => void;
  onCreateUpdate: (goalId: string, progress: number, description: string) => Promise<void>;
}

const GoalModal: React.FC<GoalModalProps> = ({
  isVisible,
  onClose,
  mode,
  selectedGoal,
  goalName,
  setGoalName,
  goalDescription,
  setGoalDescription,
  selectedDate,
  setSelectedDate,
  onSaveGoal,
  onDeleteGoal,
  loading,
  updates,
  clearUpdates,
  removeSpecificUpdate,
  onCreateUpdate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isUpdateModalVisible && selectedGoal) {
      setUpdateName('');
      setUpdateProgress(selectedGoal.progress);
    }
  }, [isUpdateModalVisible, selectedGoal]);

  useEffect(() => {
    if (isUpdateModalVisible) {
      // Animação de abertura (subir)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animação de fechamento (descer)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUpdateModalVisible]);

  const handleOpenUpdateModal = () => {
    if (!selectedGoal) return;
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    // Primeiro executa a animação de fechamento
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Depois que a animação termina, fecha o modal
      setIsUpdateModalVisible(false);
      setUpdateName('');
      setUpdateProgress(selectedGoal?.progress || 0);
    });
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
      await onCreateUpdate(selectedGoal!.id, updateProgress, updateName.trim());
      // Anima o fechamento após salvar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsUpdateModalVisible(false);
        setUpdateName('');
        setUpdateProgress(selectedGoal!.progress);
      });
    } catch (err: any) {
      console.error('Error adding update:', err);
      Alert.alert('Erro', err.message || 'Falha ao adicionar update');
    }
  };

  const handleDeleteUpdate = (goalId: string, timestamp: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este update?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => removeSpecificUpdate(goalId, timestamp)
        }
      ]
    );
  };

  const renderLeftActions = (update: Update) => {
    return (
      <View className="flex-row items-center justify-start px-4 h-full rounded-xl">
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#f43f5e"
          }}
          onPress={() => handleDeleteUpdate(update.goalId, update.timestamp)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return '#10b981'; // green
    if (progress >= 50) return '#f59e0b'; // yellow
    return '#ff7a7f'; // red/pink
  };

  const getGoalUpdates = (): Update[] => {
    if (!selectedGoal) return [];
    return updates
      .filter((update: Update) => update.goalId === selectedGoal.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getProgressDifference = (currentProgress: number, previousProgress: number): string => {
    const diff = currentProgress - previousProgress;
    if (diff > 0) return `+${diff}%`;
    if (diff < 0) return `${diff}%`;
    return '0%';
  };

  const handleUpdateNameChange = (text: string) => {
    if (text.length <= 300) {
      setUpdateName(text);
    }
  };

  const handleRemoveSpecificUpdate = (goalId: string, timestamp: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este update?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => removeSpecificUpdate(goalId, timestamp)
        }
      ]
    );
  };

  const handleClearAllUpdates = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir todos os updates desta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir Todos', 
          style: 'destructive',
          onPress: () => selectedGoal && clearUpdates()
        }
      ]
    );
  };

  const isSaveDisabled = () => {
    return !goalName.trim() || loading;
  };

  const formatDeadlineDate = (date: Date): string => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return date.toLocaleDateString('pt-BR');
  };

  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>

        {mode === 'edit' && (
          <Pressable
            onPress={handleOpenUpdateModal}
            className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-30 rounded-full bg-rose-400 items-center justify-center shadow-lg"
          >
            <Ionicons name="add" size={28} color="black" />
          </Pressable>
        )}

        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4">
          <Pressable
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans ml-1">Voltar</Text>
          </Pressable>

          <View className="flex-row items-center space-x-4">
            {/* Save Button */}
            <Pressable
              onPress={onSaveGoal}
              className="px-4 py-2"
              disabled={isSaveDisabled()}
            >
              <Text className={`text-lg font-semibold font-sans ${
                isSaveDisabled()
                  ? 'text-zinc-500'
                  : 'text-rose-400'
              }`}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Goal Name */}
          <View className="mt-3 mb-6">
            <TextInput
              placeholder={mode === 'create' ? "Nome da meta" : "Editar nome da meta"}
              placeholderTextColor="#71717a"
              value={goalName}
              onChangeText={setGoalName}
              className="text-white text-2xl font-sans"
              multiline
              autoFocus={mode === 'create'}
              editable={!loading}
              maxLength={100}
            />
          </View>

          {/* Deadline */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Prazo (Opcional)
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center px-4 py-3 rounded-xl bg-zinc-700/30 "
              disabled={loading}
            >
              <Ionicons 
                name="calendar-outline" 
                size={18} 
                color={selectedDate ? "#fb7185" : "#71717a"} 
              />
              <Text className={`text-base font-sans ml-2 ${
                selectedDate ? 'text-white' : 'text-zinc-400'
              }`}>
                {selectedDate ? formatDeadlineDate(selectedDate) : "Selecionar prazo"}
              </Text>
            </Pressable>
            {selectedDate && (
              <Pressable
                onPress={() => setSelectedDate(null)}
                className="flex-row items-center  w-full bg-rose-400 rounded-xl justify-center mt-2 py-3"
                disabled={loading}
              >
                <Text className="text-white text-md font-sans ml-1">Remover prazo</Text>
              </Pressable>
            )}
          </View>

          {/* Goal Description */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Descrição (Opcional)
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
              maxLength={500}
            />
          </View>

          {mode === 'edit' && (
            <>
              {/* Current Progress Display */}
              <View className="mb-8">
                <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
                  Progresso Atual
                </Text>
                <View className="bg-zinc-700/30 px-4 py-4 rounded-xl">
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-white font-sans text-lg">Progresso</Text>
                    <View className="flex-row items-center">
                      {(selectedGoal?.progress || 0) === 100 && (
                        <View className=" bg-green-500/20 px-2 py-1 rounded-full">
                          <Text className="text-green-400 text-xs font-sans font-medium">
                            Concluída
                          </Text>
                        </View>
                      )}
                       {!(selectedGoal?.progress! === 100) && (
                      <Text className="text-white font-medium font-sans text-lg">
                        {selectedGoal?.progress || 0}%
                      </Text> 
                      )} 
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View className="bg-zinc-600 h-3 rounded-full overflow-hidden mb-3">
                    <View
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${selectedGoal?.progress || 0}%`,
                        backgroundColor: getProgressColor(selectedGoal?.progress || 0)
                      }}
                    />
                  </View>
                  
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="information-circle-outline" size={14} color="#71717a" />
                    <Text className="text-zinc-400 text-xs font-sans ml-1">
                      Use o botão flutuante para adicionar atualizações
                    </Text>
                  </View>
                </View>
              </View>

              {/* Updates List - Only for edit mode */}
              {getGoalUpdates().length > 0 && (
                <View className="mb-8">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
                      Atualizações Recentes ({getGoalUpdates().length})
                    </Text>
                    <Pressable
                      onPress={handleClearAllUpdates}
                      className="px-3 py-1"
                      disabled={loading}
                    >
                      <Text className="text-rose-400 font-sans text-sm">Limpar Todas</Text>
                    </Pressable>
                  </View>
                  
                  <View className="flex-col gap-4 space-y-3">
                    {getGoalUpdates().map((update: Update, index: number) => (
                      <Swipeable
                        key={`${update.goalId}-${update.timestamp}`}
                        renderLeftActions={() => renderLeftActions(update)}
                        leftThreshold={40}
                        rightThreshold={40}
                        overshootLeft={false}
                        overshootRight={false}
                        dragOffsetFromLeftEdge={80}
                        friction={1}
                      >
                        <View className="bg-[#2e2e32] p-4 rounded-xl">
                          {/* Header do Update */}
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <View className="flex-row items-center mb-1">
                                <Text className="text-white font-medium text-lg font-sans flex-1" numberOfLines={2}>
                                  {update.name}
                                </Text>
                                <View className="flex-row items-center ml-2">
                                  {/* {update.progress > update.previousProgress ? (
                                    <Ionicons name="trending-up" className="absolute right-[110%]" size={20} color="#10b981" />
                                  ) : update.progress < update.previousProgress ? (
                                    <Ionicons name="trending-down" className="absolute right-[110%]" size={20} color="#fb7185" />
                                  ) : (
                                    <Ionicons name="remove-circle-outline" className="absolute right-[160%]" size={20} color="#71717a" />
                                  )} */}
                                  <Text className={`text-md font-sans ml-1 font-medium ${
                                    update.progress > update.previousProgress 
                                      ? 'text-green-400' 
                                      : update.progress < update.previousProgress 
                                      ? 'text-rose-400' 
                                      : 'text-zinc-400'
                                  }`}>
                                    {getProgressDifference(update.progress, update.previousProgress)}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-zinc-400 text-xs font-sans">
                                {formatTimestamp(update.timestamp)}
                              </Text>
                            </View>
                          </View>

                          {/* Progresso do Update */}
                          <View className="mb-2 mt-4">
                            {/* Mini Progress Bar */}
                            <View className="bg-zinc-600 h-2 rounded-full overflow-hidden">
                              <View
                                className="h-full rounded-full"
                                style={{
                                  width: `${update.progress}%`,
                                  backgroundColor: getProgressColor(update.progress)
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      </Swipeable>
                    ))}
                  </View>
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

        {/* Update Modal (Drawer Style) with Custom Animation */}
        {isUpdateModalVisible && (
          <Modal
            transparent={true}
            visible={isUpdateModalVisible}
            onRequestClose={handleCloseUpdateModal}
            presentationStyle="overFullScreen"
            animationType="none"
          >
            <Animated.View 
              className="flex-1 justify-end"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                opacity: fadeAnim,
              }}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="w-full justify-end"
              >
                <Animated.View 
                  className="bg-zinc-800 rounded-t-3xl"
                  style={{
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  {/* Header com indicador visual */}
                  <View className="items-center py-4">
                  </View>

                  {/* Scrollable Content */}
                  <ScrollView
                    className="max-h-[400px] px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  >
                    {/* Update Description */}
                    <View className="mb-2 px-1">
                      <TextInput
                        placeholder="Insira o progresso realizado..."
                        placeholderTextColor="#52525b"
                        className="text-white text-xl font-sans py-4"
                        multiline
                        textAlignVertical="top"
                        value={updateName}
                        onChangeText={handleUpdateNameChange}
                        editable={!loading}
                        maxLength={100}
                      />

                    </View>

                    {/* Progress Update */}
                    <View className="mt-6">
                      <View className="bg-zinc-700/30 rounded-xl p-5">
                        {/* Progress Display */}
                        <View className="flex-row justify-between items-center mb-6">
                          <Text className="text-zinc-300 font-sans text-base">Progresso atual</Text>
                          <View className='bg-zinc-800 w-[80px] h-[40px] absolute right-2 top-[-100%] rounded-b-2xl flex items-center justify-center'>
                            <Text className="text-white font-semibold font-sans text-xl ml-2">
                              {updateProgress}%
                            </Text>
                          </View>

                        </View>

                        {/* Slider */}
                        <Slider
                          style={{ width: '100%', height: 50 }}
                          minimumValue={0}
                          maximumValue={100}
                          step={1}
                          value={updateProgress}
                          onValueChange={setUpdateProgress}
                          minimumTrackTintColor="#fb7185"
                          maximumTrackTintColor="#3f3f46"
                          disabled={loading}
                        />
                        <View className="flex-row justify-between mt-2">
                          <Text className="text-zinc-500 text-sm font-sans">0%</Text>
                          <Text className="text-zinc-500 text-sm font-sans">100%</Text>
                        </View>
                        
                      </View>
                    </View>
                  </ScrollView>

                  {/* Footer Buttons */}
                  <View className="px-6 py-3 bg-zinc-800/50 mb-4">
                    <View className="flex-row gap-3 px-1 py-4 space-x-3">
                      <Pressable
                        onPress={handleCloseUpdateModal}
                        className="flex-1 py-4 px-6 bg-zinc-700/30 rounded-xl items-center"
                        disabled={loading}
                      >
                        <Text className="text-zinc-300 font-sans font-medium">Cancelar</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleAddUpdate}
                        className={`flex-1 py-4 px-6 rounded-xl items-center ${
                          loading 
                            ? 'bg-zinc-600' 
                            : 'bg-rose-400 shadow-lg shadow-rose-400/20'
                        }`}
                        disabled={loading || !updateName.trim()}
                      >
                        <Text className={`font-semibold font-sans ${
                          loading ? 'text-zinc-400' : 'text-black'
                        }`}>
                          {loading ? 'Salvando...' : 'Salvar Update'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </Animated.View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

export default GoalModal;