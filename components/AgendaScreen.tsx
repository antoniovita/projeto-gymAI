import { useFocusEffect } from '@react-navigation/native';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, SafeAreaView, Alert, Animated, FlatList,
  Pressable, Modal, Dimensions, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Calendar } from 'react-native-calendars';
import { useTask } from '../hooks/useTask';
import { useRecurrentTaskDrafts } from '../hooks/useRecurrentTaskDrafts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from 'hooks/useAuth';
import { Task } from 'api/model/Task';
import RefreshButton from './comps/refreshButton';
import TaskModal from '../components/comps/TaskModal';
import CategoryModal from '../components/comps/CategoryModal';
import DeleteCategoryModal from '../components/comps/DeleteCategoryModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

  const LoadingSpinner = ({ visible }: { visible: boolean }) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
      if (visible) {

        Animated.parallel([
          Animated.timing(fadeValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        spinValue.setValue(0);
        spinAnimation.current = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          })
        );
        spinAnimation.current.start();
      } else {
        Animated.parallel([
          Animated.timing(fadeValue, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        spinAnimation.current?.stop();
      }
    }, [visible]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View
          style={{
            opacity: fadeValue,
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,
            height: height,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleValue }],
              backgroundColor: 'rgba(28, 28, 30, 0.9)',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 120,
              minHeight: 120,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
                marginBottom: 12,
              }}
            >
              <Feather name="loader" size={32} color="#ff7a7f" />
            </Animated.View>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Poppins',
              textAlign: 'center',
              opacity: 0.9,
            }}>
              Carregando...
            </Text>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

const EmptyState = ({ dateFilter, onCreateTask }: { dateFilter: Date, onCreateTask: () => void }) => {
  const getDayOfWeek = (date: Date) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dayNames[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <View className="flex-1 justify-center items-center px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full  items-center justify-center mb-3">
          <Ionicons name="calendar-outline" size={60} color="gray" />
        </View>

        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma tarefa {isToday(dateFilter) ? 'hoje' : `para ${getDayOfWeek(dateFilter).toLowerCase()}`}
        </Text>

        <Text
          className="text-neutral-400 text-sm font-sans mb-4 text-center"
          style={{ maxWidth: 230 }}
        >
          Crie novas tarefas para organizar sua rotina
        </Text>
      </View>
    </View>
  );
};

