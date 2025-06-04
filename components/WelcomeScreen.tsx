import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../widgets/types';
import Animated, { Easing } from 'react-native-reanimated';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const CELL_COUNT = 6;
  const ref = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: pin, setValue: setPin });

  const handleInitialContinue = () => {
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate('MainTabs', { screen: 'Home', params: { userName: name, pin } });
  };

  const isConfirmEnabled = name.trim().length > 0 && pin.length === CELL_COUNT;

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
          className="bg-rose-500 rounded-full h-[50px] w-[200px] items-center justify-center"
          onPress={handleInitialContinue}
        >
          <Text className="text-white font-sans font-medium text-xl">Continue</Text>
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
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black">
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

          <View className= "h-[300px] p-4 justify-around w-[80%]">
            <TextInput
              className="bg-neutral-800 text-white px-4 py-4 rounded-3xl "
              placeholder="Your name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />

            <CodeField
              ref={ref}
              {...props}
              value={pin}
              onChangeText={setPin}
              cellCount={CELL_COUNT}
              rootStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  onLayout={getCellOnLayoutHandler(index)}
                  className={`w-10 h-10 border-b-2  ${
                    isFocused ? 'border-rose-500' : 'border-gray-500'
                  } items-center justify-center`}
                >
                  <Text className="text-white font-sans text-4xl">
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-500 px-4 py-2 rounded"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                className={`px-4 py-2 rounded ${isConfirmEnabled ? 'bg-rose-500' : 'bg-gray-400'}`}
                disabled={!isConfirmEnabled}
              >
                <Text className="text-white">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
