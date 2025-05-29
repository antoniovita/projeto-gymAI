import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [name, setName] = useState('');

  const handleInitialContinue = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View className="flex-1 bg-zinc-900 items-center justify-center px-5 relative">

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

      {/* Logo */}
      <MotiImage
        source={require('../assets/dayo.png')}
        from={{ opacity: 0, scale: 0.01, translateY: 0 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 3000, delay: 500 }}
        className="w-[400px] h-[250px] z-10"
        resizeMode="contain"
      />

    </View>
  );
}
