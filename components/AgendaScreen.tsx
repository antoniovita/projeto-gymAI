import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, Alert, FlatList,
  Pressable, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTask } from '../hooks/useTask';
import { useRoutineTasks } from '../hooks/useRoutineTasks';
import { useStats } from '../hooks/useStats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from 'hooks/useAuth';
import { RoutineTask } from 'api/model/RoutineTasks';
import TaskModal from './comps/modals/TaskModal';
import CategoryModal from './comps/modals/CategoryModal';
import DeleteCategoryModal from './comps/modals/DeleteCategoryModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoadingSpinner from './comps/LoadingSpinner';
import { EmptyState } from './comps/EmptyState';
import LevelUpModal from './comps/modals/LevelUpModal';
import GradientIcon from './GradientIcon';
import { LinearGradient } from 'expo-linear-gradient';

interface UnifiedTask {
  id: string;
  title: string;
  content?: string;
  datetime: string;
  completed: 0 | 1;
  type?: string;
  isRoutine: boolean;
  routineId?: string;
  originalWeekDays?: string[];
  targetDate?: string; 
}

const SwipeableTaskItem = ({ 
  item, 
  onEdit, 
  onToggleCompletion, 
  onDelete 
}: { 
  item: UnifiedTask, 
  onEdit: (task: UnifiedTask) => void, 
  onToggleCompletion: (taskId: string, completed: 0 | 1, isRoutine?: boolean, routineId?: string, targetDate?: string) => void,
  onDelete: (taskId: string, date: string, isRoutine?: boolean, routineId?: string) => void
}) => {
  let swipeableRow: any;

  const closeSwipeable = () => {
    swipeableRow?.close();
  };

  const renderLeftActions = () => (
    <TouchableOpacity
      onPress={() => {
        closeSwipeable();
        onDelete(item.id, item.datetime.split("T")[0], item.isRoutine, item.routineId);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fa4343",
        width: 100,
        height: '100%',
      }}
    >
      <Ionicons name="trash" size={25} color="white" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={(ref: any) => { swipeableRow = ref; }}
        renderLeftActions={renderLeftActions}
        leftThreshold={40}
        friction={1}
        overshootLeft={false}
      >
        <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
          <View className="flex flex-row justify-between">
            <Pressable className="flex flex-col gap-1 mt-1" onPress={() => onEdit(item)}>
              <View className="flex flex-row items-center gap-2">
                <Text className={`text-xl font-sans font-medium max-w-[260px] line-clamp-1 ${item.completed ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                  {item.title}
                </Text>
                {item.isRoutine && (
                  <View className="bg-[#ffa41f] px-2 py-0.5 rounded-full">
                    <Text className="text-black text-[10px] font-sans">rotina</Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {format(new Date(item.datetime), 'dd/MM/yyyy')} - {format(new Date(item.datetime), 'HH:mm')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onToggleCompletion(item.id, item.completed, item.isRoutine, item.routineId, item.targetDate)}
              className={`w-[25px] h-[25px] mt-4 rounded-lg ${item.completed ? 'bg-[#ffa41f]' : 'border-2 border-neutral-600'}`}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              {item.completed ? <Ionicons name="checkmark" size={20} color="black" /> : null}
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

export default function AgendaScreen() {

  const { userId } = useAuth();
  
  const {
    tasks,
    createTask,
    updateTask,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
  } = useTask();

  const {
    routineTasks,
    loading: routineLoading,
    error: routineError,
    refreshRoutineTasks,
    completeRoutineTaskForDate,
    uncompleteRoutineTaskForDate,
    cancelRoutineTaskForDate,
    updateRoutineTask,
    isCompletedOnDate,
    isCancelledOnDate, 
  } = useRoutineTasks();

  const { 
    userStats, 
    loadUserStats, 
    addExperience, 
    currentLevel, 
    currentXp 
  } = useStats();
  
  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState({
    previousLevel: 1,
    newLevel: 1,
    xpGained: 0
  });

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [taskContent, setTaskContent] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  const [extraCategories, setExtraCategories] = useState<{ name: string; color: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [dateFilter, setDateFilter] = useState(new Date());

  const [filteredTasks, setFilteredTasks] = useState<UnifiedTask[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isRoutineCompletedOnDate = useCallback((routine: RoutineTask, targetDate: Date): boolean => {
    const targetDateString = format(targetDate, 'yyyy-MM-dd');
    return isCompletedOnDate(routine, targetDateString);
  }, [isCompletedOnDate]);

  const convertRoutineToUnifiedTask = useCallback((routine: RoutineTask, targetDate: Date): UnifiedTask | null => {
    const targetDateString = format(targetDate, 'yyyy-MM-dd');
    
    if (isCancelledOnDate(routine, targetDateString)) {
      console.log(`Data ${targetDateString} cancelada para routine ${routine.id} - pulando`);
      return null;
    }

    const routineDateTime = new Date(targetDate);
    if (routine.created_at) {
      const originalTime = new Date(routine.created_at);
      routineDateTime.setHours(originalTime.getHours());
      routineDateTime.setMinutes(originalTime.getMinutes());
    } else {
      routineDateTime.setHours(9, 0, 0, 0);
    }

    const isCompleted = isRoutineCompletedOnDate(routine, targetDate);

    let weekDays: string[] = [];
    try {
      weekDays = JSON.parse(routine.week_days || '[]');
    } catch (error) {
      console.error('Erro ao parse week_days:', error);
    }

    return {
      id: `routine_${routine.id}_${targetDateString}`,
      title: routine.title,
      content: routine.content,
      datetime: routineDateTime.toISOString(),
      completed: isCompleted ? 1 : 0,
      type: routine.type,
      isRoutine: true,
      routineId: routine.id,
      originalWeekDays: weekDays,
      targetDate: targetDateString
    };
  }, [isRoutineCompletedOnDate, isCancelledOnDate]);

  const dayNameToNumber: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'domingo': 0,
    'segunda': 1,
    'terca': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 3);
    return startOfWeek;
  });

  const getUnifiedTasks = useCallback((): UnifiedTask[] => {
    const normalTasks: UnifiedTask[] = tasks.map(task => ({
      ...task,
      isRoutine: false
    }));

    const routineUnifiedTasks: UnifiedTask[] = [];

    routineTasks.forEach((routine: RoutineTask) => {
      if (!routine.week_days || routine.is_active === 0) return;

      let weekDays: string[] = [];
      try {
        weekDays = JSON.parse(routine.week_days);
      } catch (error) {
        console.error('Erro ao parse week_days:', error);
        return;
      }

      if (weekDays.length === 0) return;

      const startDate = new Date(currentWeekStart);
      startDate.setDate(startDate.getDate() - 7); 
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 14); 

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay(); // 0 = domingo, 1 = segunda, etc.
        
        const shouldShowOnThisDay = weekDays.some(dayName => {
          const dayNumber = dayNameToNumber[dayName.toLowerCase()];
          return dayNumber === dayOfWeek;
        });
        
        if (shouldShowOnThisDay) {
          const unifiedTask = convertRoutineToUnifiedTask(routine, new Date(d));
          
          if (unifiedTask) {
            routineUnifiedTasks.push(unifiedTask);
          }
        }
      }
    });

    console.log(`Total unified tasks (após filtro de cancelados): ${normalTasks.length + routineUnifiedTasks.length}`);
    return [...normalTasks, ...routineUnifiedTasks];
  }, [tasks, routineTasks, currentWeekStart, convertRoutineToUnifiedTask]);

  useEffect(() => {
    if (routineError) {
      Alert.alert('Erro', routineError);
    }
  }, [routineError]);

  useEffect(() => {
    if (userId) {
      loadUserStats(userId);
    }
  }, [userId, loadUserStats]);

  useEffect(() => {
    const saveCurrentLevel = async () => {
      if (currentLevel > 1) {
        await AsyncStorage.setItem(`userLevel_${userId}`, currentLevel.toString());
      }
    };

    const checkLevelUp = async () => {
      if (!userId || currentLevel <= 1) return;

      try {
        const savedLevel = await AsyncStorage.getItem(`userLevel_${userId}`);
        const previousLevel = savedLevel ? parseInt(savedLevel) : 1;

        if (currentLevel > previousLevel) {
          setLevelUpData({
            previousLevel,
            newLevel: currentLevel,
            xpGained: currentXp - (previousLevel * 100) 
          });
          setIsLevelUpVisible(true);
          
          await AsyncStorage.setItem(`userLevel_${userId}`, currentLevel.toString());
        }
      } catch (error) {
        console.error('Erro ao verificar level up:', error);
      }
    };

    if (userId && userStats) {
      checkLevelUp();
      saveCurrentLevel();
    }
  }, [currentLevel, userId, userStats, currentXp]);

  const handleTaskCompletion = async (taskId: string, completed: 0 | 1, isRoutine: boolean = false, routineId?: string, targetDate?: string, xpReward: number = 50) => {
    try {
      if (isRoutine && routineId && targetDate) {
        if (completed === 0) {
          const result = await completeRoutineTaskForDate(routineId, targetDate, userId!, xpReward);
          
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Não foi possível completar a rotina.');
            return;
          }
          
          if (userId) {
            const expResult = await addExperience(userId, xpReward);
            
            if (expResult.data?.leveledUp) {
              setLevelUpData({
                previousLevel: expResult.data.previousLevel,
                newLevel: expResult.data.newLevel,
                xpGained: xpReward
              });
              setIsLevelUpVisible(true);
            }
          }
        } else {

          const result = await uncompleteRoutineTaskForDate(routineId, targetDate, userId!);
          
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Não foi possível descompletar a rotina.');
            return;
          }
        }
      } else {
        // Task normal
        await updateTaskCompletion(userId!, taskId, completed === 0 ? 1 : 0);
        
        if (completed === 0 && userId) {
          const result = await addExperience(userId, xpReward);
          
          if (result.data?.leveledUp) {
            setLevelUpData({
              previousLevel: result.data.previousLevel,
              newLevel: result.data.newLevel,
              xpGained: xpReward
            });
            setIsLevelUpVisible(true);
          }
        }
        await fetchTasks(userId!);
      }
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const allUnifiedTasks = getUnifiedTasks();

  const categories = Array.from(
    new Set([
      ...allUnifiedTasks
        .flatMap((task) => task.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0),
      ...extraCategories.map(cat => cat.name),
    ])
  );

  const getCategoryColor = (catName: string) => {
    const extraCat = extraCategories.find(c => c.name === catName);
    return extraCat ? extraCat.color : '#999999';
  };

  const handleAddCategory = () => {
    setExtraCategories(prev => [
      ...prev,
      { name: newCategoryName.trim(), color: newCategoryColor }
    ]);
    setNewCategoryName('');
    setNewCategoryColor('#EF4444'); 
    setIsCategoryModalVisible(false);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await AsyncStorage.getItem('extraCategories');
        if (stored) {
          setExtraCategories(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Erro ao carregar categorias extras:', err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('extraCategories', JSON.stringify(extraCategories));
      } catch (err) {
        console.error('Erro ao salvar categorias extras:', err);
      }
    };

    if (extraCategories.length > 0) {
      saveCategories();
    }
  }, [extraCategories]);

  const handleDeleteCategory = (categoryName: string) => {
    const isCategoryInUse = allUnifiedTasks.some(task =>
      task.type?.split(',').map((t: string) => t.trim()).includes(categoryName)
    );

    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais tarefas e não pode ser excluída.');
      return;
    }

    setExtraCategories((prev) =>
      prev.filter((cat) => cat.name !== categoryName)
    );
  };

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        if (!userId) return;
        try {
          setIsLoading(true);
          console.log('=== CARREGAMENTO INICIAL DA AGENDA ===');
          await Promise.all([
            fetchTasks(userId),
            refreshRoutineTasks(userId),
            loadUserStats(userId)
          ]);
          console.log('=== CARREGAMENTO INICIAL CONCLUÍDO ===');
        } catch (error) {
          console.error('Erro no carregamento inicial:', error);
          Alert.alert('Erro', 'Falha ao carregar dados iniciais');
        } finally {
          setIsLoading(false);
        }
      };
      loadInitialData();
    }, [userId, refreshRoutineTasks])
  );

  useEffect(() => {
    const unified = getUnifiedTasks();
    
    if (unified.length === 0) {
      setFilteredTasks([]);
      return;
    }

    const filtered = unified.filter(task => {
      if (!task.datetime) return false;

      const taskDateISO = task.datetime.split('T')[0];
      const selectedDateISO = dateFilter.toISOString().split('T')[0];
      
      if (taskDateISO !== selectedDateISO) return false;
      if (selectedTypes.length === 0) return true;
    
      const types = task.type?.split(',').map(t => t.trim()) || [];
      return selectedTypes.some(cat => types.includes(cat));
    });

    setFilteredTasks(filtered);
    console.log(`Filtro local: ${filtered.length} tasks para ${format(dateFilter, 'dd/MM/yyyy')} (sem cancelados)`);
  }, [getUnifiedTasks, dateFilter, selectedTypes]);

  const combineDateAndTime = (date: Date, time: Date): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Erro', 'O título não pode estar vazio.');
      return;
    }

    try {
      setIsSaving(true);
      const categoriesString = selectedCategories.join(', ');
      const combinedDateTime = combineDateAndTime(date, time);
      const datetimeISO = combinedDateTime.toISOString();

      if (selectedTask) {
        if (selectedTask.isRoutine && selectedTask.routineId) {

          const result = await updateRoutineTask(
            selectedTask.routineId,
            newTaskTitle,
            taskContent,
            selectedTask.originalWeekDays,
            categoriesString,
            datetimeISO
          );
          
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Falha ao atualizar rotina.');
            return;
          }
        } else {

          await updateTask(selectedTask.id, {
            title: newTaskTitle,
            content: taskContent,
            type: categoriesString,
            datetime: datetimeISO,
          });
          await fetchTasks(userId!);
        }
      } else {

        await createTask(
          newTaskTitle,
          taskContent,
          datetimeISO, 
          userId!,
          categoriesString
        );
        await fetchTasks(userId!);
      }

      resetModal();
    } catch (err) {
      console.error('[handleSaveTask] Erro:', err);
      Alert.alert('Erro', 'Falha ao salvar tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (task: UnifiedTask) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setTaskContent(task.content || '');
    const parsedCategories = task.type
      ? task.type.split(',').map((cat: string) => cat.trim())
      : [];
    setSelectedCategories(parsedCategories);

    if (task.datetime) {
      const dateObj = new Date(task.datetime);
      setDate(dateObj);
      setTime(dateObj);
    } else {
      setDate(new Date());
      setTime(new Date());
    }

    setIsCreateVisible(true);
  };

  const toggleTaskCompletion = async (taskId: string, completed: 0 | 1, isRoutine?: boolean, routineId?: string, targetDate?: string) => {
    await handleTaskCompletion(taskId, completed, isRoutine, routineId, targetDate);
  };

  const resetModal = () => {
    setIsCreateVisible(false);
    setNewTaskTitle('');
    setSelectedCategories([]);
    setSelectedTask(null);
    setTaskContent('');
    setDate(dateFilter);
    setTime(new Date());
  };

  const handleCreateTaskFromEmpty = () => {
    resetModal();
    setDate(dateFilter);
    setTime(new Date());
    setIsCreateVisible(true);
  };

  const handleDeleteTask = (taskId: string, date: string, isRoutine?: boolean, routineId?: string) => {
    const taskToDelete = allUnifiedTasks.find(task => task.id === taskId);
    
    if (!taskToDelete) {
      Alert.alert('Erro', 'Tarefa não encontrada.');
      return;
    }

    const alertTitle = isRoutine ? 'Confirmar exclusão da rotina' : 'Confirmar exclusão';
    const alertMessage = 'Tem certeza que deseja deletar essa tarefa?';

    Alert.alert(
      alertTitle,
      alertMessage,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            if (isRoutine && routineId) {
              const result = await cancelRoutineTaskForDate(routineId, date);
              if (!result.success) {
                Alert.alert('Erro', result.error || 'Não foi possível deletar a rotina.');
                return;
              }
            } else {
              await deleteTask(taskId);
              await fetchTasks(userId!);
            }
            setFilteredTasks(prev => prev.filter(task => task.id !== taskId));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRefresh = async () => {
    if (userId) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 150);
      await Promise.all([
        fetchTasks(userId),
        refreshRoutineTasks(userId)
      ]);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 3);
    setCurrentWeekStart(startOfWeek);
  };

  const dayHasTasks = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return allUnifiedTasks.some(task => task.datetime && task.datetime.split('T')[0] === dateString);
  };

  const isSelectedDay = (date: Date) => {
    return date.toDateString() === dateFilter.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const onDaySelect = async (date: Date) => {
    setDateFilter(date);
    setDate(date);    
    if (userId) {
      await Promise.all([
        fetchTasks(userId),
        refreshRoutineTasks(userId)
      ]);
    }
  };

  const isCurrentlyLoading = isLoading || isSaving || routineLoading;

  const renderTaskItem = ({ item }: { item: UnifiedTask }) => (
    <SwipeableTaskItem
      item={item}
      onEdit={handleOpenEdit}
      onToggleCompletion={toggleTaskCompletion}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>

      <LevelUpModal
        visible={isLevelUpVisible}
        currentLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        onClose={() => setIsLevelUpVisible(false)}
        title="Excelente!"
      />
      <LoadingSpinner visible={isCurrentlyLoading} />

      <Pressable
        className="absolute bottom-6 right-6 z-20 rounded-full items-center justify-center"
        onPress={() => {
          resetModal();
          setIsCreateVisible(true);
        }}
      >
       <LinearGradient
          colors={['#FFD45A', '#FFA928', '#FF7A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "100%"}}
          >
        <Feather name="plus" strokeWidth={3} size={32} color="black" />
      </LinearGradient>
      </Pressable>

      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Agenda</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          <Pressable onPress={goToCurrentWeek}>
            <GradientIcon name="today" size={22} />
          </Pressable>
          <Pressable onPress={handleRefresh}>
            <GradientIcon name="refresh-circle" size={26} />
          </Pressable>
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <GradientIcon name="folder" size={22} />
          </Pressable>
        </View>
      </View>

      <View className="px-4 mb-4">
        <View className="bg-[#35353a] rounded-xl overflow-hidden">
          <View className="flex-row items-center px-6 py-3 ">
            <Text className="text-white text-base font-sans">
              {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())}
            </Text>
          </View>

          <View className="flex-row justify-around py-2 bg-zinc-800/80">
            {getWeekDays().map((day, index) => {
              const dayLetter = format(day, 'EEEEE', { locale: ptBR }).toUpperCase();
              return (
                <Text key={index} className="text-neutral-400 text-xs font-sans text-center w-10">
                  {dayLetter}
                </Text>
              );
            })}
          </View>

          <View className="flex-row items-center py-3">
            <Pressable onPress={goToPreviousWeek} className="px-3">
              <Ionicons name="chevron-back" size={20} color="#ffa41f" />
            </Pressable>

            <View className="flex-1 flex-row justify-around">
              {getWeekDays().map((day, index) => {
                const selected = isSelectedDay(day);
                const today = isToday(day);
                const hasTasks = dayHasTasks(day);
                return (
                  <Pressable
                    key={index}
                    onPress={() => onDaySelect(day)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      selected ? 'bg-[#ffa41f]' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-sm font-sans ${
                      selected ? 'text-black font-bold' :
                      today ? 'text-[#ffa41f] font-medium' :
                      'text-white'
                    }`}>
                      {day.getDate()}
                    </Text>
                    {hasTasks && !selected && (
                      <View className="w-1 h-1 bg-[#ffa41f] rounded-full absolute bottom-0" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={goToNextWeek} className="px-3">
              <Ionicons name="chevron-forward" size={20} color="#ffa41f" />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="flex flex-row flex-wrap gap-2 px-4 pb-4">
        {categories.map((cat) => {
          const isSelected = selectedTypes.includes(cat);
          const color = getCategoryColor(cat);

          return (
            <Pressable
              key={cat}
              onPress={() =>
                setSelectedTypes((prev) =>
                  prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                )
              }
              className={`flex-row items-center gap-2 px-2 py-1 rounded-xl ${isSelected ? 'bg-[#ffa41f]' : 'bg-zinc-700'}`}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff',}} />
              <Text className={`font-sans text-sm ${isSelected ? 'text-black' : 'text-white'}`}>{cat}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setIsCategoryModalVisible(true)}
          className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-zinc-700"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-sm font-sans">Nova Categoria</Text>
        </Pressable>
      </View>

      {filteredTasks.length === 0 ? (
        <EmptyState dateFilter={dateFilter} onCreateTask={handleCreateTaskFromEmpty} />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TaskModal
        isVisible={isCreateVisible}
        onClose={resetModal}
        onSave={handleSaveTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        taskContent={taskContent}
        setTaskContent={setTaskContent}
        date={date}
        time={time}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
        setDate={setDate}
        setTime={setTime}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        getCategoryColor={getCategoryColor}
      />

      <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
        onAddCategory={handleAddCategory}
        extraCategories={extraCategories}
      />

      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={categories}
        getCategoryColor={getCategoryColor}
        onDeleteCategory={handleDeleteCategory}
      />
    </SafeAreaView>
  );
}