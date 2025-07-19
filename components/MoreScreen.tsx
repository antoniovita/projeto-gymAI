import { View, Text, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "widgets/types";

const MoreScreen = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const menuItems = [
    {
      id: 1,
      title: "Academia",
      subtitle: "Gerenciar treinos e exercícios",
      icon: "barbell-outline",
      color: "#ff7a7f",
      onPress: () => {
        navigation.navigate("WorkoutScreen")
      }
    },
    {
      id: 2,
      title: "Notas",
      subtitle: "Criar e organizar suas anotações",
      icon: "document-text-outline",
      color: "#ff7a7f",
      onPress: () => {
        navigation.navigate("NoteScreen")
      }
    },
    {
      id: 3,
      title: "Metas",
      subtitle: "Definir e acompanhar objetivos",
      icon: "trophy-outline",
      color: "#ff7a7f",
      onPress: () => {
        navigation.navigate("GoalScreen")
      }
    },
    {
      id: 4,
      title: "Roadmaps",
      subtitle: "Planejar seu caminho de aprendizado",
      icon: "map-outline",
      color: "#ff7a7f",
      onPress: () => {
        console.log("Navigate to Roadmaps");
      }
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <View className="flex flex-col px-6 mt-[40px]">
        <Text className="text-3xl text-white font-medium font-sans mb-8">Mais recursos</Text>
        
        <View className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              className="bg-[#35353a] rounded-2xl p-3"
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-4">
                  <View 
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor:  'rgba(239, 68, 68, 0.15)'  }}
                  >
                    <Ionicons name={item.icon as any} size={24} color="#ff7a7f" />
                  </View>
                  
                  <View className="flex flex-col">
                    <Text className="text-white text-xl font-semibold font-sans">
                      {item.title}
                    </Text>
                    <Text className="text-neutral-400 text-sm font-sans">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </View>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 pt-3 border-t border-zinc-700">
          <Text className="text-neutral-400 text-center font-sans text-sm">
            Para acesso completo, seja premium por R$ 5,99
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MoreScreen;