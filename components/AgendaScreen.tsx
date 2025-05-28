import React, { useState } from 'react';
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

const categoriesColors: { [key: string]: string } = {
  'estudo': '#EF4444',      // Red
  'academia': '#3B82F6',     // Blue
  'trabalho': '#10B981',     // Green
  'igreja': '#A3E635',  // Lime
};

const categories = [
  'estudo',
  'academia',
  'trabalho',
  'igreja',
];

export default function AgendaScreen() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState([
    { id: 1, title: 'Treino de peito e tríceps', time: '16:00-17:00', muscles: ['Peito', 'Tríceps'], completed: false },
    { id: 2, title: 'Treino de costas e bíceps', time: '16:00-17:00', muscles: ['Costas', 'Bíceps'], completed: false },
    { id: 3, title: 'Treino de pernas', time: '16:00-17:00', muscles: ['Pernas'], completed: false },
    { id: 4, title: 'Treino de ombro', time: '16:00-17:00', muscles: ['Ombro'], completed: false },
    { id: 5, title: 'Treino de abdômen', time: '16:00-17:00', muscles: ['Abdômen'], completed: false },
    { id: 6, title: 'Treino funcional', time: '16:00-17:00', muscles: ['Funcional'], completed: false },
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
    setSelectedCategory(null);
    setNewWorkoutTitle('');
    setSelectedMusclesForWorkout([]);
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: any) => {
    setSelectedCategory(workout);
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

    if (selectedCategory) {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === selectedCategory.id
            ? { ...w, title: newWorkoutTitle, muscles: selectedMusclesForWorkout }
            : w
        )
      );
    } else {
      const newWorkout = {
        id: workouts.length + 1,
        title: newWorkoutTitle,
        time: '16:00-17:00',
        muscles: selectedMusclesForWorkout,
        completed: false,
      };
      setWorkouts((prev) => [...prev, newWorkout]);
    }

    setNewWorkoutTitle('');
    setSelectedCategory(null);
    setSelectedMusclesForWorkout([]);
    setIsCreateVisible(false);
  };

  const toggleWorkoutCompletion = (workoutId: number) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId ? { ...workout, completed: !workout.completed } : workout
      )
    );
  };

  const filteredWorkouts = workouts.filter((workout) =>
    selectedFilters.length === 0 || workout.muscles.some((muscle) => selectedFilters.includes(muscle))
  );

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

      <View className="flex flex-row items-center justify-between px-6 mt-[80px] mb-6">
        <View className='flex flex-row gap-2 items-center'>
          <TouchableOpacity onPress={() => setIsFilterVisible(true)} className="flex flex-row gap-1">
            <Ionicons className="mt-1" name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-3xl ml-3 text-white font-medium font-sans">Today</Text>
        </View>

        <TouchableOpacity onPress={() => setIsFilterVisible(true)} className="flex items-center flex-row">
          <Ionicons className="mt-1" name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {filteredWorkouts.map((item) => (
          <View
            key={item.id}
            className="w-full px-4 py-4 mb-4 border-b border-neutral-700"
          >
            <View className='flex flex-row justify-between'>
              <TouchableOpacity className="flex-row justify-between items-center"
              onPress={() => handleOpenEdit(item)}>
                <View className="flex flex-col gap-2">
                  <Text className={`text-xl font-sans font-medium ${item.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                    {item.title}
                  </Text>
                  <Text className="text-neutral-400 text-sm">{item.time}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleWorkoutCompletion(item.id)}
                className={`w-[25px] h-[25px] mt-2 border rounded-lg ${item.completed ? 'bg-green-500' : 'border-2 border-neutral-600'}`}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={item.completed && 'checkmark'} size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

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
            {/* Input para o título */}
            <TextInput
              placeholder="Título"
              placeholderTextColor="#a1a1aa"
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              className="text-white text-4xl font-semibold mb-4"
              multiline
            />

            {/* Seção para seleção de grupos musculares */}
            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {categories.map((categories) => {
                const isSelected = selectedMusclesForWorkout.includes(categories);
                const color = categoriesColors[categories];

                return (
                  <TouchableOpacity
                    key={categories}
                    onPress={() => {
                      setSelectedMusclesForWorkout((prev) =>
                        prev.includes(categories)
                          ? prev.filter((item) => item !== categories)
                          : [...prev, categories]
                      );
                    }}
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                      isSelected ? 'bg-emerald-600' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                    <Text className="text-white">{categories}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TextInput para a descrição do treino */}
            <TextInput
              placeholder="Escreva o seu treino aqui"
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
