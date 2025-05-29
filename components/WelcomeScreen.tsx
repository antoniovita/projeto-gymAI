import Constants from 'expo-constants';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "../widgets/types"
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function WelcomeScreen() {
  const statusBarHeight = Constants.statusBarHeight;

  useEffect(() => {

  }, [])

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="h-screen items-center justify-center bg-zinc-800 p-3 px-9">
      <Image 
        source={require('../assets/dayo.png')} 
        style={{ width: 100, height: 100 }} 
        resizeMode="contain"  
      />  

      <View className='flex flex-col'>
          
      </View>  
    
    </View>
  );
}
