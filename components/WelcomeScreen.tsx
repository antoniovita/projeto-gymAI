import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import Animated, { Easing } from 'react-native-reanimated';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Premium' | null>(null);
  const CELL_COUNT = 6;
  const ref = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: pin, setValue: setPin });

  const handleInitialContinue = () => {
    setModalVisible(true);
  };

  const handleNextStep = () => {
    setSubscriptionModalVisible(true);
  };

  const handleSubscriptionChoice = (type: 'free' | 'premium') => {
    setSubscriptionModalVisible(false);
    setModalVisible(false);
    navigation.navigate('MainTabs', { screen: 'Home', params: { userName: name, pin, subscription: type } });
  };

  return (
    <View className="flex-1 items-center justify-center relative overflow-hidden">
      <MotiView
        from={{ scale: 4 }}
        animate={{ scale: 2 }}
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
          className="bg-rose-500 rounded-full h-[50px] flex flex-row w-[200px] items-center justify-center"
          onPress={handleInitialContinue}
        >
          <Text className="text-white font-sans font-medium text-xl px-3">Continue</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="white" />
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 mt-[260px] bg-black">
          <View className="absolute top-[-20%] gap-1 left-[6%] z-10">
            <Text className='text-white font-sans text-3xl max-w-[300px]'>Bem vindo ao             ,</Text>
            <Text className='text-white font-sans text-3xl max-w-[300px]'>inicie sua jornada!</Text>
          </View>

          <View className="absolute top-[-28.5%] left-[47.8%] z-10">
            <Image
              source={require('../assets/dayo.png')}
              className="w-[130px] h-[130px]"
              resizeMode="contain"
            />
          </View>

          <MotiView
            from={{ scale: 4 }}
            animate={{ scale: 2 }}
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

          <View className="h-[300px] p-4 mt-[45px]">
            <Text className='text-neutral-200 font-sans text-[14px] mb-3 px-5'>Insira seu nome:</Text>
            <View className='flex items-center mb-[60px]'>
              <TextInput
                className="bg-neutral-800 font-sans text-lg text-white h-[50px] w-[335px] px-5 rounded-2xl"
                placeholder="Your name"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text className='text-neutral-200 font-sans text-[14px] mb-3 px-5'>Crie o seu PIN:</Text>
            <View className="flex items-center justify-center">
              <CodeField
                ref={ref}
                {...props}
                value={pin}
                onChangeText={setPin}
                cellCount={CELL_COUNT}
                rootStyle={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                placeholder="0"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    key={index}
                    onLayout={getCellOnLayoutHandler(index)}
                    className={`w-[48px] h-[60px] rounded-xl items-center justify-center mx-1 ${
                      isFocused ? 'bg-rose-500' : 'bg-neutral-800'
                    }`}
                  >
                    <Text className="text-white font-sans text-2xl">
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>

          <View className="absolute bottom-[10%] left-1/4 z-10">
            <TouchableOpacity
              className="bg-rose-500 rounded-full h-[50px] flex flex-row w-[200px] items-center justify-center"
              onPress={handleNextStep}
              disabled={name.trim().length === 0 || pin.length !== CELL_COUNT}
            >
              <Text className="text-white font-sans font-medium text-xl px-3">Next step</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="white" />
            </TouchableOpacity>

            <Modal visible={subscriptionModalVisible} transparent={true} animationType="slide">
                <View className="flex-1 justify-center items-center bg-neutral-800">
                  <View className="flex h-screen z-20 mt-[300px]">
                    <Text className="text-white font-sans text-2xl mb-4 text-center">Escolha seu plano</Text>

                    <View className="flex flex-row gap-4 items-center mt-[50px] justify-center">
                      <TouchableOpacity
                        className={`w-[170px] h-[370px] p-5 flex flex-col rounded-2xl justify-between items-start ${
                          selectedPlan === 'Free' ? 'border-rose-400 border-[0.5px]' : ''
                        } bg-neutral-800`}
                        onPress={() => setSelectedPlan('Free')}
                      >
                        <View className='flex flex-col gap-3'>
                          <Text className="text-white font-sans text-2xl mb-3">Free</Text>
                          <Text className="text-neutral-400 font-sans text-[15px]">• Acesso limitado</Text>
                          <Text className="text-neutral-400 font-sans text-[15px]">• 3 usos por dia</Text>
                          <Text className="text-neutral-400 font-sans text-[15px]">• Sem suporte prioritário</Text>
                        </View>
                        <Text className="text-white font-sans text-xl mt-4 mb-7">R$ 0,00</Text>
                      </TouchableOpacity>

                      {/* Plano Premium */}
                      <TouchableOpacity
                        className={`w-[170px] h-[370px] p-5 flex flex-col rounded-2xl justify-between items-start ${
                          selectedPlan === 'Premium' ? 'border-rose-400 border-[0.5px]' : ''
                        } bg-neutral-800`}
                        onPress={() => setSelectedPlan('Premium')}
                      >
                        <View>
                          <Text className="text-white font-sans text-2xl mb-3">Premium</Text>
                          <Text className="text-neutral-400 font-sans text-sm">• Uso ilimitado</Text>
                          <Text className="text-neutral-400 font-sans text-sm">• Suporte prioritário</Text>
                          <Text className="text-neutral-400 font-sans text-sm">• Novas funções exclusivas</Text>
                        </View>

                        <View>
                          <Text className="text-white font-sans text-xl mt-4">R$ 9,90/mês</Text>
                          <View className="flex flex-row items-center gap-2 mt-2">
                            <Ionicons name="checkmark-circle" size={20} color="#f43f5e" />
                            <Text className="text-white font-sans text-sm">Recomendado</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>


                  </View>

                  <MotiView
                    from={{ scale: 4 }}
                    animate={{ scale: 2 }}
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
                </View>

                  <TouchableOpacity
                className="bg-rose-500 rounded-full h-[50px] bottom-[10%] left-[25%] flex  absolute flex-row w-[200px] items-center justify-center"
                onPress={handleNextStep}
                disabled={name.trim().length === 0 || pin.length !== CELL_COUNT}
              >
                <Text className="text-white font-sans font-medium text-xl px-3">Finish</Text>
                <Ionicons name="chevron-forward-outline" size={20} color="white" />
              </TouchableOpacity>
              
              </Modal>



          </View>
        </View>
      </Modal>
    </View>
  );
}
