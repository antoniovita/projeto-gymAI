import { View, Text, SafeAreaView, Pressable, Platform } from "react-native";
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
      title: "Temporizador",
      subtitle: "Técnica de produtividade e foco",
      icon: "timer-outline",
      color: "#ff7a7f",
      onPress: () => {
        navigation.navigate("TimerScreen");
      }
    }
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      {/* Header */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Mais recursos</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          {/* Placeholder para manter simetria */}
          <View style={{ width: 22, height: 22 }} />
        </View>
      </View>

      <View className="flex flex-col px-6">
        <View className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              className="bg-[#35353a] rounded-2xl p-4"
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 122, 127, 0.15)' }}
                  >
                    <Ionicons name={item.icon as any} size={24} color="#ff7a7f" />
                  </View>
                  <View className="flex flex-col">
                    <Text className="text-white text-lg font-semibold font-sans">
                      {item.title}
                    </Text>
                    <Text className="text-neutral-400 text-sm font-sans mt-0.5">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Premium Section */}
        <View className="mt-8 pt-6 border-t border-zinc-700">
          <View className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl p-4 border border-rose-500/20">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-8 h-8 rounded-full bg-rose-500/20 items-center justify-center">
                <Ionicons name="star" size={16} color="#ff7a7f" />
              </View>
              <Text className="text-white font-sans text-lg font-semibold">
                Acesso Premium
              </Text>
            </View>
            <Text className="text-neutral-300 font-sans text-sm mb-3">
              Desbloqueie todos os recursos e funcionalidades avançadas
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-rose-400 font-sans text-lg font-bold">
                R$ 5,99/mês
              </Text>
              <Pressable className="bg-rose-500 px-4 py-2 rounded-xl">
                <Text className="text-white font-sans font-semibold">
                  Assinar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className="mt-6 items-center">
          <Text className="text-neutral-500 font-sans text-xs">
            Versão 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MoreScreen;