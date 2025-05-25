import Constants from 'expo-constants';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className="h-screen bg-zinc-800 p-3 px-9">
      
    </View>
  );
}
