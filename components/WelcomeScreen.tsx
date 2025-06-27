import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import { Easing } from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useAcceptTerms } from '../hooks/useAcceptTerms';
import { DataModal } from '../components/comps/dataModal';
import { SubscriptionModal } from '../components/comps/subscriptionModal';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { register, storePin } = useAuth();
  const { acceptTerms, toggleAcceptTerms } = useAcceptTerms();

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [skipPin, setSkipPin] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free'|'premium'|null>(null);

  const handleInitialContinue = () => {
    setCurrentStep(1);
    setDataModalVisible(true);
  };

  const handleNextStep = () => {
    setDataModalVisible(false);
    setCurrentStep(2);
    setSubscriptionModalVisible(true);
  };

  const handleFinish = async () => {
    if (!selectedPlan) return;
    await register(name);
    if (!skipPin) await storePin(pin);
    setSubscriptionModalVisible(false);
    navigation.navigate('MainTabs');
  };

  const handleBackToData = () => {
    setSubscriptionModalVisible(false);
    setCurrentStep(1);
    setDataModalVisible(true);
  };

  return (
    <View className="flex-1 items-center justify-center relative overflow-hidden">
      <MotiView
        from={{ scale: 4 }}
        animate={{ scale: 2 }}
        transition={{ loop: true, type: 'timing', duration: 3000, easing: Easing.inOut(Easing.ease), repeatReverse: true }}
        className="absolute w-full h-full"
      >
        <LinearGradient
          colors={[ '#000000', '#1f1f1f', '#f43f5e' ]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ flex: 1, width: '100%', height: '100%' }}
        />
      </MotiView>

      <MotiImage
        source={require('../assets/dayo.png')}
        from={{ opacity: 0, scale: 0.01 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 3000, delay: 500 }}
        className="w-[400px] h-[250px] z-10"
        resizeMode="contain"
      />

      <MotiView
        from={{ opacity: 0, translateY: 140 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000, delay: 4000 }}
        className="absolute bottom-[6%] self-center -translate-x-1/2 z-10"
      >
        <TouchableOpacity
          className="bg-[#ff7a7f] rounded-full h-[50px] w-[200px] items-center justify-center shadow-lg"
          onPress={handleInitialContinue}
        >
          <Text className="text-white font-sans font-medium text-xl">Continue</Text>
        </TouchableOpacity>
      </MotiView>

      <DataModal
        visible={dataModalVisible}
        currentStep={currentStep}
        name={name}
        setName={setName}
        pin={pin}
        setPin={setPin}
        skipPin={skipPin}
        toggleSkipPin={() => setSkipPin(prev => !prev)}
        acceptTerms={acceptTerms}
        toggleAcceptTerms={toggleAcceptTerms}
        handleNextStep={handleNextStep}
        onClose={() => { setDataModalVisible(false); setCurrentStep(0); }}
      />

      <SubscriptionModal
        visible={subscriptionModalVisible}
        currentStep={currentStep}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        onBack={handleBackToData}
        onFinish={handleFinish}
      />
    </View>
  );
}
