import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function WorkoutScreen() {
  const [selectedId, setSelectedId] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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

  const workouts = [
    { id: 1, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 2, title: 'Treino de costas e bíceps', date: '27/05/2025' },
    { id: 3, title: 'Treino de pernas', date: '28/05/2025' },
    { id: 4, title: 'Treino de ombro', date: '29/05/2025' },
    { id: 5, title: 'Treino de abdômen', date: '30/05/2025' },
    { id: 6, title: 'Treino funcional', date: '31/05/2025' },
  ];

  const toggleFilter = (muscle: string) => {
    setSelectedFilters((prev) =>
      prev.includes(muscle)
        ? prev.filter((item) => item !== muscle)
        : [...prev, muscle]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">

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
            onPress={() => setSelectedId(item.id)}
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

      <Modal
        transparent
        animationType="fade"
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center px-8">
          <View className="bg-transparent w-full rounded-2xl p-6">
            {/* Grid de filtros */}
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

            {/* Botão de aplicar */}
            <Pressable
              onPress={() => setIsFilterVisible(false)}
              className="mt-6 bg-emerald-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Aplicar Filtros ({selectedFilters.length} selecionado{selectedFilters.length !== 1 ? 's' : ''})
              </Text>
            </Pressable>

            {/* Botão de limpar */}
            <Pressable
              onPress={() => setSelectedFilters([])}
              className="mt-3 py-2 rounded-xl border border-gray-500"
            >
              <Text className="text-white text-center">Limpar Filtros</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
