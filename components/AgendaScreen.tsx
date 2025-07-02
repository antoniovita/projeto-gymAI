import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../hooks/useTask';
import { useTaskCompletion } from 'hooks/useTaskCompletion';

import { useRoutine } from 'hooks/useRoutine';
import { useTaskRoutine } from 'hooks/useTaskRoutine';

import { SwipeListView } from 'react-native-swipe-list-view';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { useAuth } from 'hooks/useAuth';
import { Task } from 'api/model/Task';
import RefreshButton from './comps/refreshButton';



const colorOptions = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#EAB308', // Amarelo
  '#10B981', // Verde
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#F43F5E', // Rosa escuro
  '#6B7280', // Cinza
];

export default function AgendaScreen() {

  const { userId } = useAuth();

  const {
    tasks,
    createTask,
    updateTask,
    debugAllTasks,
    fetchTasks,
    deleteTask,
  } = useTask();
  
  const {
    markDone,
    unmarkDone,
    getDoneMap
  } = useTaskCompletion();

  
  const { routines, fetchRoutines } = useRoutine(userId!);
  const { fetchTasksForRoutine } = useTaskRoutine();


  const [taskRoutinesMap, setTaskRoutinesMap] = useState<Record<string,string[]>>({});

  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});


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
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [extraCategories, setExtraCategories] = useState<{ name: string; color: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date());

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]); // 

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
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (extraCategories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Erro', 'Essa categoria já existe.');
      return;
    }

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

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    const isCategoryInUse = tasks.some(task =>
      task.type?.split(',').map((t: string) => t.trim()).includes(categoryToDelete)
    );

    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais tarefas e não pode ser excluída.');
      setShowConfirmDeleteModal(false);
      setCategoryToDelete(null);
      return;
    }

    setExtraCategories((prev) =>
      prev.filter((cat) => cat.name !== categoryToDelete)
    );
    setShowConfirmDeleteModal(false);
    setCategoryToDelete(null);
  };

  useEffect(() => {
    debugAllTasks();
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const fetchAllTasks = async () => {
          try {
            await fetchTasks(userId); 
            setFilteredTasks(tasks); 
          } catch (err) {
            console.error('Erro ao buscar tarefas:', err);
          }
        };
  
        fetchAllTasks();
      }
    }, [userId, tasks])
  );

  useEffect(() => {
  if (!userId) return;
  (async () => {
    await fetchRoutines();
    // aqui você pode repetir a lógica do RoutineScreen
    // para criar missingDays (segunda…domingo) se ainda não existirem
  })();
}, [userId]);

