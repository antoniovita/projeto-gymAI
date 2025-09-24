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
import { useRoutineTasks } from 'hooks/useRoutineTasks';
import { useAuth } from 'hooks/useAuth';
import { useTheme } from 'hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import {getSwitchState, removeSwitchState, setSwitchState} from "../../../helpers/switchHelper"
import { format } from 'date-fns';
import { RoutineTask } from 'api/types/routineTaskTypes';

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
  const { colors } = useTheme();
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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.deleteAction,
        paddingHorizontal: 16,
        height: '100%',
        width: 80
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 32
          }}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={24} color="white" style={{ marginLeft: 16 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: RoutineTask }): React.ReactElement => {
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
          containerStyle={{ backgroundColor: colors.background }}
          childrenContainerStyle={{ backgroundColor: colors.background }}
          enableTrackpadTwoFingerGesture={false}
        >
          <View style={{
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingHorizontal: 24,
            height: 90,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingTop: 16,
            backgroundColor: colors.secondary
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable 
                style={{ flexDirection: 'column', gap: 4, flex: 1 }} 
                onPress={() => openModal(item)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: colors.text,
                    flex: 1
                  }}>
                    {item.title}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 14
                  }}>
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Sem horário'}
                  </Text>
                </View>
                
                <Text style={{
                  color: colors.textMuted,
                  fontSize: 12
                }}>
                  Recorrente em {weekDays.length} dias
                </Text>
              </Pressable>

              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Switch
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={colors.border}
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
        <View style={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingHorizontal: 24,
          height: 90,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingTop: 16,
          backgroundColor: colors.secondary
        }}>
          <Text style={{ color: colors.deleteActionIcon, fontSize: 14 }}>
            Erro ao carregar tarefa
          </Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0
      }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18 }}>
            Carregando rotinas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0
      }}>
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center', 
          paddingHorizontal: 16 
        }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.deleteAction} />
          <Text style={{ 
            color: colors.deleteAction, 
            fontSize: 18, 
            textAlign: 'center', 
            marginTop: 16 
          }}>
            {error}
          </Text>
          <Pressable 
            onPress={() => getAllRoutineTasksByUserId(userId!)}
            style={{
              marginTop: 16,
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12
            }}
          >
            <Text style={{ color: colors.onPrimary }}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? 30 : 0
    }}>
      
      <Pressable
        onPress={() => openModal()}
        style={{
          width: 50,
          height: 50,
          position: 'absolute',
          bottom: '6%',
          right: 24,
          zIndex: 20,
          borderRadius: 25,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Feather name="plus" strokeWidth={3} size={32} color={colors.onPrimary} />
      </Pressable>
      
      <View style={{
        marginTop: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={{ 
            marginLeft: 4, 
            color: colors.text, 
            fontSize: 16 
          }}>
            Voltar
          </Text>
        </Pressable>
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center'
        }}>
          <Text style={{ color: colors.text, fontSize: 17 }}>
            Minha Rotina
          </Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16 }} 
        style={{ paddingVertical: 8, marginTop: 30, flexGrow: 0 }}
      >
        {days.map((day: string) => (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: selectedDay === day ? colors.primary : colors.secondary
            }}
          >
            <Text style={{
              color: selectedDay === day ? colors.onPrimary : colors.text
            }}>
              {day}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1, marginTop: 16 }}>
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
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingTop: 180 
          }}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={{
              color: colors.textMuted,
              fontSize: 18,
              marginTop: 16,
              textAlign: 'center'
            }}>
              Nenhuma rotina para {selectedDay}
            </Text>
            <Text style={{
              color: colors.textMuted,
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center'
            }}>
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
            <View style={{
              backgroundColor: colors.modalBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              minHeight: '50%'
            }}>
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
                    placeholderTextColor={colors.textMuted}
                    style={{
                      paddingHorizontal: 4,
                      paddingVertical: 12,
                      color: colors.text,
                      fontSize: 24,
                      fontWeight: 'bold'
                    }}
                  />
                </View>

                <View style={{ marginBottom: 8 }}>
                  <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Detalhes da tarefa"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={{
                      borderRadius: 12,
                      fontSize: 18,
                      paddingHorizontal: 4,
                      paddingVertical: 12,
                      color: colors.text,
                      fontWeight: 'normal'
                    }}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={{
                      fontWeight: 'bold',
                      fontSize: 24,
                      color: selectedTime ? colors.text : colors.textMuted
                    }}>
                      {selectedTime || format(new Date(), "HH:mm")}
                    </Text>
                  </Pressable>
                </View>

                <View style={{ marginBottom: 24, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6, 0].map((dayNumber: number) => (
                      <Pressable
                        key={dayNumber}
                        onPress={() => toggleDayOfWeek(dayNumber)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: selectedDaysOfWeek.includes(dayNumber)
                            ? colors.primary
                            : colors.secondary
                        }}
                      >
                        <Text style={{
                          color: selectedDaysOfWeek.includes(dayNumber)
                            ? colors.onPrimary
                            : colors.text
                        }}>
                          {getDayName(dayNumber)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {categories.map((cat: CategoryType) => {
                      const isSelected: boolean = selectedCategories.includes(cat);
                      const color: string = getCategoryColor(cat);

                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setSelectedCategories([cat])}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: isSelected ? colors.primary : colors.secondary + '80'
                          }}
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
                            style={{
                              fontSize: 14,
                              color: isSelected ? colors.onPrimary : colors.text
                            }}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

              </ScrollView>

              <View style={{
                ...(Platform.OS === 'ios' ? {
                  position: 'absolute',
                  bottom: '10%',
                  alignSelf: 'center',
                  flexDirection: 'row',
                  gap: 12
                } : {
                  alignSelf: 'center',
                  flexDirection: 'row',
                  gap: 12
                })
              }}>
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.secondary,
                    borderRadius: 12,
                    paddingVertical: 16
                  }}
                >
                  <Text style={{ 
                    color: colors.text, 
                    textAlign: 'center' 
                  }}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16
                  }}
                >
                  <Text style={{
                    color: colors.onPrimary,
                    textAlign: 'center'
                  }}>
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
          accentColor={colors.primary}
          buttonTextColorIOS={colors.primary}
          themeVariant="light"
          locale="pt-BR"
          is24Hour
        />
      </Modal>
    </SafeAreaView>
  );
};

export default RoutineScreen;