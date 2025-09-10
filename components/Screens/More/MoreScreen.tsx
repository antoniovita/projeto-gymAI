import { View, Text, SafeAreaView, Pressable, Platform, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "widgets/types";
import { StatsSection } from "./comps/StatsSection";
import GradientIcon from "../../generalComps/GradientIcon";

const MoreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const categories = [
    {
      title: "Configurações",
      items: [
        {
          id: 1,
          title: "Configurações",
          subtitle: "Gerenciar suas preferências da conta",
          icon: "settings",
          color: "#ff7a7f",
          onPress: () => {
            navigation.navigate("SettingsScreen")
          }
        }
      ]
    },
    {
      title: "Produtividade",
      items: [
        {
          id: 2,
          title: "Rotina",
          subtitle: "Gerencie a sua rotina",
          icon: "calendar",
          onPress: () => {
            navigation.navigate("RoutineScreen")
          }
        },
        {
          id: 3,
          title: "Metas",
          subtitle: "Definir e acompanhar objetivos",
          icon: "trophy",
          onPress: () => {
            navigation.navigate("GoalScreen")
          }
        },
        {
          id: 4,
          title: "Temporizador",
          subtitle: "Técnica de produtividade e foco",
          icon: "timer",
          onPress: () => {
            navigation.navigate("TimerScreen");
          }
        }
      ]
    },
    {
      title: "Recursos",
      items: [
        {
          id: 5,
          title: "Academia",
          subtitle: "Gerenciar treinos e exercícios",
          icon: "barbell",
          onPress: () => {
            navigation.navigate("WorkoutScreen")
          }
        },
        {
          id: 6,
          title: "Notas",
          subtitle: "Criar e organizar suas anotações",
          icon: "document-text",
          color: "#ff7a7f",
          onPress: () => {
            navigation.navigate("NoteScreen")
          }
        }
      ]
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
          <Text className="text-white font-poppins text-[18px] font-medium">Mais recursos</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          {/* Placeholder para manter simetria */}
          <View style={{ width: 22, height: 22 }} />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >

        <StatsSection />

        {categories.map((category) => (
          <View key={category.title} className="mb-6">
            <Text className="text-neutral-400 font-poppins text-sm font-medium mb-3 px-2">
              {category.title.toUpperCase()}
            </Text>
            <View className="flex flex-col gap-4">
              {category.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  className="bg-[#35353a] rounded-2xl p-4"
                >
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex flex-row items-center gap-4">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center bg-orange-400/35"
                      >
                        <GradientIcon name={item.icon as any} size={24} />
                      </View>
                      <View className="flex flex-col">
                        <Text className="text-white text-lg font-semibold font-poppins">
                          {item.title}
                        </Text>
                        <Text className="text-neutral-400 text-sm font-poppins mt-0.5">
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#71717a" />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Premium Section */}
        <View className="pt-3">
          <Text className="text-neutral-400 font-poppins text-sm font-medium mb-3 px-2">
            PREMIUM
          </Text>
          <View className=" rounded-2xl p-4  border-orange-400 border-2">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-8 h-8 rounded-full bg-orange-400/40 items-center justify-center">
                <GradientIcon name="star" size={16} />
              </View>
              <Text className="text-white font-poppins text-lg font-semibold">
                Acesso Premium
              </Text>
            </View>
            <Text className="text-neutral-300 font-poppins text-sm mb-3">
              Desbloqueie todos os recursos e funcionalidades avançadas
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-[#ffa41f] font-poppins text-lg font-bold">
                R$ 5,99/mês
              </Text>
              <Pressable className="bg-[#ffa41f] px-4 py-2 rounded-xl">
                <Text className="text-black font-poppins font-semibold">
                  Assinar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className="mt-6 items-center">
          <Text className="text-neutral-500 font-poppins text-xs">
            Versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreScreen;