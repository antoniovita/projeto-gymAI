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
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
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

  const navigation = useNavigation(); 

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

    </SafeAreaView>
  );
}
