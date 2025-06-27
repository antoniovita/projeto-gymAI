import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';

const PinScreen = () => {
  const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (index < 5) {
        inputs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleSubmit = () => {
    const code = pin.join('');
    console.log('PIN submitted:', code);
  };

  return (
    <View className="flex-1 bg-neutral-800 px-5 justify-center items-center">
      <Text className="absolute top-[15%] text-white text-2xl mb-8 font-sans">Bem-vindo de volta!</Text>

      <View className="flex-row justify-center items-center mb-10">
        {pin.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => { inputs.current[idx] = ref; }}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={value => handleChange(value, idx)}
            value={digit}
            className="rounded-2xl bg-neutral-900 w-[40px] h-[50px] mx-2 text-white font-sans text-2xl text-center"
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        className="w-[60%] absolute self-center bottom-[10%] bg-[#ff7a7f] py-3 rounded-full items-center"
      >
        <Text className="text-white font-sans font-bold text-lg">Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinScreen;
