import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  FlatList,
  Alert,
  Switch,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { RoutineTask } from '../../../api/model/RoutineTasks';
import { useRoutineTasks } from 'hooks/useRoutineTasks';
import { useAuth } from 'hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import {getSwitchState, removeSwitchState, setSwitchState} from "../../../helpers/switchHelper"
import { format } from 'date-fns';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type CategoryType = 'Trabalho' | 'Exercícios' | 'Saúde' | 'Estudos' | 'Casa' | 'Social' | 'Hobbie' | 'Outros';

const days: string[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const categories: CategoryType[] = [
  'Trabalho', 'Exercícios', 'Saúde', 'Estudos', 'Casa', 'Social', 'Hobbie', 'Outros'
];

const getDayName = (dayNumber: number): string => {
  const dayNames: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dayNames[dayNumber] || 'Dom';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<CategoryType, string> = {
    'Trabalho': '#3b82f6',
    'Exercícios': '#ef4444',
    'Saúde': '#10b981',
    'Estudos': '#8b5cf6',
    'Casa': '#f59e0b',
    'Social': '#ec4899',
    'Hobbie': '#06b6d4',
    'Outros': '#6b7280',
  };
  return colors[category as CategoryType] || '#6b7280';
};

const getWeekDayFromDayName = (dayName: string): WeekDay => {
  const mapping: Record<string, WeekDay> = {
    'Segunda': 'monday',
    'Terça': 'tuesday', 
    'Quarta': 'wednesday',
    'Quinta': 'thursday',
    'Sexta': 'friday',
    'Sábado': 'saturday',
    'Domingo': 'sunday',
  };
  return mapping[dayName] || 'monday';
};

const RoutineScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userId } = useAuth();

  const {
    routineTasks,
    loading,
    error,
    createRoutineTask,
    deleteRoutineTask,
    updateRoutineTask,
    getAllRoutineTasksByUserId,
    getCompletionCount,
    getTotalXpFromRoutine,
    activateRoutineTask,
  } = useRoutineTasks();

  const [selectedDay, setSelectedDay] = useState<string>(days[0]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);

  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});

  // carrega as routine tasks ao montar o componente
  useEffect(() => {
    if (userId) {
      getAllRoutineTasksByUserId(userId!);
    }
  }, [userId, getAllRoutineTasksByUserId]);

  // Carrega os estados dos switches quando as tarefas são carregadas
  useEffect(() => {
    const loadSwitchStates = async () => {
      const states: Record<string, boolean> = {};
      for (const task of routineTasks) {
        const switchState = await getSwitchState(task.id);
        states[task.id] = switchState?.state || false;
      }
      setSwitchStates(states);
    };

    if (routineTasks.length > 0) {
      loadSwitchStates();
    }
  }, [routineTasks]);

  const filteredTasks = useMemo(() => {
    const selectedWeekDay: WeekDay = getWeekDayFromDayName(selectedDay);
    return routineTasks.filter((task: RoutineTask) => {
      try {
        const weekDays: WeekDay[] = JSON.parse(task.week_days || "[]");
        return weekDays.includes(selectedWeekDay);
      } catch (error) {
        console.error('Erro ao fazer parse de week_days:', error);
        return false;
      }
    });
  }, [routineTasks, selectedDay]);

  const resetForm = (): void => {
    setTitle('');
    setContent('');
    setSelectedTime('');
    setSelectedDaysOfWeek([]);
    setSelectedCategories([]);
    setEditingTask(null);
  };

  const openModal = (task?: RoutineTask): void => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title || '');
      setContent(task.content || '');
      
      // Parse do horário do created_at
      setSelectedTime(task.created_at ? new Date(task.created_at).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '');
      
      // Parse dos dias da semana
      try {
        const weekDays: WeekDay[] = JSON.parse(task.week_days || "[]");
        const dayNumbers: number[] = weekDays.map((day: WeekDay) => {
          const dayMapping: Record<WeekDay, number> = {
            'monday': 1, 
            'tuesday': 2, 
            'wednesday': 3, 
            'thursday': 4,
            'friday': 5, 
            'saturday': 6, 
            'sunday': 0
          };
          return dayMapping[day] || 0;
        });
        setSelectedDaysOfWeek(dayNumbers);
      } catch (error) {
        console.error('Erro ao fazer parse dos dias da semana:', error);
        setSelectedDaysOfWeek([]);
      }
      
      setSelectedCategories([task.type as CategoryType || 'Outros']);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a tarefa.');
      return;
    }

    if (selectedDaysOfWeek.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos um dia da semana.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    try {
      // Converte números dos dias para strings em inglês
      const weekDays: WeekDay[] = selectedDaysOfWeek.map((dayNumber: number) => {
        const dayMapping: Record<number, WeekDay> = {
          0: 'sunday', 
          1: 'monday', 
          2: 'tuesday', 
          3: 'wednesday',
          4: 'thursday', 
          5: 'friday', 
          6: 'saturday'
        };
        return dayMapping[dayNumber] || 'monday';
      });

      let result;
      if (editingTask) {
        result = await updateRoutineTask(
          editingTask.id,
          title.trim(),
          content.trim(),
          weekDays,
          selectedCategories[0] || 'Outros'
        );
      } else {
        result = await createRoutineTask(
          title.trim(),
          content.trim(),
          weekDays,
          selectedCategories[0] || 'Outros',
          userId
        );
      }

      if (result.success) {
        setShowModal(false);
        resetForm();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar tarefa.');
      }
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao salvar a tarefa.');
    }
  };

  const toggleDayOfWeek = (dayNumber: number): void => {
    setSelectedDaysOfWeek((prev: number[]) => 
      prev.includes(dayNumber)
        ? prev.filter((d: number) => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const handleDelete = async (taskId: string): Promise<void> => {
    const selectedWeekDay: WeekDay = getWeekDayFromDayName(selectedDay);
    const task = routineTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    try {
      const currentWeekDays: WeekDay[] = JSON.parse(task.week_days || "[]");
      const hasMultipleDays = currentWeekDays.length > 1;
      
      if (hasMultipleDays) {

        Alert.alert(
          'Remover tarefa',
          'Como deseja remover esta tarefa?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: `Apenas de ${selectedDay}`, 
              style: 'default',
              onPress: async () => {
                const updatedWeekDays: WeekDay[] = currentWeekDays.filter(day => day !== selectedWeekDay);
                const result = await updateRoutineTask(
                  taskId,
                  task.title,
                  task.content,
                  updatedWeekDays,
                  task.type
                );
                
                if (!result.success) {
                  Alert.alert('Erro', result.error || 'Não foi possível remover a tarefa deste dia.');
                }
              }
            },
            { 
              text: 'Excluir completamente', 
              style: 'destructive',
              onPress: async () => {
                const result = await deleteRoutineTask(taskId, true);
                if (result.success) {

                  await removeSwitchState(taskId);
                  setSwitchStates(prev => {
                    const newStates = { ...prev };
                    delete newStates[taskId];
                    return newStates;
                  });
                } else {
                  Alert.alert('Erro', result.error || 'Não foi possível excluir a tarefa.');
                }
              }
            }
          ]
        );
      } else {

        Alert.alert(
          'Confirmar exclusão',
          'Tem certeza que deseja excluir esta tarefa?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Excluir', 
              style: 'destructive',
              onPress: async () => {
                const result = await deleteRoutineTask(taskId, true);
                if (result.success) {

                  await removeSwitchState(taskId);
                  setSwitchStates(prev => {
                    const newStates = { ...prev };
                    delete newStates[taskId];
                    return newStates;
                  });
                } else {
                  Alert.alert('Erro', result.error || 'Não foi possível excluir a tarefa.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao processar exclusão:', error);
      Alert.alert('Erro', 'Erro inesperado ao processar a exclusão.');
    }
  };

  const handleActivate = async (routineId: string) => {
    try {
      const currentState = switchStates[routineId] || false;
      const newState = !currentState;

      if (newState) {

        await setSwitchState(true, routineId);
        await activateRoutineTask(routineId);
      } else {

        await removeSwitchState(routineId);
        await deleteRoutineTask(routineId);
      }

      setSwitchStates(prev => ({
        ...prev,
        [routineId]: newState
      }));

    } catch (error) {
      console.error('Erro ao alterar estado da tarefa:', error);
      Alert.alert('Erro', 'Não foi possível alterar o estado da tarefa.');
    }
  };

  const renderLeftActions = (item: RoutineTask): React.ReactElement => {
    return (
      <View className="flex-row items-center justify-start border-t bg-rose-500 px-4 h-full" style={{ width: 80 }}>
        <TouchableOpacity
          className="flex-row items-center justify-center w-16 h-16 rounded-full"
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons className='ml-4' name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: RoutineTask }): React.ReactElement => {
    // Usando as funções helper do hook
    const completionCount = getCompletionCount(item);
    const totalXp = getTotalXpFromRoutine(item);
    
    try {
      const weekDays: WeekDay[] = JSON.parse(item.week_days || "[]");
      
      return (
        <Swipeable
          renderLeftActions={() => renderLeftActions(item)}
          leftThreshold={80}
          rightThreshold={40}
          overshootLeft={false}
          overshootRight={false}
          friction={1}
          containerStyle={{ backgroundColor: '#27272a' }}
          childrenContainerStyle={{ backgroundColor: '#27272a' }}
          enableTrackpadTwoFingerGesture={false}
        >
          <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 pt-4 bg-zinc-800">
            <View className="flex flex-row justify-between">
              <Pressable className="flex flex-col gap-1 flex-1" onPress={() => openModal(item)}>
                <View className="flex flex-row items-center gap-2">
                  <Text className="text-xl font-sans font-medium text-gray-300 flex-1">
                    {item.title}
                  </Text>
                </View>
                
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-neutral-400 text-sm font-sans">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Sem horário'}
                  </Text>
                  
                </View>
                
                <Text className="text-neutral-500 font-sans text-xs">
                  Recorrente em {weekDays.length} dias
                </Text>
              </Pressable>

              <View className='flex items-center justify-center'>
                <Switch
                 trackColor={{ true: "#ff7a7f" }}
                  thumbColor={ "#ffff"}
                  ios_backgroundColor="#3e3e3e"
                  value={switchStates[item.id] || false}
                  onValueChange={() => handleActivate(item.id)}
                />
              </View>

            </View>
          </View>
        </Swipeable>
      );
    } catch (error) {
      console.error('Erro ao renderizar item:', error);
      return (
        <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 pt-4 bg-zinc-800">
          <Text className="text-red-400 font-sans text-sm">Erro ao carregar tarefa</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-white font-sans text-lg">Carregando rotinas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-red-400 font-sans text-lg text-center mt-4">{error}</Text>
          <Pressable 
            onPress={() => getAllRoutineTasksByUserId(userId!)}
            className="mt-4 bg-rose-400 px-6 py-3 rounded-xl"
          >
            <Text className="text-black font-sans">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
      
      <Pressable
        onPress={() => openModal()}
        className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Feather name="plus" strokeWidth={3} size={32} color="black" />
      </Pressable>
      
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-1 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[17px]">Minha Rotina</Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16 }} 
        className="py-2 mt-[30px]"
        style={{ flexGrow: 0 }}
      >
        {days.map((day: string) => (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(day)}
            className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-[#ff7a7f]' : 'bg-zinc-700'}`}
          >
            <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>{day}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="flex-1 mt-4">
        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item: RoutineTask) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          <View className="flex items-center justify-center" style={{ paddingTop: 180 }}>
            <Ionicons name="calendar-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
              Nenhuma rotina para {selectedDay}
            </Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Crie novas tarefas para organizar sua rotina
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-[#1e1e1e] rounded-t-3xl p-6" style={{ minHeight: '50%' }}>
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={{ maxHeight: 300 }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nome da tarefa"
                    placeholderTextColor="#6b7280"
                    className="px-1 py-3 text-white text-2xl font-bold"
                  />
                </View>

                <View className="mb-2">
                  <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Detalhes da tarefa"
                    placeholderTextColor="#6b7280"
                    multiline
                    numberOfLines={3}
                    className="rounded-xl text-lg px-1 py-3 text-white font-normal"
                  />
                </View>

                <View className="mb-4">
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    className="px-2 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`font-bold text-2xl ${selectedTime ? 'text-white' : 'text-gray-400'}`}>
                      {selectedTime ||format( new Date().toISOString(), "HH:mm")}
                    </Text>
                  </Pressable>
                </View>

                <View className="mb-6 mt-2">
                  <View className="flex-row flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 0].map((dayNumber: number) => (
                      <Pressable
                        key={dayNumber}
                        onPress={() => toggleDayOfWeek(dayNumber)}
                        className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                          selectedDaysOfWeek.includes(dayNumber)
                            ? 'bg-[#ff7a7f]'
                            : 'bg-zinc-800'
                        }`}
                      >
                        <Text className={`font-sans ${
                          selectedDaysOfWeek.includes(dayNumber)
                            ? 'text-black'
                            : 'text-white'
                        }`}>
                          {getDayName(dayNumber)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex flex-row flex-wrap gap-2 mb-2">
                    {categories.map((cat: CategoryType) => {
                      const isSelected: boolean = selectedCategories.includes(cat);
                      const color: string = getCategoryColor(cat);

                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setSelectedCategories([cat])}
                          className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                            isSelected ? 'bg-rose-400' : 'bg-zinc-700/50'
                          }`}
                        >
                          <View 
                            style={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: 5, 
                              backgroundColor: color, 
                              borderWidth: 0.5, 
                              borderColor: '#fff' 
                            }} 
                          />
                          <Text 
                            className={`font-sans text-sm ${
                              isSelected ? 'text-black' : 'text-white'
                            }`}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

              </ScrollView>

              <View className={`${Platform.OS == 'ios' ? 'absolute bottom-[10%] self-center flex-row flex gap-3' : 'self-center flex-row flex gap-3'}`}>
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-zinc-800 rounded-xl py-4"
                >
                  <Text className="text-white font-sans text-center">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 bg-[#ff7a7f] rounded-xl py-4"
                >
                  <Text className="text-black font-sans text-center">
                    {editingTask ? 'Atualizar' : 'Salvar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          date={time}
          onConfirm={(selectedTimeDate: Date) => {
            setShowTimePicker(false);
            setTime(selectedTimeDate);
            
            const formattedTime: string = selectedTimeDate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            setSelectedTime(formattedTime);
          }}
          onCancel={() => setShowTimePicker(false)}
          textColor="#000000"
          accentColor="#ff7a7f"
          buttonTextColorIOS="#ff7a7f"
          themeVariant="light"
          locale="pt-BR"
          is24Hour
        />
      </Modal>
    </SafeAreaView>
  );
};

export default RoutineScreen;