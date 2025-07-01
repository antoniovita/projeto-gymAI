import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Image,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../hooks/useAuth'; 
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from 'widgets/types';

const PIN_LENGTH = 6;

const PinScreen = () => {
  const [pin, setPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const { verifyPin, loading, getPin } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  
  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (index < PIN_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  //delete em sequencia funcionando, quando já está '' ele vai mais um pra trás e define ''
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newPin = [...pin];
      if (pin[index] !== '') {

        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {

        newPin[index - 1] = '';
        setPin(newPin);
        inputs.current[index - 1]?.focus();
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
        setPin(new Array(PIN_LENGTH).fill(''));
        inputs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível verificar o PIN.');
    }
  };

 const handleBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        'Biometria indisponível',
        'Este dispositivo não suporta ou não possui biometria configurada.'
      );
      return;
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let promptMessage = '';
    let disableFallback = true;

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      promptMessage = 'Autentique-se com Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      promptMessage = 'Autentique-se com Touch ID';
    } else {
      Alert.alert(
        'Biometria indisponível',
        'Este dispositivo não suporta Face ID nem Touch ID.'
      );
      return;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: disableFallback,
      cancelLabel: 'Cancelar',
    });
    if (!success) {
      console.log('Autenticação falhou');
      Alert.alert('Autenticação falhou', 'Não foi possível autenticar.');
      return;
    }

    const savedPin = await getPin();
    if (!savedPin || savedPin.length !== PIN_LENGTH) {
      Alert.alert('Erro', 'PIN não encontrado ou inválido.');
      return;
    }
    setPin(savedPin.split(''));
    Keyboard.dismiss();
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
            ref={ref => {
              inputs.current[idx] = ref;
            }}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={value => handleChange(value, idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            value={digit}
            className="rounded-xl bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 w-[50px] h-[60px] mx-1 text-white text-2xl text-center"
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleBiometric}
        disabled={loading}
        className="flex-row items-center justify-center mb-4"
        style={{ alignSelf: 'center' }}
      >
        <Ionicons name="finger-print-outline" size={32} color="#fff" />
        <Text className="text-white ml-2 font-sans">Entrar com biometria</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="bg-[#ff7a7f] rounded-xl h-[50px] absolute self-center bottom-[10%] w-[250px] flex-row items-center justify-center"
      >
        <Text className="text-white font-sans text-xl">
          {loading ? 'Validando...' : 'Entrar'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Alert.alert('Recuperar PIN', 'Implemente a lógica de recuperação aqui.')}
        className="absolute self-center bottom-[6.2%] w-[250px] items-center justify-center"
      >
        <Text className="text-white text-sm font-sans">Esqueci meu PIN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinScreen;
