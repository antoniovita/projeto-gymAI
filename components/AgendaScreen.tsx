import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,  Alert, Animated, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../hooks/useTask';
import { useRecurrentTaskDrafts } from '../hooks/useRecurrentTaskDrafts';
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { useAuth } from 'hooks/useAuth';
import { Task } from 'api/model/Task';
import RefreshButton from './comps/refreshButton';
import TaskModal from '../components/comps/TaskModal';
import CategoryModal from '../components/comps/CategoryModal';
import DeleteCategoryModal from '../components/comps/DeleteCategoryModal';

const LoadingSpinner = ({ visible }: { visible: boolean }) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;
  const scaleValue = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      // Fade in com scale
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

      // Rotação suave e contínua
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => {
        spinAnimation.stop();
      };
    } else {
      // Fade out com scale
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
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View 
      style={{
        opacity: fadeValue,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
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
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: 'transparent',
            borderTopColor: '#ff7a7f',
            borderRightColor: '#ff7a7f',
          }} />
        </Animated.View>
        <Text style={{
          color: 'white',
          fontSize: 16,
          fontWeight: '500',
          textAlign: 'center',
          opacity: 0.9,
        }}>
          Carregando...
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const ListLoadingSpinner = () => {
  const pulseValue = React.useRef(new Animated.Value(0)).current;
  const scaleValue = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.98,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const opacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <View className="flex-1 justify-center items-center py-20">
      <Animated.View 
        style={{ 
          opacity,
          transform: [{ scale: scaleValue }],
        }} 
        className="items-center"
      >
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(255, 122, 127, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Ionicons name="list" size={28} color="#ff7a7f" />
        </View>
        <Text className="text-white text-lg font-sans opacity-70">Carregando tarefas...</Text>
      </Animated.View>
    </View>
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

        {/* Título */}
        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma tarefa {isToday(dateFilter) ? 'hoje' : `para ${getDayOfWeek(dateFilter).toLowerCase()}`}
        </Text>

        {/* Subtítulo com data */}
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

export default function AgendaScreen() {
  const { userId } = useAuth();

  const {
    tasks,
    createTask,
    updateTask,
    debugAllTasks,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
  } = useTask();

  const { tasksFromDraftDay } = useRecurrentTaskDrafts();

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

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date());

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const fetchAllTasks = async () => {
          try {
            setIsLoading(true);
            await fetchTasks(userId); 
            setFilteredTasks(tasks); 
          } catch (err) {
            console.error('Erro ao buscar tarefas:', err);
            Alert.alert('Erro', 'Falha ao carregar tarefas');
          } finally {
            setIsLoading(false);
            setIsInitialLoading(false);
          }
        };
  
        fetchAllTasks();
      }
    }, [userId])
  );

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
      setIsLoading(true);
      await updateTaskCompletion(taskId, completed === 0 ? 1 : 0);
      await fetchTasks(userId!);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    } finally {
      setIsLoading(false);
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const filterTasksAndGenerateRecurrent = async (filterDate: Date) => {
    try {
      setIsLoading(true);
      await tasksFromDraftDay(userId!, filterDate);
      await sleep(500);
      await fetchTasks(userId!);

      const filtered = tasks.filter(task => {
        if (!task.datetime) return false;

        const taskDateISO = task.datetime.split('T')[0];
        const selectedDateISO = filterDate.toISOString().split('T')[0];

        const types = task.type?.split(',').map(t => t.trim()) || [];
        const categoryMatches =
          selectedTypes.length === 0 || selectedTypes.some(cat => types.includes(cat));

        return taskDateISO === selectedDateISO && categoryMatches;
      });

      setFilteredTasks(filtered);
    } catch (error) {
      console.error('Erro ao filtrar tasks e gerar recorrentes:', error);
      Alert.alert('Erro', 'Falha ao filtrar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !isInitialLoading) {
      filterTasksAndGenerateRecurrent(dateFilter);
    }
  }, [tasks, dateFilter, selectedTypes, userId, isInitialLoading]);

  const showAllTasks = async () => {
    setIsLoading(true);
    try {
      await fetchTasks(userId!);
      setFilteredTasks(tasks);
    } catch (error) {
      console.error('Erro ao buscar todas as tarefas:', error);
      Alert.alert('Erro', 'Falha ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  const showDatePickerDateFilter = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  
  const handleConfirm = async (date: Date) => {
    setDateFilter(date);
    hideDatePicker();
    
    if (userId) {
      await filterTasksAndGenerateRecurrent(date);
    }
  };

  const handleDeleteTask = (
    taskId: string,
    userId: string,
    deleteTask: (id: string) => Promise<boolean | void>,
    fetchTasks: (id: string) => Promise<void>
  ) => {

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
            try {
              setIsLoading(true);
              await deleteTask(taskId);
              await fetchTasks(userId);
            } catch (error) {
              console.error('Erro ao deletar tarefa:', error);
              Alert.alert('Erro', 'Falha ao deletar tarefa');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      {/* Loading Overlay */}
      <LoadingSpinner visible={isLoading || isSaving} />

      <TouchableOpacity
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
      </TouchableOpacity>

      <View className="flex flex-row items-center justify-between px-6 mt-[40px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Agenda</Text>

        <View className="flex flex-row items-center gap-[20px]">
          <TouchableOpacity onPress={showDatePickerDateFilter}>
            <Text className="text-white text-lg border rounded-lg w-[110px] text-center py-1 font-sans border-[#ff7a7f]">
              {format(dateFilter, 'dd/MM/yyyy')}
            </Text>
          </TouchableOpacity>

          <RefreshButton onPress={showAllTasks} />

          <TouchableOpacity onPress={() => setShowDeleteCategoryModal(true)}>
            <Ionicons name="options-outline" size={24} color="#ff7a7f" />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={dateFilter}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            textColor="#ff0000"
            accentColor="#ff7a7f"
            buttonTextColorIOS='#ff7a7f'
            themeVariant='light'
            display='inline'
            locale="pt-BR"
          />
        </View>
      </View>

      <View className=' flex flex-row flex-wrap gap-2 px-6 pb-3'>
        {categories.map((cat) => {
          const isSelected = selectedTypes.includes(cat);
          const color = getCategoryColor(cat);

          return (
            <TouchableOpacity
              key={cat}
              onPress={() =>
                setSelectedTypes((prev) =>
                  prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                )
              }
              className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
              <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{cat}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => setIsCategoryModalVisible(true)}
          className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-neutral-700"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-sm font-sans">Nova Categoria</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Tarefas com Loading e Empty State */}
      {isInitialLoading ? (
        <ListLoadingSpinner />
      ) : filteredTasks.length === 0 ? (
        <EmptyState dateFilter={dateFilter} onCreateTask={handleCreateTaskFromEmpty} />
      ) : (
        <SwipeListView
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
              <View className="flex flex-row justify-between">
                <TouchableOpacity className="flex flex-col gap-1 mt-1" onPress={() => handleOpenEdit(item)}>
                  <View className="flex flex-row items-center gap-2">
                    <Text className={`text-xl font-sans font-medium ${item.completed ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                      {item.title}
                    </Text>
                  </View>
                  <Text className="text-neutral-400 text-sm mt-1 font-sans">
                    {format(item.datetime, 'dd/MM/yyyy')}  - {format(item.datetime, 'HH:mm')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleTaskCompletion(item.id, item.completed)}
                  className={`w-[25px] h-[25px] mt-4 border rounded-lg ${item.completed ? 'bg-rose-500' : 'border-2 border-neutral-600'}`}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  {item.completed ? <Ionicons name="checkmark" size={20} color="white" /> : null}
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderHiddenItem={({ item }) => (
            <View className="w-full flex flex-col justify-center px-6 border-b border-neutral-700 bg-rose-500">
              <View className="flex flex-row justify-start items-center h-full">
                <TouchableOpacity
                  className="p-3"
                  onPress={() => handleDeleteTask(item.id, userId!, deleteTask, fetchTasks)}
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