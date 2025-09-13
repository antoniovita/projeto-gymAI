import { View, Text, SafeAreaView, Pressable, Platform, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "widgets/types";
import { StatsSection } from "./comps/StatsSection";
import GradientIcon from "../../generalComps/GradientIcon";
import { useTheme } from "../../../hooks/useTheme";

const MoreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  
  const categories = [
    {
      title: "Configurações",
      items: [
        {
          id: 1,
          title: "Configurações",
          subtitle: "Gerenciar suas preferências da conta",
          icon: "settings",
          color: theme.colors.settingsIcon,
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
          color: theme.colors.notesIcon,
          onPress: () => {
            navigation.navigate("NoteScreen")
          }
        }
      ]
    }
  ];

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0 
      }}
    >
      {/* Header */}
      <View 
        style={{
          marginTop: 20,
          paddingHorizontal: 16,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
          <Text 
            style={{
              color: theme.colors.moreScreenTitle,
              fontSize: 18,
              fontWeight: '500',
              fontFamily: 'Poppins'
            }}
          >
            Mais recursos
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 4 }}>
          {/* Placeholder para manter simetria */}
          <View style={{ width: 22, height: 22 }} />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <StatsSection />

        {categories.map((category) => (
          <View key={category.title} style={{ marginBottom: 24 }}>
            <Text 
              style={{
                color: theme.colors.categoryTitle,
                fontSize: 14,
                fontWeight: '500',
                marginBottom: 12,
                paddingHorizontal: 8,
                fontFamily: 'Poppins'
              }}
            >
              {category.title.toUpperCase()}
            </Text>
            <View style={{ gap: 16 }}>
              {category.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={{
                    backgroundColor: theme.colors.itemBackground,
                    borderRadius: 16,
                    padding: 16
                  }}
                >
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${theme.colors.primary}35`
                        }}
                      >
                        <GradientIcon name={item.icon as any} size={24} />
                      </View>
                      <View>
                        <Text 
                          style={{
                            color: theme.colors.itemTitle,
                            fontSize: 18,
                            fontFamily: 'Poppins'
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text 
                          style={{
                            color: theme.colors.itemSubtitle,
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            marginTop: 2
                          }}
                        >
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={theme.colors.chevronIcon} 
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Premium Section */}
        <View style={{ paddingTop: 12 }}>
          <Text 
            style={{
              color: theme.colors.categoryTitle,
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 12,
              paddingHorizontal: 8,
              fontFamily: 'Poppins'
            }}
          >
            PREMIUM
          </Text>
          <View 
            style={{
              backgroundColor: theme.colors.premiumBackground,
              borderRadius: 16,
              padding: 16,
              borderColor: theme.colors.premiumBadge,
              borderWidth: 2
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <View 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: `${theme.colors.premiumBadge}40`,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GradientIcon name="star" size={16} />
              </View>
              <Text 
                style={{
                  color: theme.colors.premiumTitle,
                  fontSize: 18,
                  fontWeight: '600',
                  fontFamily: 'Poppins'
                }}
              >
                Acesso Premium
              </Text>
            </View>
            <Text 
              style={{
                color: theme.colors.premiumDescription,
                fontSize: 14,
                marginBottom: 12,
                fontFamily: 'Poppins'
              }}
            >
              Desbloqueie todos os recursos e funcionalidades avançadas
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text 
                style={{
                  color: theme.colors.premiumPrice,
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins'
                }}
              >
                R$ 5,99/mês
              </Text>
              <Pressable 
                style={{
                  backgroundColor: theme.colors.premiumButton,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12
                }}
              >
                <Text 
                  style={{
                    color: theme.colors.premiumButtonText,
                    fontWeight: '600',
                    fontFamily: 'Poppins'
                  }}
                >
                  Assinar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text 
            style={{
              color: theme.colors.appVersion,
              fontSize: 12,
              fontFamily: 'Poppins'
            }}
          >
            Versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreScreen;