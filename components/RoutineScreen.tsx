import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTask } from 'hooks/useTask';
import { useRoutine } from 'hooks/useRoutine';
import { useAuth } from 'hooks/useAuth';
import { SwipeListView } from 'react-native-swipe-list-view';
import { format } from 'date-fns';
import { Task } from 'api/model/Task';
import { useTaskRoutine } from 'hooks/useTaskRoutine';

export default function RoutineScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();

  const {
    tasks,
    fetchTasks,
    deleteTask,
  } = useTask();

  const { 
    linkRoutine,
    unlinkRoutine,
    fetchRoutines: fetchRoutinesForTask
  } = useTaskRoutine();

  const {
    routines,
    loading: routineLoading,
    fetchRoutines,
    createRoutine,
  } = useRoutine(userId || '');

  const [activeTab, setActiveTab] = useState<'agenda' | 'expenses'>('agenda');
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;
  type DayKey = typeof days[number];
  const [selectedDay, setSelectedDay] = useState<DayKey>(days[0]);
  const [expenseFilter, setExpenseFilter] = useState<'Gastos' | 'Ganhos'>('Gastos');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<typeof routines[0] | undefined>(undefined);
  const [routinesInitialized, setRoutinesInitialized] = useState(false);
  const [taskRoutinesMap, setTaskRoutinesMap] = useState<Record<string,string[]>>({});

  const dayMap = {
    'Segunda': 'monday',
    'Terça': 'tuesday', 
    'Quarta': 'wednesday',
    'Quinta': 'thursday',
    'Sexta': 'friday',
    'Sábado': 'saturday',
    'Domingo': 'sunday'
  };

  const initializeRoutines = async () => {
    if (!userId || routinesInitialized) return;

    try {
      console.log('Inicializando rotinas para usuário:', userId);
      await fetchRoutines();
      setRoutinesInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar rotinas:', error);
      setRoutinesInitialized(true);
    }
  };

  const createMissingRoutines = async (currentRoutines: typeof routines) => {
    try {
      const existingDays = currentRoutines.map(r => r.dayOfWeek);
      const daysInEnglish = Object.values(dayMap);
      const missingDays = daysInEnglish.filter(day => !existingDays.includes(day));
      
      if (currentRoutines.length >= 7 || missingDays.length === 0) {
        return;
      }
      
      const maxToCreate = Math.min(missingDays.length, 7 - currentRoutines.length);
      const daysToCreate = missingDays.slice(0, maxToCreate);
      
      console.log('Criando rotinas para os dias:', daysToCreate);
      
      for (const day of daysToCreate) {
        try {
          await createRoutine(day);
        } catch (error) {
          console.error(`Erro ao criar rotina para ${day}:`, error);
        }
      }
      
      await fetchRoutines();
    } catch (error) {
      console.error('Erro ao criar rotinas em falta:', error);
    }
  };

  // Effect principal para inicialização - apenas uma vez quando userId muda
  useEffect(() => {
    if (userId && !routinesInitialized) {
      initializeRoutines();
      fetchTasks(userId);
    }
  }, [userId]);

  // Effect separado para criar rotinas em falta quando as rotinas carregam
  useEffect(() => {
    if (routinesInitialized && routines.length > 0 && routines.length < 7) {
      createMissingRoutines(routines);
    }
  }, [routinesInitialized, routines.length]);

  // Effect para mapear task-routines - usando useCallback para estabilizar a função
  useEffect(() => {
    if (tasks.length === 0) {
      setTaskRoutinesMap({});
      return;
    }

    let isCancelled = false;

    const fetchTaskRoutinesMap = async () => {
      const map: Record<string,string[]> = {};
      try {
        for (const task of tasks) {
          if (isCancelled) return;
          const routineIds = await fetchRoutinesForTask(task.id);
          map[task.id] = routineIds;
        }
        if (!isCancelled) {
          setTaskRoutinesMap(map);
        }
      } catch (error) {
        console.error('Erro ao buscar rotinas das tasks:', error);
        if (!isCancelled) {
          setTaskRoutinesMap({});
        }
      }
    };

    fetchTaskRoutinesMap();

    return () => {
      isCancelled = true;
    };
  }, [tasks]);

  // Effect para atualizar rotina atual e tarefas filtradas
  useEffect(() => {
    if (selectedDay && routines.length > 0) {
      const dayInEnglish = dayMap[selectedDay];
      const routine = routines.find(r => r.dayOfWeek === dayInEnglish);
      setCurrentRoutine(routine);
    }
  }, [selectedDay, routines]);

  // Effect separado para filtrar tasks
  useEffect(() => {
    if (tasks) {
      setFilteredTasks(tasks);
    }
  }, [tasks]);

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar essa tarefa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              if (userId) {
                await fetchTasks(userId);
              }
            } catch (error) {
              console.error('Erro ao deletar tarefa:', error);
              Alert.alert('Erro', 'Não foi possível deletar a tarefa');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleToggleRoutineTask = async (task: Task) => {
    if (!currentRoutine) {
      Alert.alert('Erro', 'Rotina não encontrada para este dia');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    const inRoutine = taskRoutinesMap[task.id]?.includes(currentRoutine.id);
    
    try {
      if (inRoutine) {
        await unlinkRoutine(task.id, currentRoutine.id);
      } else {
        await linkRoutine(task.id, currentRoutine.id);
      }

      // Refetch das tasks e atualização do map
      await fetchTasks(userId);
      
      // Atualizar o map para esta task específica
      const updatedRoutines = await fetchRoutinesForTask(task.id);
      setTaskRoutinesMap(prevMap => ({ 
        ...prevMap, 
        [task.id]: updatedRoutines 
      }));

      console.log(`Tarefa "${task.title}" ${inRoutine ? 'removida de' : 'adicionada à'} rotina de ${selectedDay}`);
    } catch (error) {
      console.error('Erro ao atualizar rotina da tarefa:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a rotina da tarefa');
    }
  };

  const isTaskInRoutine = (task: Task): boolean => {
    return Boolean(
      currentRoutine &&
      taskRoutinesMap[task.id]?.includes(currentRoutine.id)
    );
  };

  // Contar tarefas na rotina atual
  const tasksInCurrentRoutine = filteredTasks.filter(task => isTaskInRoutine(task)).length;

  // Mock data para expenses (não implementado ainda)
  const expenseItems: any[] = [];
  const incomeItems: any[] = [];

  // Loading state
  if (routineLoading || !routinesInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-800 justify-center items-center">
        <Text className="text-white font-sans">Carregando rotinas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <View className="mt-5 px-4 flex-row items-center justify-between">
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>

        {/* Título Centralizado com position absolute */}
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[15px]">Minha Rotina</Text>
        </View>

        {/* Espaço invisível para alinhar visualmente */}
        <View style={{ width: 64 }} />
      </View>

      {/* Tabs: Expenses | Agenda */}
      <View className="flex-row mx-4 rounded-xl mt-[30px] overflow-hidden bg-neutral-800 border border-neutral-700">
        {['expenses', 'agenda'].map(tab => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 ${activeTab === tab ? 'bg-[#ff7a7f]' : ''}`}
            onPress={() => setActiveTab(tab as 'agenda' | 'expenses')}
          >
            <Text className={`text-center font-sans ${activeTab === tab ? 'text-black' : 'text-white'}`}>
              {tab === 'expenses' ? 'Expenses' : 'Agenda'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'agenda' ? (
        <View className="flex mt-4">
          {/* Day Scroll Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            className="py-2"
          >
            {days.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-[#ff7a7f]' : 'bg-neutral-700'}`}
              >
                <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Info sobre a rotina atual */}
          {currentRoutine && (
            <View className="mx-4 mb-2">
              <Text className="text-neutral-400 px-2 text-sm font-sans">
                Rotina de {selectedDay} • {tasksInCurrentRoutine} tarefas na rotina
              </Text>
            </View>
          )}

          {/* Agenda List */}
          {filteredTasks.length > 0 ? (
            <SwipeListView
              data={filteredTasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
                  <View className="flex flex-row justify-between">
                    <View className="flex flex-col gap-1 mt-1 flex-1 pr-4">
                      <Text className="text-xl font-sans font-medium text-gray-300">
                        {item.title}
                      </Text>
                      <Text className="text-neutral-400 text-sm mt-1 font-sans">
                        {item.datetime ? format(new Date(item.datetime), 'dd/MM/yyyy - HH:mm') : 'Sem data'}
                      </Text>
                      {item.content && (
                        <Text className="text-neutral-500 text-xs font-sans" numberOfLines={1}>
                          {item.content}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="absolute right-0 mr-4 z-20 flex items-center justify-center h-full">
                    <Switch
                      value={isTaskInRoutine(item)}
                      onValueChange={() => handleToggleRoutineTask(item)}
                      trackColor={{ false: '#767577', true: '#f43f5e' }}
                      thumbColor={isTaskInRoutine(item) ? '#ff7a7f' : '#f4f3f4'}
                    />
                  </View>
                </View>
              )}
              renderHiddenItem={({ item }) => (
                <View className="w-full flex flex-col justify-center px-6 h-[90px] border-b border-neutral-700 bg-rose-500">
                  <View className="flex flex-row justify-start items-center h-full">
                    <TouchableOpacity
                      className="p-3"
                      onPress={() => handleDeleteTask(item.id)}
                    >
                      <Ionicons name="trash" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              leftOpenValue={80}
              rightOpenValue={0}
              disableRightSwipe={false}
              disableLeftSwipe={true}
            />
          ) : (
            <View className="flex justify-center items-center px-4">
              <Ionicons name="calendar-outline" size={64} color="#6b7280" />
              <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
                Nenhuma tarefa encontrada
              </Text>
              <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
                Crie novas tarefas para organizar sua rotina de {selectedDay}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 mt-4">
          {/* Expenses Filter */}
          <View className="flex-row mx-6 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800">
            {['Gastos', 'Ganhos'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setExpenseFilter(type as 'Gastos' | 'Ganhos')}
                className={`flex-1 py-3 ${expenseFilter === type ? 'bg-white' : ''}`}
              >
                <Text className={`text-center font-sans ${expenseFilter === type ? 'text-black' : 'text-white'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expenses Placeholder */}
          <View className="flex justify-center items-center px-4">
            <Ionicons name="wallet-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
              Expenses em desenvolvimento
            </Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Esta funcionalidade será implementada em breve
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}