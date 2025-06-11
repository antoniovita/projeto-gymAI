import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useWorkout } from '../hooks/useWorkout';

export default function WorkoutScreen() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const muscleGroups = [
    'Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps', 'Abdômen', 'Funcional',
  ];

  const muscleColors: { [key: string]: string } = {
    'Peito': '#ef4444',
    'Costas': '#3b82f6',
    'Pernas': '#10b981',
    'Ombro': '#f59e0b',
    'Bíceps': '#8b5cf6',
    'Tríceps': '#ec4899',
    'Abdômen': '#22d3ee',
    'Funcional': '#a3e635',
  };

  const userId = '123';

  const {
    workouts,
    createWorkout,
    fetchWorkouts,
    fetchWorkoutsByType,
    updateWorkout,
    deleteWorkout,
  } = useWorkout();

  useEffect(() => {
    fetchWorkouts(userId);
  }, [userId]);

  const toggleFilter = (muscle: string) => {
    setSelectedFilters((prev) =>
      prev.includes(muscle) ? prev.filter((item) => item !== muscle) : [...prev, muscle]
    );
  };

  const toggleMuscleForWorkout = (muscle: string) => {
    setSelectedMusclesForWorkout((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleOpenCreate = () => {
    setSelectedWorkout(null);
    setNewWorkoutTitle('');
    setSelectedMusclesForWorkout([]);
    setContent('');
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: any) => {
    setSelectedWorkout(workout);
    setNewWorkoutTitle(workout.name);
    setSelectedMusclesForWorkout(workout.type ? workout.type.split(',') : []);
    setContent(workout.content);
    setIsCreateVisible(true);
  };

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
      const type = selectedMusclesForWorkout.join(',');
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // yyyy-mm-dd

      if (selectedWorkout) {
        await updateWorkout(selectedWorkout.id, {
          name: newWorkoutTitle,
          content,
          date: formattedDate,
          type,
        });
      } else {
        await createWorkout(newWorkoutTitle, content, formattedDate, userId, type);
      }

      setIsCreateVisible(false);
      setNewWorkoutTitle('');
      setSelectedMusclesForWorkout([]);
      setContent('');
      await fetchWorkouts(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Excluir treino',
      'Tem certeza que deseja excluir este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(id);
              await fetchWorkouts(userId);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir o treino.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const applyFilter = async () => {
    setIsFilterVisible(false);

    if (selectedFilters.length === 0) {
      await fetchWorkouts(userId);
    } else {
      const type = selectedFilters.join(',');
      await fetchWorkoutsByType(userId, type);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>

      <View className="flex flex-row justify-between px-6 mt-[60px] mb-5">
        <Text className="text-3xl text-white font-medium font-sans">Workouts</Text>

        <TouchableOpacity onPress={() => setIsFilterVisible(true)} className="flex flex-row gap-1">
          <Text className="text-neutral-400 mt-2">Filtrar</Text>
          <Ionicons className="mt-[9px]" name="chevron-forward" size={13} color="gray" />
        </TouchableOpacity>
      </View>
      <SwipeListView
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const muscles = item.type ? item.type.split(',') : [];

          return (
            <View className="w-full flex flex-col justify-center px-6 h-[100px] pt-1 pb-4 border-b border-neutral-700 bg-zinc-800">
              <View className="flex flex-row justify-between">
                <TouchableOpacity
                  className="flex flex-col gap-1 mt-1"
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text className="text-xl font-sans font-medium text-gray-300">{item.name}</Text>
                  <Text className="text-neutral-400 text-sm mt-1 font-sans">
                    {new Date(item.date ?? '').toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2 justify-start mt-3 items-start flex-1 overflow-hidden">
                  {muscles.map((muscle) => (
                    <View
                      key={muscle}
                      className="px-3 py-1 rounded-xl max-w-[80px] overflow-hidden"
                      style={{ backgroundColor: muscleColors[muscle] ?? '#94a3b8' }}
                    >
                      <Text
                        className="text-xs font-medium text-white font-sans"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {muscle}
                      </Text>
                    </View>
                  ))}
                </View>
            </View>
          );
        }}
        renderHiddenItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 border-b border-neutral-700 bg-rose-500">
            <View className="flex flex-row justify-start items-center h-full">
              <TouchableOpacity className="p-3" onPress={() => handleDelete(item.id)}>
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
        animationType="fade"
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-zinc-900/95 justify-center items-center px-8">
          <View className="w-full rounded-2xl p-6 items-center">
            <View className="flex flex-row flex-wrap gap-3 justify-center">
              {muscleGroups.map((muscle) => {
                const isSelected = selectedFilters.includes(muscle);
                const color = muscleColors[muscle];

                return (
                  <TouchableOpacity
                    key={muscle}
                    onPress={() => toggleFilter(muscle)}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-3xl ${
                      isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: color }} />
                    <Text className={`font-sans font-medium ${
                      isSelected ? 'text-black' : 'text-white'
                    }`}>{muscle}</Text>
                  </TouchableOpacity>
                );
              })}

              <Pressable
                onPress={applyFilter}
                className="bg-rose-400 h-[40px] w-[40px] rounded-full flex-row items-center justify-center"
              >
                <Ionicons name="checkmark" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={isCreateVisible}
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View className="flex-1 py-[50px] bg-zinc-800">
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
              className="items-center flex flex-row"
              onPress={() => setIsCreateVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-white text-lg"> Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveWorkout}>
              <Text className="text-rose-400 text-lg font-semibold mr-4">Salvar</Text>
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
              {muscleGroups.map((muscle) => {
                const isSelected = selectedMusclesForWorkout.includes(muscle);
                const color = muscleColors[muscle];

                return (
                  <TouchableOpacity
                    key={muscle}
                    onPress={() => toggleMuscleForWorkout(muscle)}
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                      isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                    <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{muscle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Escreva o seu treino aqui"
              placeholderTextColor="#a1a1aa"
              value={content}
              onChangeText={setContent}
              className="text-gray-300 text-lg"
              multiline
              style={{ minHeight: 150, textAlignVertical: 'top' }}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
