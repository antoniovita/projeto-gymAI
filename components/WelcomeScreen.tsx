import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import Animated, { Easing } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');

  const handleInitialContinue = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View className="flex-1 items-center justify-center relative overflow-hidden">

      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 5 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          repeatReverse: true,
        }}
        className="absolute w-full h-full"
      >
        <LinearGradient
          colors={['#000000', '#1f1f1f', '#f43f5e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, width: '100%', height: '100%', opacity: 1 }}
        />
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 140 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000, delay: 4000 }}
        className="absolute bottom-[10%] left-1/4 -translate-x-1/2 z-10"
      >
        <TouchableOpacity
          className="bg-[#F25C5C] rounded-full py-4 px-20"
          onPress={handleInitialContinue}
        >
          <Text className="text-white font-medium text-xl lowercase">continue</Text>
        </TouchableOpacity>
      </MotiView>

      <MotiImage
        source={require('../assets/dayo.png')}
        from={{ opacity: 0, scale: 0.01 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 3000, delay: 500 }}
        className="w-[400px] h-[250px] z-10"
        resizeMode="contain"
      />

    </View>
  );
}
