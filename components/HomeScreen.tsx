import Constants from 'expo-constants';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "../widgets/types"
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const statusBarHeight = Constants.statusBarHeight;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="h-screen bg-black p-3 px-8">
      <View className="flex flex-row justify-between items-center" style={{ marginTop: statusBarHeight + 50 }}>
        <Text className="text-white font-bold text-3xl font-sans">Today</Text>

        <TouchableOpacity className='bg-white p-2 rounded-full' onPress={() => navigation.navigate('UserConfig')}>
          <Ionicons name={'person'} size={20} color={'black'} />
        </TouchableOpacity>
      
      </View>
    </View>
  );
}
