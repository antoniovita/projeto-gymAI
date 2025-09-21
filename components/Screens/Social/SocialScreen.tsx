import { View, Text, SafeAreaView, Pressable, Platform, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "tabs/types";
import { StatsSection } from "./comps/StatsSection";
import GradientIcon from "../../generalComps/GradientIcon";
import { useTheme } from "../../../hooks/useTheme";

const SocialScren = () => {
  const theme = useTheme();
  
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
            Amigos
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
    </ScrollView>


       
    </SafeAreaView>
  );
};

export default SocialScren;