import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Slider from '@react-native-community/slider';
import { Goal } from '../../api/model/Goal';

interface Update {
  goalId: string;
  name: string;
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
  removeUpdate,
  onCreateUpdate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);

  // Reset update states when modal opens/closes or goal changes
  useEffect(() => {
    if (isUpdateModalVisible && selectedGoal) {
      setUpdateName('');
      setUpdateProgress(selectedGoal.progress);
    }
  }, [isUpdateModalVisible, selectedGoal]);

  const handleOpenUpdateModal = () => {
    if (!selectedGoal) return;
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateName('');
    setUpdateProgress(selectedGoal?.progress || 0);
    setIsUpdateModalVisible(false);
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
      // Close update modal and reset states
      setIsUpdateModalVisible(false);
      setUpdateName('');
      setUpdateProgress(selectedGoal!.progress);
      Alert.alert('Sucesso', 'Update adicionado e progresso atualizado!');
    } catch (err: any) {
      console.error('Error adding update:', err);
      Alert.alert('Erro', err.message || 'Falha ao adicionar update');
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return '#10b981'; // green
    if (progress >= 50) return '#f59e0b'; // yellow
    return '#ff7a7f'; // red/pink
  };

  const getGoalUpdates = () => {
    if (!selectedGoal) return [];
    return updates.filter((update: Update) => update.goalId === selectedGoal.id);
  };

  // Handler para mudança do texto com validação
  const handleUpdateNameChange = (text: string) => {
    // Limita o texto a 300 caracteres
    if (text.length <= 300) {
      setUpdateName(text);
    }
  };

  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>
        {/* Floating Update Button - Only show in edit mode */}
        {mode === 'edit' && (
          <TouchableOpacity
            onPress={handleOpenUpdateModal}
            className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-30 rounded-full bg-rose-400 items-center justify-center shadow-lg"
          >
            <Ionicons name="refresh" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans ml-1">Voltar</Text>
          </TouchableOpacity>

          <View className="flex-row items-center space-x-4">
            {mode === 'create' && (
              <TouchableOpacity
                onPress={onSaveGoal}
                className="px-4 py-2"
                disabled={!goalName.trim() || loading}
              >
                <Text className={`text-lg font-semibold font-sans ${
                  (!goalName.trim() || loading)
                    ? 'text-zinc-500'
                    : 'text-rose-400'
                }`}>
                  Criar Meta
                </Text>
              </TouchableOpacity>
            )}

            {mode === 'edit' && selectedGoal && (
              <TouchableOpacity
                onPress={() => onDeleteGoal(selectedGoal.id)}
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
              placeholder={mode === 'create' ? "Nome da meta" : "Editar nome da meta"}
              placeholderTextColor="#71717a"
              value={goalName}
              onChangeText={setGoalName}
              className="text-white text-2xl font-sans"
              multiline
              autoFocus={mode === 'create'}
              editable={!loading}
            />
          </View>

          {/* Deadline */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Prazo (Opcional)
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
            />
          </View>

          {mode === 'edit' && (
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

        {/* Update Modal (Drawer Style) - CORRIGIDO */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={isUpdateModalVisible}
          onRequestClose={handleCloseUpdateModal}
          presentationStyle="overFullScreen"
        >
          <View className="flex-1 justify-end bg-black/60">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full justify-end"
            >
              <View className="bg-zinc-800 rounded-t-3xl">
                {/* Header com indicador visual */}
                <View className="items-center py-4">
                  <View className="flex-row items-center justify-between w-full px-6">
                  </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                  className="max-h-[400px] px-6"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* Update Description */}
                  <View className="mb-2">
                    <Text className="text-white font-medium mb-4 font-sans text-lg">Descrição do Update</Text>
                    <TextInput
                      placeholder="Descreva o progresso realizado..."
                      placeholderTextColor="#52525b"
                      className="text-white text-base bg-zinc-700/30 font-sans rounded-xl px-4 py-4 min-h-[100px]"
                      multiline
                      textAlignVertical="top"
                      value={updateName}
                      onChangeText={handleUpdateNameChange}
                      editable={!loading}
                      maxLength={300}
                    />
                    <Text className="text-zinc-500 text-xs font-sans mt-2 text-right">
                      {updateName.length}/300
                    </Text>
                  </View>

                  {/* Progress Update */}
                  <View className="mb-6">
                    <Text className="text-white font-medium mb-4 font-sans text-lg">Atualizar Progresso</Text>
                    <View className="bg-zinc-700/30 rounded-xl p-5">
                      {/* Progress Display */}
                      <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-zinc-300 font-sans text-base">Progresso atual</Text>
                        <View className="flex-row items-center">
                          <Text className="text-zinc-400 font-sans mr-2">{selectedGoal?.progress}%</Text>
                          <Ionicons name="arrow-forward" size={16} color="#71717a" />
                          <Text className="text-rose-400 font-semibold font-sans text-lg ml-2">
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

                      {/* Progress Change Indicator */}
                      {updateProgress !== selectedGoal?.progress && (
                        <View className="mt-4 p-4 bg-zinc-800/60 border border-zinc-600/30 rounded-lg">
                          <View className="flex-row items-center justify-center">
                            {updateProgress > (selectedGoal?.progress || 0) ? (
                              <Ionicons name="trending-up" size={18} color="#10b981" />
                            ) : (
                              <Ionicons name="trending-down" size={18} color="#f59e0b" />
                            )}
                            <Text className={`font-sans text-sm ml-2 font-medium ${
                              updateProgress > (selectedGoal?.progress || 0)
                                ? 'text-green-400'
                                : 'text-yellow-400'
                            }`}>
                              {updateProgress > (selectedGoal?.progress || 0)
                                ? `+${updateProgress - (selectedGoal?.progress || 0)}% de progresso`
                                : `${updateProgress - (selectedGoal?.progress || 0)}% de progresso`
                              }
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View className="px-6 py-3 bg-zinc-800/50">
                  <View className="flex-row gap-3 px-1 py-4 space-x-3">
                    <TouchableOpacity
                      onPress={handleCloseUpdateModal}
                      className="flex-1 py-4 px-6 bg-zinc-700/30 rounded-xl items-center"
                      disabled={loading}
                    >
                      <Text className="text-zinc-300 font-sans font-medium">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleAddUpdate}
                      className="flex-1 py-4 px-6 rounded-xl items-center bg-rose-400 shadow-lg shadow-rose-400/20"
                      disabled={loading}
                    >
                      <Text className={`font-semibold font-sans ${
                        loading ? 'text-zinc-500' : 'text-black'
                      }`}>
                        {loading ? 'Salvando...' : 'Salvar Update'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default GoalModal;