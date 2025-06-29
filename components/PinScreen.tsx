import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from "react-native-reanimated";
import { useAuth } from '../hooks/useAuth'; // ajuste o caminho conforme sua estrutura
import { useNavigation, NavigationProp } from '@react-navigation/native';

const PinScreen = () => {
  const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const { verifyPin, loading } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (index < pin.length - 1) {
        inputs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleSubmit = async () => {
    const code = pin.join('');
    try {
      const isValid = await verifyPin(code);
      if (isValid) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert('PIN inválido', 'O PIN digitado não corresponde ao armazenado.');
        // você pode também limpar o estado ou dar enfoque no primeiro input:
        setPin(new Array(6).fill(''));
        inputs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível verificar o PIN.');
    }
  };

  return (
    <View className="flex-1 bg-neutral-800 px-5 justify-center">
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
          style={{ flex: 1, width: '100%', height: '100%' }}
        />
      </MotiView>

      <Image
        source={require('../assets/dayo.png')}
        className="w-[100px] h-[150px] z-10 absolute self-center top-[5%]"
      />

      <View className="flex-row justify-center items-center mb-10">
        {pin.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => { inputs.current[idx] = ref; }}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={value => handleChange(value, idx)}
            value={digit}
            className="rounded-xl bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 w-[50px] h-[60px] self-center mx-1 text-white font-sans text-2xl text-center"
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="bg-[#ff7a7f] rounded-xl h-[50px] absolute self-center bottom-[10%] w-[250px] items-center justify-center flex-row"
      >
        <Text className="text-white font-sans font-medium text-xl px-3">
          {loading ? 'Validando...' : 'Entrar'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Alert.alert('Recuperar PIN', 'Implemente a lógica de recuperação aqui.')}
        className="absolute self-center bottom-[6.2%] w-[250px] items-center justify-center flex-row"
      >
        <Text className="text-white font-sans font-medium text-sm px-3">
          Esqueci meu PIN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinScreen;
