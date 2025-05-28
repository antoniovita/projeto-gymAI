import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function WorkoutScreen() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);

  const muscleGroups = [
    'Peito',
    'Costas',
    'Pernas',
    'Ombro',
    'Bíceps',
    'Tríceps',
    'Abdômen',
    'Funcional',
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

  const [workouts, setWorkouts] = useState([
    { id: 1, title: 'Treino de peito e tríceps', date: '26/05/2025', muscles: ['Peito', 'Tríceps'] },
    { id: 2, title: 'Treino de costas e bíceps', date: '27/05/2025', muscles: ['Costas', 'Bíceps'] },
    { id: 3, title: 'Treino de pernas', date: '28/05/2025', muscles: ['Pernas'] },
    { id: 4, title: 'Treino de ombro', date: '29/05/2025', muscles: ['Ombro'] },
    { id: 5, title: 'Treino de abdômen', date: '30/05/2025', muscles: ['Abdômen'] },
    { id: 6, title: 'Treino funcional', date: '31/05/2025', muscles: ['Funcional'] },
  ]);

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
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: any) => {
    setSelectedWorkout(workout);
    setNewWorkoutTitle(workout.title);
    setSelectedMusclesForWorkout(workout.muscles || []);
    setIsCreateVisible(true);
  };

  const handleSaveWorkout = () => {
    if (!newWorkoutTitle.trim()) {
      Alert.alert('Erro', 'O título do treino não pode estar vazio.');
      return;
    }

    if (selectedMusclesForWorkout.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um grupo muscular para o treino.');
      return;
    }

    if (selectedWorkout) {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === selectedWorkout.id
            ? { ...w, title: newWorkoutTitle, muscles: selectedMusclesForWorkout }
            : w
        )
      );
    } else {
      const newWorkout = {
        id: workouts.length + 1,
        title: newWorkoutTitle,
        date: new Date().toLocaleDateString(),
        muscles: selectedMusclesForWorkout,
      };
      setWorkouts((prev) => [newWorkout, ...prev]);
    }

    setNewWorkoutTitle('');
    setSelectedWorkout(null);
    setSelectedMusclesForWorkout([]);
    setIsCreateVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full bg-emerald-600 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={32} color="gray-300" />
      </TouchableOpacity>

      <View className="flex flex-row justify-between px-10 mt-[60px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Your workouts</Text>

        <TouchableOpacity onPress={() => setIsFilterVisible(true)} className="flex flex-row gap-1">
          <Text className="text-neutral-400 mt-2">Filtrar</Text>
          <Ionicons className="mt-[9px]" name="chevron-forward" size={13} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {workouts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleOpenEdit(item)}
            style={{ backgroundColor: '#1e1e1e' }}
            className="w-full rounded-2xl px-4 py-4 mb-4"
          >
            <View className="bg-zinc-800 px-3 py-2 rounded-b-xl flex flex-row justify-center items-center absolute left-[85%]">
              <View className="flex-row gap-1">
                {item.muscles.slice(0, 2).map((muscle) => (
                  <View
                    key={muscle}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: muscleColors[muscle],
                    }}
                  />
                ))}
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex flex-col gap-2">
                <Text className="text-gray-300 text-xl font-sans font-medium">{item.title}</Text>
                <Text className="text-neutral-400 text-sm">{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center px-8">
          <View className="bg-transparent w-full rounded-2xl p-6">
            <View className="flex flex-row flex-wrap gap-3 justify-center">
              {muscleGroups.map((muscle) => {
                const isSelected = selectedFilters.includes(muscle);
                const color = muscleColors[muscle];

                return (
                  <TouchableOpacity
                    key={muscle}
                    onPress={() => toggleFilter(muscle)}
                    className={`flex-row items-center gap-2 px-4 py-2 rounded-xl ${
                      isSelected ? 'bg-emerald-600' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
                    <Text className="text-gray-300 font-medium">{muscle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Pressable
              onPress={() => setIsFilterVisible(false)}
              className="mt-6 bg-emerald-600 py-3 rounded-xl"
            >
              <Text className="text-gray-300 text-center font-semibold">
                Aplicar Filtros ({selectedFilters.length} selecionado{selectedFilters.length !== 1 ? 's' : ''})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilters([])}
              className="mt-3 py-2 rounded-xl border border-gray-500"
            >
              <Text className="text-gray-300 text-center">Limpar Filtros</Text>
            </Pressable>
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
              <Text className="text-emerald-500 text-lg font-semibold">Salvar</Text>
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
                      isSelected ? 'bg-emerald-600' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                    <Text className="text-gray-300">{muscle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Escreva o seu treino aqui"
              placeholderTextColor="#a1a1aa"
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
