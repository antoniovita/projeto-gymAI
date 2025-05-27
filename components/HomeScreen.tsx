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

export default function HomeScreen() {
  const [selectedId, setSelectedId] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [name, setName] = useState("Antônio")
  const [sequence, setSequence] = useState(5)

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
    <SafeAreaView className="flex-1 flex-col bg-zinc-900">

      <View className="flex flex-col justify-between px-10 mt-[80px] gap-3 mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Olá, {name}! </Text>
        <Text className='text-lg text-white font-sans font-light'> Você está com {sequence} dias de sequência!</Text>
      </View>

      <View className='px-6 flex flex-col gap-8'>

        <View className='bg-zinc-800 w-full h-[150px] flex flex-row rounded-3xl'>
          <View className=' flex flex-col h-full w-1/3 rounded-l-3xl'>
            <View className='border-b-2 justify-center items-center border-neutral-600 py-2.5'>
              <Text className='text-white font-sans text-md'> yesterday </Text>
            </View>
          </View>

          <View className='border-r-2 border-l-2 border-neutral-600 h-full w-1/3 '>
            <View className='border-b-2 justify-center items-center border-neutral-600 py-2.5'>
              <Text className='text-white font-sans text-md'> today </Text>
            </View>
          </View>

          <View className=' h-full w-1/3 rounded-r-3xl'>
            <View className='border-b-2 justify-center items-center border-neutral-600 py-2.5'>
              <Text className='text-white font-sans text-md'> tomorrow </Text>
            </View>
          </View>
        </View>

          <View className=' h-[150px] justify-center w-full gap-6 px-4 flex flex-row'>
            
            
            <TouchableOpacity className='w-1/2 h-full flex flex-col rounded-3xl bg-zinc-800'>
              <View className='flex border-b-2 border-neutral-600 items-start pl-4 '>
                <Text className=' font-sans text-md text-white py-2.5'> treino do dia</Text>
              </View>

              <View className='flex flex-col justify-between gap-4 px-3'>
                <Text className='font-sans text-[16px] font-semibold text-white py-2.5'> peito e tríceps</Text>
                
                <View className='flex flex-row gap-2'>
                  <Text className=' font-sans text-[12px] max-w-[100px] text-white py-2.5'> clique aqui para gerar seu treino</Text>
                  <Ionicons className="mt-3" name="share-outline" size={25} color="white" />
                </View>

              </View>
            </TouchableOpacity>

            <View className='w-1/2 h-full rounded-3xl bg-orange-200'></View>

          </View>
          
      </View>

    </SafeAreaView>
  );
}
