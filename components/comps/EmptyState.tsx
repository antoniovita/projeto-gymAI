import {
  View, Text, Image
} from 'react-native';

const fuocoCALENDAR = require("../../assets/icons/fuocoCALENDAR.png")


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

        <View className="ml-10">

          <Image style={{width: 160, height: 160}} source={fuocoCALENDAR}></Image>

        </View>

        <Text className="text-neutral-400 text-xl  mt-3 font-medium font-sans mb-2 text-center">
          Nenhuma tarefa {isToday(dateFilter) ? 'hoje' : `para ${getDayOfWeek(dateFilter).toLowerCase()}`}
        </Text>

        <Text
          className="text-neutral-400 text-sm font-sans text-center"
          style={{ maxWidth: 230 }}
        >
          Crie novas tarefas para organizar sua rotina
        </Text>
      </View>
    </View>
  );
};