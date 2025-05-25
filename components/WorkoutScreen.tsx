import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function WorkoutScreen() {
  const [selectedId, setSelectedId] = useState(1);

  const workouts = [
    { id: 1, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 2, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 3, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 4, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 5, title: 'Treino de peito e tríceps', date: '26/05/2025' },
    { id: 6, title: 'Treino de peito e tríceps', date: '26/05/2025' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* Header */}
      <View className="flex-row justify-between items-center px-10 py-4">
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className='flex flex-row justify-between px-10 mt-8 mb-6'>
        <Text className="text-3xl text-white font-medium font-sans">Your workouts</Text>

        <TouchableOpacity>
          <Text className="text-neutral-400 mt-2">Filtrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {workouts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedId(item.id)}
            className='w-full rounded-2xl px-4 py-4 mb-4 bg-neutral-800'
          >
            <View className='bg-zinc-900 w-[43px] h-[23px] rounded-b-xl flex justify-center items-center absolute left-[87%]'>
              <View className="flex-row gap-2">
                <View className="w-3 h-3 rounded-full bg-red-600" />
                <View className="w-3 h-3 rounded-full bg-green-500" />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className='flex flex-col gap-2'>
                <Text className="text-white text-xl font-sans font-medium">
                  {item.title}
                </Text>
                <Text className="text-neutral-400 text-sm">{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </SafeAreaView>
  );
}