const SwipeableTaskItem = ({ 
  item, 
  onEdit, 
  onToggleCompletion, 
  onDelete 
}: { 
  item: Task, 
  onEdit: (task: Task) => void, 
  onToggleCompletion: (taskId: string, completed: 0 | 1) => void,
  onDelete: (taskId: string) => void
}) => {
  let swipeableRow: any;

  const closeSwipeable = () => {
    swipeableRow?.close();
  };

  const renderLeftActions = () => (
    <TouchableOpacity
      onPress={() => {
      closeSwipeable();
      onDelete(item.id);
      }}
      style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f43f5e',
      width: 80,
      height: '100%',
      }}
    >
      <Ionicons name="trash" size={24} color="white" />
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
                <Text className={`text-xl font-sans font-medium max-w-[300px] line-clamp-1 ${item.completed ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                  {item.title}
                </Text>
              </View>
              <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {format(new Date(item.datetime), 'dd/MM/yyyy')}  - {format(new Date(item.datetime), 'HH:mm')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onToggleCompletion(item.id, item.completed)}
              className={`w-[25px] h-[25px] mt-4 border rounded-lg ${item.completed ? 'bg-rose-500' : 'border-2 border-neutral-600'}`}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              {item.completed ? <Ionicons name="checkmark" size={20} color="white" /> : null}
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

export default function AgendaScreen() {

  const { userId } = useAuth()
  
  const {
    tasks,
    createTask,
    updateTask,
    debugAllTasks,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
  } = useTask();

  const { tasksFromDraftDay, loading: draftLoading, loadAll } = useRecurrentTaskDrafts();

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
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

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingDrafts, setIsProcessingDrafts] = useState(false);

  const categories = Array.from(
    new Set([
      ...tasks
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
    const isCategoryInUse = tasks.some(task =>
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

  useEffect(() => {
    debugAllTasks();
  }, []);

  const processTasksForDate = async (targetDate: Date) => {
    if (!userId) {
      console.log('UserId não disponível, pulando processamento de drafts');
      return;
    }

    try {
      setIsProcessingDrafts(true);
      console.log('=== INICIANDO PROCESSAMENTO DE DRAFTS ===');
      console.log('Data alvo:', format(targetDate, 'yyyy-MM-dd'));
      console.log('UserId:', userId);

      await loadAll();
      await tasksFromDraftDay(userId, targetDate);
      
      console.log('Drafts processados, atualizando tasks...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchTasks(userId);
      
      console.log('=== PROCESSAMENTO DE DRAFTS CONCLUÍDO ===');
    } catch (error) {
      console.error('Erro ao processar drafts:', error);
      Alert.alert('Erro', 'Falha ao processar tarefas recorrentes');
    } finally {
      setIsProcessingDrafts(false);
    }
  };

  const filterTasks = async (filterDate: Date) => {
    try {
      setIsLoading(true);

      await processTasksForDate(filterDate);

      const filtered = tasks.filter(task => {
        if (!task.datetime) return false;
        const taskDate = parseISO(task.datetime);
        const types = task.type?.split(',').map(t => t.trim()) || [];
        const categoryMatches =
          selectedTypes.length === 0 || selectedTypes.some(cat => types.includes(cat));
        return isSameDay(taskDate, filterDate) && categoryMatches;
      });

      setFilteredTasks(filtered);
      console.log(`Filtradas ${filtered.length} tasks para ${format(filterDate, 'dd/MM/yyyy')}`);
    } catch (error) {
      console.error('Erro ao filtrar tasks:', error);
      Alert.alert('Erro', 'Falha ao filtrar tarefas');
    } finally {
      setIsLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        if (!userId) return;

        try {
          setIsLoading(true);
          console.log('=== CARREGAMENTO INICIAL DA AGENDA ===');
          
          await fetchTasks(userId);
          await filterTasks(new Date());
          
          console.log('=== CARREGAMENTO INICIAL CONCLUÍDO ===');
        } catch (error) {
          console.error('Erro no carregamento inicial:', error);
          Alert.alert('Erro', 'Falha ao carregar dados iniciais');
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialData();
    }, [tasks])
  );

  useEffect(() => {
    if (tasks.length > 0) {
      const filtered = tasks.filter(task => {
        if (!task.datetime) return false;

        const taskDateISO = task.datetime.split('T')[0];
        const selectedDateISO = dateFilter.toISOString().split('T')[0];

        const types = task.type?.split(',').map(t => t.trim()) || [];
        const categoryMatches =
          selectedTypes.length === 0 || selectedTypes.some(cat => types.includes(cat));

        return taskDateISO === selectedDateISO && categoryMatches;
      });

      setFilteredTasks(filtered);
    }
  }, [tasks, dateFilter, selectedTypes]);

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
        await updateTask(selectedTask.id, {
          title: newTaskTitle,
          content: taskContent,
          type: categoriesString,
          datetime: datetimeISO,
        });
      } else {
        await createTask(
          newTaskTitle,
          taskContent,
          datetimeISO, 
          userId!,
          categoriesString
        );
      }

      await fetchTasks(userId!);
      resetModal();
    } catch (err) {
      console.error('[handleSaveTask] Erro:', err);
      Alert.alert('Erro', 'Falha ao salvar tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (task: any) => {
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

  const toggleTaskCompletion = async (taskId: string, completed: 0 | 1) => {
    try {
      await updateTaskCompletion(taskId, completed === 0 ? 1 : 0);
      await fetchTasks(userId!);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const resetModal = () => {
    setIsCreateVisible(false);
    setNewTaskTitle('');
    setSelectedCategories([]);
    setSelectedTask(null);
    setTaskContent('');
    setDate(new Date());
    setTime(new Date());
  };

  const handleCreateTaskFromEmpty = () => {
    resetModal();
    setDate(dateFilter);
    setTime(new Date());
    setIsCreateVisible(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (!taskToDelete) {
      Alert.alert('Erro', 'Tarefa não encontrada.');
      return;
    }

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
              await deleteTask(taskId);
              await fetchTasks(userId!);
              await filterTasks(dateFilter);
              setFilteredTasks(prev => prev.filter(task => task.id !== taskId));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRefresh = async () => {
    if (userId) {
      await filterTasks(dateFilter);
      console.log(dateFilter)
    }
  };

  // Estado para controlar a semana atual
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });

  // Função para gerar os 7 dias da semana atual
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Função para ir para a semana anterior
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Função para ir para a próxima semana
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Função para verificar se um dia tem tarefas
  const dayHasTasks = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.some(task => task.datetime && task.datetime.split('T')[0] === dateString);
  };

  // Função para verificar se é o dia selecionado
  const isSelectedDay = (date: Date) => {
    return date.toDateString() === dateFilter.toDateString();
  };

  // Função para verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Função para selecionar um dia
  const onDaySelect = async (date: Date) => {
    setDateFilter(date);
    
    if (userId) {
      await filterTasks(date);
    }
  };

  const isCurrentlyLoading = isLoading || isSaving || isProcessingDrafts || draftLoading;

  const renderTaskItem = ({ item }: { item: Task }) => (
    <SwipeableTaskItem
      item={item}
      onEdit={handleOpenEdit}
      onToggleCompletion={toggleTaskCompletion}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      <LoadingSpinner visible={isCurrentlyLoading} />

      <Pressable
        onPress={() => {
          resetModal();
          setIsCreateVisible(true);
        }}
        className="w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={32} color="black" />
      </Pressable>

      {/* Header */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Agenda</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={handleRefresh}>
            <Ionicons name="refresh-circle" size={26} color="#ff7a7f" />
          </Pressable>
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <Ionicons name="folder" size={22} color="#ff7a7f" />
          </Pressable>
        </View>
      </View>

      {/* Calendar Section */}
      <View className="px-4 mb-4">
        <View className="bg-[#35353a] border border-neutral-600 rounded-xl overflow-hidden">
          <View className="flex-row items-center px-6 py-3 border-b border-neutral-600">
            <Text className="text-white text-base font-sans">
              {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR })}
            </Text>
          </View>

          {/* Headers dos dias da semana */}
          <View className="flex-row justify-around py-2 border-b border-neutral-700">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} className="text-neutral-400 text-xs font-sans text-center w-10">
                {day}
              </Text>
            ))}
          </View>

          {/* Linha dos 7 dias com setas */}
          <View className="flex-row items-center py-3">
            {/* Seta esquerda */}
            <Pressable onPress={goToPreviousWeek} className="px-3">
              <Ionicons name="chevron-back" size={20} color="#ff7a7f" />
            </Pressable>

            {/* Os 7 dias */}
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
                      selected ? 'bg-[#ff7a7f]' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-sm font-sans ${
                      selected ? 'text-black font-bold' : 
                      today ? 'text-[#ff7a7f] font-medium' : 
                      'text-white'
                    }`}>
                      {day.getDate()}
                    </Text>
                    {hasTasks && !selected && (
                      <View className="w-1 h-1 bg-[#ff7a7f] rounded-full absolute bottom-0" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Seta direita */}
            <Pressable onPress={goToNextWeek} className="px-3">
              <Ionicons name="chevron-forward" size={20} color="#ff7a7f" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Categories Filter */}
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
              className={`flex-row items-center gap-2 px-3 py-1.5 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-zinc-700'}`}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff',}} />
              <Text className={`${isSelected ? 'text-black' : 'text-white'} text-sm font-sans`}>{cat}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setIsCategoryModalVisible(true)}
          className="flex-row items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-700"
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