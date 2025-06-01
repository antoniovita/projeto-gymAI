import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput, Alert,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../hooks/useTask';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SwipeListView } from 'react-native-swipe-list-view';


const categoriesColors: { [key: string]: string } = {
  'estudo': '#EF4444',
  'academia': '#3B82F6',
  'trabalho': '#10B981',
  'igreja': '#A3E635',
};

const categories = ['estudo', 'academia', 'trabalho', 'igreja'];

export default function AgendaScreen() {
  const userId = 'user-id-123'; // trocar depois com o auth context
  const {
    tasks,
    createTask,
    updateTask,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
    loading,
    error
  } = useTask();

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [taskContent, setTaskContent] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchTasks(userId);
  }, []);

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Erro', 'O título não pode estar vazio.');
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma categoria.');
      return;
    }

    try {
      const categoriesString = selectedCategories.join(', ');

      if (selectedTask) {
        await updateTask(selectedTask.id, {
          title: newTaskTitle,
          content: taskContent,
          type: categoriesString
        });
      } else {
      await createTask(
        newTaskTitle,
        taskContent,
        `${date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })} - ${date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`,
        categoriesString,
        userId
      );

      }

      await fetchTasks(userId);
      resetModal();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao salvar tarefa.');
    }
  };

  const handleOpenEdit = (task: any) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setTaskContent(task.content || '');
    const parsedCategories = task.type ? task.type.split(', ').map((cat: string) => cat.trim()) : [];
    setSelectedCategories(parsedCategories);
    setIsCreateVisible(true);
  };

  const toggleTaskCompletion = async (taskId: string, completed: 0 | 1) => {
    try {
      await updateTaskCompletion(taskId, completed === 0 ? 1 : 0);
      await fetchTasks(userId);
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
  };

  const filteredTasks = tasks.filter((task) =>
    selectedCategories.length === 0 ||
    selectedCategories.some((cat) => task.type?.includes(cat))
  );

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

      <View className="flex flex-row items-center justify-between px-6 mt-[60px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Today</Text>
      </View>

      <SwipeListView
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}

        renderItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 h-[93px] mb-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between">
              <TouchableOpacity className="flex flex-col gap-1" onPress={() => handleOpenEdit(item)}>
                <Text className={`text-xl font-sans font-medium ${item.completed ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                  {item.title}
                </Text>
                <Text className="text-neutral-400 text-sm font-sans">{item.date}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleTaskCompletion(item.id, item.completed)}
                className={`w-[25px] h-[25px] mt-2 border rounded-lg ${item.completed ? 'bg-rose-500' : 'border-2 border-neutral-600'}`}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                {item.completed ? <Ionicons name="checkmark" size={20} color="white" /> : null}
              </TouchableOpacity>
            </View>
          </View>
        )}

        renderHiddenItem={({ item }) => (
          <View className="flex-1 flex-row justify-start pl-6 items-center bg-rose-500 mb-4">
            <TouchableOpacity
              className="p-3"
              onPress={async () => {
                await deleteTask(item.id);
                await fetchTasks(userId);
              }}
            >
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
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
              <Text className="text-gray-300 text-lg"> Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveTask}>
              <Text className="text-rose-400 text-lg mr-4 font-semibold">Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 py-4 px-8">

          <View className="flex-row items-center justify-between space-x-4">
                  <TextInput
                    placeholder="Título"
                    placeholderTextColor="#a1a1aa"
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    className="flex-1 text-gray-300 text-3xl font-semibold mb-4"
                    multiline
                  />

                  <View className="mb-4">
                    <TouchableOpacity onPress={() => setShowPicker(true)}>
                      <Ionicons name="calendar-clear-outline" size={22} color="#F25C5C" />
                    </TouchableOpacity>

                    <Modal
                      visible={showPicker}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setShowPicker(false)}
                    >
                      <View className="flex-1 justify-center items-center bg-black/90">
                          <DateTimePicker
                            value={date}
                            mode="datetime"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                              if (selectedDate) setDate(selectedDate);
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPicker(false)}
                            className="bg-[#F25C5C] rounded-full h-[50px] w-[50px] flex items-center justify-center bottom-[10%] absolute"
                          >
                           <Ionicons name="checkmark" size={24} color="white" />
                          </TouchableOpacity>
                      </View>
                    </Modal>
                  </View>
                </View>

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const color = categoriesColors[cat];

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setSelectedCategories((prev) =>
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
            </View>

            <TextInput
              placeholder="Descrição da tarefa"
              placeholderTextColor="#a1a1aa"
              className="text-gray-300 text-lg"
              multiline
              value={taskContent}
              onChangeText={setTaskContent}
              style={{ minHeight: 150, textAlignVertical: 'top' }}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
