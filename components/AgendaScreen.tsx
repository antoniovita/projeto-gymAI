import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../hooks/useTask';

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
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);
  const [content, setContent] = useState('');


  useEffect(() => {
    fetchTasks(userId);
  }, []);

  const handleSaveWorkout = async () => {
    if (!newWorkoutTitle.trim()) {
      Alert.alert('Erro', 'O título do treino não pode estar vazio.');
      return;
    }

    if (selectedMusclesForWorkout.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um grupo muscular para o treino.');
      return;
    }

    try {
      if (selectedTask) {
      await updateTask(selectedTask.id, {
        title: newWorkoutTitle,
        content: content
      });
      } else {
        await createTask(
          newWorkoutTitle,
          selectedMusclesForWorkout.join(', '),
          new Date().toISOString(),
          'academia',
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
    setNewWorkoutTitle(task.title);
    setSelectedMusclesForWorkout(task.content?.split(', ') || []);
    setContent(task.content || '');
    setIsCreateVisible(true);
  };


  const toggleWorkoutCompletion = async (taskId: string, completed: 0 | 1) => {
    try {
      await updateTaskCompletion(taskId, completed === 0 ? 1 : 0);
      await fetchTasks(userId);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const resetModal = () => {
    setIsCreateVisible(false);
    setNewWorkoutTitle('');
    setSelectedMusclesForWorkout([]);
    setSelectedTask(null);
    setContent('');
  };


  const filteredTasks = tasks.filter((task) =>
    selectedMusclesForWorkout.length === 0 ||
    selectedMusclesForWorkout.some((cat) => task.content?.includes(cat))
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={() => {
          setSelectedTask(null);
          setNewWorkoutTitle('');
          setSelectedMusclesForWorkout([]);
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

      <ScrollView className="flex-1 px-6">
        {filteredTasks.map((task) => (
          <View
            key={task.id}
            className="w-full px-4 py-4 mb-4 border-b border-neutral-700"
          >
            <View className="flex flex-row justify-between">
              <TouchableOpacity onPress={() => handleOpenEdit(task)}>
                <Text className={`text-xl font-sans font-medium ${task.completed ? 'line-through text-neutral-500' : 'text-gray-300'}`}>
                  {task.title}
                </Text>
                <Text className="text-neutral-400 text-sm">{task.date?.slice(0, 10)}</Text>
                <Text className="text-neutral-400 line-clamp-1 text-sm">{task.content}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleWorkoutCompletion(task.id, task.completed)}
                className={`w-[25px] h-[25px] mt-2 border rounded-lg ${task.completed ? 'bg-rose-500' : 'border-2 border-neutral-600'}`}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                {task.completed ? <Ionicons name="checkmark" size={20} color="white" /> : null}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

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

            <TouchableOpacity onPress={handleSaveWorkout}>
              <Text className="text-rose-400 text-lg mr-4 font-semibold">Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 py-4 px-8">
            <TextInput
              placeholder="Título"
              placeholderTextColor="#a1a1aa"
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              className="text-gray-300 text-4xl font-semibold mb-4"
              multiline
            />

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const isSelected = selectedMusclesForWorkout.includes(cat);
                const color = categoriesColors[cat];

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setSelectedMusclesForWorkout((prev) =>
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
              placeholder="Escreva o seu treino aqui"
              placeholderTextColor="#a1a1aa"
              className="text-gray-300 text-lg"
              multiline
              value={content}
              onChangeText={setContent}
              style={{ minHeight: 150, textAlignVertical: 'top' }}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
