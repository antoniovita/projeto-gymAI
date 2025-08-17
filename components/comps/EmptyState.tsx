import {
  View, Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export const EmptyState = ({ dateFilter, onCreateTask }: { dateFilter: Date, onCreateTask: () => void }) => {
  const getDayOfWeek = (date: Date) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dayNames[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <View className="flex-1 justify-center items-center px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full  items-center justify-center mb-3">
          <Ionicons name="calendar-outline" size={60} color="gray" />
        </View>

        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma tarefa {isToday(dateFilter) ? 'hoje' : `para ${getDayOfWeek(dateFilter).toLowerCase()}`}
        </Text>

        <Text
          className="text-neutral-400 text-sm font-sans mb-4 text-center"
          style={{ maxWidth: 230 }}
        >
          Crie novas tarefas para organizar sua rotina
        </Text>
      </View>
    </View>
  );
};