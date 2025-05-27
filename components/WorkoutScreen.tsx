import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function WorkoutScreen() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);

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

  const [workouts, setWorkouts] = useState([
    { id: 1, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 2, title: 'Treino de costas e bíceps', date: '27/05/2025' },
    { id: 3, title: 'Treino de pernas', date: '28/05/2025' },
    { id: 4, title: 'Treino de ombro', date: '29/05/2025' },
    { id: 5, title: 'Treino de abdômen', date: '30/05/2025' },
    { id: 6, title: 'Treino funcional', date: '31/05/2025' },
  ]);

  const toggleFilter = (muscle: string) => {
    setSelectedFilters((prev) =>
      prev.includes(muscle)
        ? prev.filter((item) => item !== muscle)
        : [...prev, muscle]
    );
  };

  const handleOpenCreate = () => {
    setSelectedWorkout(null);
    setNewWorkoutTitle('');
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: any) => {
    setSelectedWorkout(workout);
    setNewWorkoutTitle(workout.title);
    setIsCreateVisible(true);
  };

  const handleSaveWorkout = () => {
    if (!newWorkoutTitle) return;

    if (selectedWorkout) {
      // Editar
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === selectedWorkout.id ? { ...w, title: newWorkoutTitle } : w
        )
      );
    } else {
      // Criar
      const newWorkout = {
        id: workouts.length + 1,
        title: newWorkoutTitle,
        date: new Date().toLocaleDateString(),
      };
      setWorkouts((prev) => [newWorkout, ...prev]);
    }

    setNewWorkoutTitle('');
    setSelectedWorkout(null);
    setIsCreateVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
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
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <View className="flex flex-row justify-between px-10 mt-[80px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Your workouts</Text>

        <TouchableOpacity
          onPress={() => setIsFilterVisible(true)}
          className="flex flex-row gap-1"
        >
          <Text className="text-neutral-400 mt-2">Filtrar</Text>
          <Ionicons className="mt-[9px]" name="chevron-forward" size={13} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {workouts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleOpenEdit(item)}
            className="w-full rounded-2xl px-4 py-4 mb-4 bg-neutral-800"
          >
            <View className="bg-zinc-900 w-[43px] h-[23px] rounded-b-xl flex justify-center items-center absolute left-[87%]">
              <View className="flex-row gap-2">
                <View className="w-3 h-3 rounded-full bg-red-600" />
                <View className="w-3 h-3 rounded-full bg-green-500" />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex flex-col gap-2">
                <Text className="text-white text-xl font-sans font-medium">
                  {item.title}
                </Text>
                <Text className="text-neutral-400 text-sm">{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de Filtros */}
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
                return (
                  <TouchableOpacity
                    key={muscle}
                    onPress={() => toggleFilter(muscle)}
                    className={`px-4 py-2 rounded-xl ${
                      isSelected ? 'bg-emerald-600' : 'bg-neutral-700'
                    }`}
                  >
                    <Text className="text-white font-medium">{muscle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Pressable
              onPress={() => setIsFilterVisible(false)}
              className="mt-6 bg-emerald-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Aplicar Filtros ({selectedFilters.length} selecionado{selectedFilters.length !== 1 ? 's' : ''})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilters([])}
              className="mt-3 py-2 rounded-xl border border-gray-500"
            >
              <Text className="text-white text-center">Limpar Filtros</Text>
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
        <View className="flex-1 py-[50px] bg-zinc-900">
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
              className="text-white text-4xl font-semibold mb-4"
              multiline
            />

            <TextInput
              placeholder="Escreva uma descrição ou observações..."
              placeholderTextColor="#a1a1aa"
              className="text-white text-lg"
              multiline
              style={{ minHeight: 150, textAlignVertical: 'top' }}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
