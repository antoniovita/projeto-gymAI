import Constants from 'expo-constants';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "../widgets/types"
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function HomeScreen() {
  const statusBarHeight = Constants.statusBarHeight;

  useEffect(() => {

  }, [])

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="h-screen bg-black p-3 px-9">
      <View className="flex flex-row justify-between items-center" style={{ marginTop: statusBarHeight + 50 }}>
        <Text className="text-white font-bold text-3xl font-sans">Today</Text>

        <TouchableOpacity className='bg-white p-2 rounded-full' onPress={() => navigation.navigate('UserConfig')}>
          <Ionicons name={'person'} size={20} color={'black'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-white p-2 rounded-full z-20 justify-center items-center absolute right-[5%] bottom-[13%]">
        <Ionicons name={'add-outline'} size={30} color={'black'} />
      </TouchableOpacity>
    </View>
  );
}
