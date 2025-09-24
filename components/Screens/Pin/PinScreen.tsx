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
  TextInputKeyPressEventData,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from 'tabs/types';
import { useTheme } from 'hooks/useTheme';
import { MAIN } from 'imageConstants';
import { Avatar } from 'components/generalComps/Avatar';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 6;

const PinScreen = () => {
  const [pin, setPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  const [showError, setShowError] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { verifyPin, loading, getPin } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { colors } = theme;

  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      if (index < PIN_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
        // Auto submit when all digits are filled
        setTimeout(() => {
          handleSubmit();
          navigation.navigate("MainTabs")
        }, 300);
      }
    }
  };

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
      setShowError(false);
    }
  };

  const handleSubmit = async () => {
    const code = pin.join('');
    if (code.length !== PIN_LENGTH) return;

    try {
      const isValid = await verifyPin(code);
      if (isValid) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        setShowError(true);
        Alert.alert('PIN inválido', 'O PIN digitado não corresponde ao armazenado.');
        setPin(new Array(PIN_LENGTH).fill(''));
        inputs.current[0]?.focus();
        setTimeout(() => setShowError(false), 3000);
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
      disableDeviceFallback: true,
      cancelLabel: 'Cancelar',
    });

    if (!success) {
      console.log('Autenticação falhou');
      return;
    }

    const savedPin = await getPin();
    if (!savedPin || savedPin.length !== PIN_LENGTH) {
      Alert.alert('Erro', 'PIN não encontrado ou inválido.');
      return;
    }

    setPin(savedPin.split(''));
    Keyboard.dismiss();
    
    // Auto navigate after biometric success
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }, 500);
  };

  const clearPin = () => {
    setPin(new Array(PIN_LENGTH).fill(''));
    setShowError(false);
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? 30 : 0
    }}>
      <StatusBar 
        backgroundColor={colors.background}
      />

      {/* Header com botão voltar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          paddingVertical: 15,
        }}
      >
        <TouchableOpacity
          onPress={clearPin}
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: `${colors.primary}10`,
          }}
        >
          <Text style={{
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
            fontFamily: "Poppins_600SemiBold"
          }}>
            Limpar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Container principal */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        
        {/* Logo */}
        <View
          style={{
            marginBottom: 10,
            alignItems: 'center',
          }}
        >
          <Avatar
            source={MAIN.fuocoICON}
            blinkSource={MAIN.fuocoPISCANDO}
            width={150}
            height={150}
            containerStyle={{ 
              alignSelf: 'center', 
              marginTop: 40 
            }}
          />
        </View>

        {/* Título */}
        <View
          style={{ alignItems: 'center', marginBottom: 40 }}
        >
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
            textAlign: 'center',
            marginBottom: 10
          }}>
            Digite seu PIN
          </Text>
          <Text style={{
            fontSize: 16,
            color: `${colors.text}80`,
            fontFamily: "Poppins_400Regular",
            textAlign: 'center'
          }}>
            Muito feliz em te ver de volta!
          </Text>
        </View>

        {/* PIN Input Fields */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40,
            paddingHorizontal: 10,
          }}
        >
          {pin.map((digit, index) => (
            <View
              key={index}
              style={{ marginHorizontal: 6 }}
            >
              <TextInput
                ref={(ref) => { inputs.current[index] = ref; }}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                style={{
                  width: 50,
                  height: 60,
                  borderRadius: 12,
                  backgroundColor: digit ? colors.primary : `${colors.secondary}`,
                  color: colors.background,
                  fontSize: 24,
                  fontWeight: '700',
                  textAlign: 'center',
                  fontFamily: "Poppins_700Bold",
                  elevation: digit ? 8 : 4,
                  borderWidth: showError ? 2 : 0,
                  borderColor: showError ? '#FF6B6B' : 'transparent',
                }}
              />
            </View>
          ))}
        </View>

        {/* Mensagem de erro */}
        {showError && (
          <View
            style={{
              backgroundColor: '#FF6B6B20',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              marginBottom: 30,
              borderWidth: 1,
              borderColor: '#FF6B6B40',
            }}
          >
            <Text style={{
              color: '#FF6B6B',
              fontSize: 14,
              fontFamily: "Poppins_500Medium",
              textAlign: 'center'
            }}>
              PIN incorreto. Tente novamente.
            </Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 40
            }}
          >
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                  marginHorizontal: 5,
                  opacity: 0.5
                }}
              />
            ))}
          </View>
        )}

        {/* Botão Biométrico */}
        <View
          style={{alignSelf: 'center'}}
        >
          <TouchableOpacity
            onPress={handleBiometric}
            disabled={loading}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: `${colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
              elevation: 8,
              borderWidth: 2,
              borderColor: `${colors.primary}30`,
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="finger-print" 
              size={32} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PinScreen;