useEffect(() => {
  if (tasks.length === 0 || routines.length === 0) {
    setTaskRoutinesMap({});
    return;
  }
  (async () => {
    const map: Record<string,string[]> = {};
    for (const t of tasks) {
      map[t.id] = await fetchTasksForRoutine(t.id);
    }
    setTaskRoutinesMap(map);
  })();
}, [tasks, routines]);


    useEffect(() => {
    if (!userId) return;
    (async () => {
      const dateKey = dateFilter.toISOString().split('T')[0];
      const doneList = await getDoneMap(userId, dateKey);
      // transforme a lista de IDs num mapa booleano
      const map: Record<string, boolean> = {};
      doneList.forEach(id => map[id] = true);
      setDoneMap(map);
    })();
  }, [tasks, dateFilter]);

  

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
      const categoriesString = selectedCategories.join(', ');

      const combinedDateTime = combineDateAndTime(date, time);
      const datetimeISO = combinedDateTime.toISOString(); // Exemplo: "2025-06-12T14:30:00.000Z"

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
    }
  };

  // Abre modal para editar, preenchendo os campos corretamente
  const handleOpenEdit = (task: any) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setTaskContent(task.content || '');
    const parsedCategories = task.type
      ? task.type.split(',').map((cat: string) => cat.trim())
      : [];
    setSelectedCategories(parsedCategories);

    // Parse datetime ISO para Date para preencher o date e time
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

  const handleToggleTaskCompletion = async (task: Task) => {
    const dateKey = dateFilter.toISOString().split('T')[0];
    const currentlyDone = Boolean(doneMap[task.id]);

    try {
      if (currentlyDone) {
        await unmarkDone(task.id, dateKey);
        console.log(`[handleToggleTaskCompletion] unmarked task ${task.id} on ${dateKey}`);
      } else {
        console.log(`[handleToggleTaskCompletion] marked task ${task.id} as done on ${dateKey}`);
        await markDone(task.id, dateKey);
      }
      // atualiza o mapa local imediatamente
      setDoneMap(m => ({ ...m, [task.id]: !currentlyDone }));
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa');
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


  // CORREÇÃO PRINCIPAL: Nova lógica para filtrar tarefas
  useEffect(() => {
    const selectedISO = dateFilter.toISOString().split('T')[0];
    const dayIdx = dateFilter.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado

    // 1) Tarefas agendadas especificamente para a data selecionada
    const tasksByDate = tasks.filter(t =>
      t.datetime?.split('T')[0] === selectedISO
    );

    // 2) Encontrar a rotina do dia da semana selecionado
    const todayRoutine = routines.find(r => r.day_of_week === dayIdx);
    
    // 3) Tarefas que estão vinculadas à rotina do dia
    const tasksByRoutine = todayRoutine
      ? tasks.filter(t => taskRoutinesMap[t.id]?.includes(todayRoutine.id))
      : [];

    // 4) Criar união das tarefas, evitando duplicatas usando IDs
    const taskIds = new Set<string>();
    const unionTasks: Task[] = [];

    // Adicionar tarefas por data
    tasksByDate.forEach(task => {
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        unionTasks.push(task);
      }
    });

    // Adicionar tarefas por rotina
    tasksByRoutine.forEach(task => {
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        unionTasks.push(task);
      }
    });

    // 5) Aplicar filtro de categoria se houver
    const filtered = unionTasks.filter(t => {
      if (selectedTypes.length === 0) return true;
      const types = t.type?.split(',').map(s => s.trim()) || [];
      return selectedTypes.some(cat => types.includes(cat));
    });

    // 6) Ordenar por horário
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.datetime || 0);
      const dateB = new Date(b.datetime || 0);
      return dateA.getTime() - dateB.getTime();
    });

    console.log(`[AgendaScreen] Data selecionada: ${selectedISO}, Dia da semana: ${dayIdx}`);
    console.log(`[AgendaScreen] Rotina encontrada:`, todayRoutine);
    console.log(`[AgendaScreen] Tarefas por data: ${tasksByDate.length}`);
    console.log(`[AgendaScreen] Tarefas por rotina: ${tasksByRoutine.length}`);
    console.log(`[AgendaScreen] Total após união: ${unionTasks.length}`);
    console.log(`[AgendaScreen] Após filtro de categoria: ${sorted.length}`);

    setFilteredTasks(sorted);
  }, [tasks, dateFilter, selectedTypes, routines, taskRoutinesMap]);

  // Função para mostrar todas as tarefas (ignorando filtro de data)
  const showAllTasks = () => {
    const dayIdx = dateFilter.getDay();
    const todayRoutine = routines.find(r => r.day_of_week === dayIdx);
    
    const tasksByRoutine = todayRoutine
      ? tasks.filter(t => taskRoutinesMap[t.id]?.includes(todayRoutine.id))
      : [];

    // União de todas as tarefas + tarefas da rotina do dia
    const taskIds = new Set<string>();
    const unionTasks: Task[] = [];

    // Adicionar todas as tarefas
    tasks.forEach(task => {
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        unionTasks.push(task);
      }
    });

    // Adicionar tarefas da rotina (se não estiverem já incluídas)
    tasksByRoutine.forEach(task => {
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        unionTasks.push(task);
      }
    });

    // Aplicar filtro de categoria
    const filtered = unionTasks.filter(t => {
      if (selectedTypes.length === 0) return true;
      const types = t.type?.split(',').map(s => s.trim()) || [];
      return selectedTypes.some(cat => types.includes(cat));
    });

    // Ordenar por data/horário
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.datetime || 0);
      const dateB = new Date(b.datetime || 0);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredTasks(sorted);
  };


  const showDatePickerDateFilter = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date: Date) => {
    setDateFilter(date);
    hideDatePicker();
  };


  const handleDeleteTask = (
    taskId: string,
    userId: string,
    deleteTask: (id: string) => Promise<boolean | void>,
    fetchTasks: (id: string) => Promise<void>
  ) => {
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
              await fetchTasks(userId);
            } catch (error) {
              console.error('Erro ao deletar tarefa:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  


  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
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



      <Modal
      transparent
      animationType="fade"
      visible={showDeleteCategoryModal}
      onRequestClose={() => setShowDeleteCategoryModal(false)}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-4">

          <ScrollView className="mb-4">
            {categories.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons name="folder-open-outline" size={64} color="#aaa" className="mb-4" />
                <Text className="text-neutral-400 text-center font-sans text-lg">
                  Você ainda não criou categorias.
                </Text>
              </View>
            ) : (
              categories.map((cat) => {
                const color = getCategoryColor(cat);

                return (
                  <View
                    key={cat}
                    className="flex-row justify-between items-center py-2 pb-3 border-b border-neutral-700"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 7.5,
                          backgroundColor: color,
                        }}
                      />
                      <Text className="text-white font-sans text-lg">{cat}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setCategoryToDelete(cat);
                        setShowConfirmDeleteModal(true);
                      }}
                      className="p-2 bg-neutral-700 rounded-xl"
                    >
                      <Ionicons name="trash" size={20} color="#fa4d5c" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setShowDeleteCategoryModal(false)}
            className="bg-neutral-700 rounded-xl p-3 items-center"
          >
            <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
          </TouchableOpacity>
        </View>

            <Modal
              transparent
              animationType="fade"
              visible={showConfirmDeleteModal}
              onRequestClose={() => setShowConfirmDeleteModal(false)}
            >
              <View className="flex-1 bg-black/80 justify-center items-center px-8">
                <View className="bg-zinc-800 w-full rounded-2xl p-6 items-center shadow-lg">
                  <Ionicons name="alert-circle" size={48} color="#ff7a7f" className="mb-4" />

                  <Text className="text-white text-xl font-semibold mb-2 font-sans text-center">
                    Apagar Categoria
                  </Text>

                  <Text className="text-neutral-400 font-sans text-center mb-6">
                    {categoryToDelete
                      ? `Tem certeza que deseja apagar a categoria "${categoryToDelete}"? Esta ação não pode ser desfeita.`
                      : 'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.'}
                  </Text>

                  <View className="flex-row w-full justify-between gap-3">
                    <TouchableOpacity
                      onPress={() => setShowConfirmDeleteModal(false)}
                      className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
                    >
                      <Text className="text-white font-semibold font-sans">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteCategory}
                      className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
                    >
                      <Text className="text-black font-sans font-semibold">Apagar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </Modal>


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

        <Modal
                    transparent
                    animationType="fade"
                    visible={isCategoryModalVisible}
                    onRequestClose={() => setIsCategoryModalVisible(false)}
                  >
                    <View className="flex-1 justify-center items-center bg-black/90 px-8">
                      <View className="bg-zinc-800 p-6 rounded-2xl w-full">

                        <TextInput
                          placeholder="Nome da categoria"
                          placeholderTextColor="#a1a1aa"
                          value={newCategoryName}
                          onChangeText={setNewCategoryName}
                          className="text-white font-sans font-3xl p-2 rounded mb-4"
                        />

                        <View className="flex flex-row flex-wrap gap-2 mb-4">
                          {colorOptions.map((color) => (
                            <TouchableOpacity
                              key={color}
                              onPress={() => setNewCategoryColor(color)}
                              style={{
                                backgroundColor: color,
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                borderWidth: newCategoryColor === color ? 3 : 1,
                                borderColor: newCategoryColor === color ? '#fff' : '#333',
                              }}
                            />
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={handleAddCategory}
                          className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
                        >
                          <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setIsCategoryModalVisible(false)}
                          className="mt-4 p-2"
                        >
                          <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
      </View>

      <SwipeListView
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between">
              <TouchableOpacity className="flex flex-col gap-1 mt-1" onPress={() => handleOpenEdit(item)}>
                <Text className={`text-xl font-sans font-medium ${doneMap[item.id] ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                  {item.title}
                </Text>
                <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {format(item.datetime, 'dd/MM/yyyy')}  - {format(item.datetime, 'HH:mm')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleToggleTaskCompletion(item)}
                className={`w-[25px] h-[25px] mt-4 border rounded-lg ${
                  doneMap[item.id]
                    ? 'bg-rose-500'
                    : 'border-2 border-neutral-600'
                }`}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
              {doneMap[item.id] ? <Ionicons name="checkmark" size={20} color="white" /> : null}
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

      <Modal
        transparent
        animationType="slide"
        visible={isCreateVisible}
        onRequestClose={resetModal}
      >
        <View className="flex-1 py-[50px] bg-zinc-800">
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
              className="items-center flex flex-row"
              onPress={resetModal}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-white text-lg font-sans"> Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveTask}>
              <Text className="text-rose-400 text-lg mr-4 font-semibold">Salvar</Text>
            </TouchableOpacity>
            </View>

          <ScrollView className="flex-1 px-4">
            <View className="mb-4">
              <Text className="text-white text-lg font-semibold mb-2 font-sans">Título</Text>
              <TextInput
                placeholder="Digite o título da tarefa"
                placeholderTextColor="#a1a1aa"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                className="bg-neutral-700 text-white p-3 rounded-xl font-sans"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white text-lg font-semibold mb-2 font-sans">Conteúdo</Text>
              <TextInput
                placeholder="Digite o conteúdo da tarefa (opcional)"
                placeholderTextColor="#a1a1aa"
                value={taskContent}
                onChangeText={setTaskContent}
                multiline
                numberOfLines={4}
                className="bg-neutral-700 text-white p-3 rounded-xl font-sans"
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white text-lg font-semibold mb-2 font-sans">Data</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-neutral-700 p-3 rounded-xl flex-row items-center justify-between"
              >
                <Text className="text-white font-sans">{format(date, 'dd/MM/yyyy')}</Text>
                <Ionicons name="calendar" size={24} color="#ff7a7f" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-white text-lg font-semibold mb-2 font-sans">Horário</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-neutral-700 p-3 rounded-xl flex-row items-center justify-between"
              >
                <Text className="text-white font-sans">{format(time, 'HH:mm')}</Text>
                <Ionicons name="time" size={24} color="#ff7a7f" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-2 font-sans">Categorias</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  const color = getCategoryColor(cat);

                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                        )
                      }
                      className={`flex-row items-center gap-2 px-3 py-2 rounded-xl ${
                        isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                      }`}
                    >
                      <View 
                        style={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: 5, 
                          backgroundColor: color 
                        }} 
                      />
                      <Text className={`font-sans ${isSelected ? 'text-black' : 'text-white'}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={date}
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
            textColor="#ff0000"
            accentColor="#ff7a7f"
            buttonTextColorIOS="#ff7a7f"
            themeVariant="light"
            display="inline"
            locale="pt-BR"
          />

          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            date={time}
            onConfirm={(selectedTime) => {
              setTime(selectedTime);
              setShowTimePicker(false);
            }}
            onCancel={() => setShowTimePicker(false)}
            textColor="#ff0000"
            accentColor="#ff7a7f"
            buttonTextColorIOS="#ff7a7f"
            themeVariant="light"
            display="inline"
            locale="pt-BR"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}