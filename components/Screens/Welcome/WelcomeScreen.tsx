//general imports
import { useTheme } from 'hooks/useTheme';
import { SafeAreaView, MotiView } from 'moti';
import { Platform, Image, View, Text, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { MAIN } from 'imageConstants';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'tabs/types';
import { Avatar } from 'components/generalComps/Avatar';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { colors } = theme;
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Refs para animação de piscar
  const blinkOpacity = useRef(new Animated.Value(1)).current;
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performBlink = useCallback(() => {
    setIsBlinking(true);
    Animated.timing(blinkOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(blinkOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start(() => setIsBlinking(false));
    });
  }, [blinkOpacity]);

  const scheduleBlink = useCallback(() => {
    const randomInterval = Math.random() * 3000 + 2000; // Entre 2-5 segundos
    blinkTimeoutRef.current = setTimeout(() => {
      performBlink();
      scheduleBlink();
    }, randomInterval);
  }, [performBlink]);

  useEffect(() => {
    scheduleBlink();
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [scheduleBlink]);

  const handleGoogleLogin = () => {
    navigation.navigate("PinScreen");
  };

  const handleAppleLogin = () => {
    // Implementar login com Apple
    console.log('Login com Apple');
  };

  const handleEmailLogin = () => {
    // Implementar login com Email
    console.log('Login com Email');
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? 30 : 0
    }}>
      {/* Container principal centralizado */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 300
      }}>
        
        {/* Container do logo com animação */}
        <MotiView
          from={{
            scale: 0,
            opacity: 0,
            rotateZ: '0deg'
          }}
          animate={{
            scale: 1,
            opacity: 1,
            rotateZ: '360deg'
          }}
          transition={{
            type: 'spring',
            duration: 2000,
            delay: 500
          }}
          style={{
            marginBottom: 40,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Círculo de fundo com pulso */}
          <MotiView
            from={{
              scale: 1
            }}
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              type: 'timing',
              duration: 3000,
              loop: true
            }}
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              opacity: 0.15
            }}
          />
          
          {/* Imagem do logo que pisca */}
          <View style={{ position: 'relative' }}>
            
            <Avatar
              source={MAIN.fuocoICON}
              blinkSource={MAIN.fuocoPISCANDO}
              width={180}
              height={180}
              containerStyle={{ 
                alignSelf: 'center', 
                marginTop: 40 
              }}
            />
            
          </View>
        </MotiView>

        {/* Indicadores de loading */}
        <MotiView
          from={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 2500
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40
          }}
        >
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              from={{
                scale: 0.5,
                opacity: 0.3
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                type: 'timing',
                duration: 1500,
                delay: index * 200,
                loop: true
              }}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
                marginHorizontal: 4
              }}
            />
          ))}
        </MotiView>

        {/* Botões de Login */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 30
          }}
          animate={{
            opacity: 1,
            translateY: 0
          }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 3500
          }}
          style={{
            width: '100%',
            maxWidth: 300,
            marginTop: 120,
            gap: 12
          }}
        >
          {/* Botão Google */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: '#dddddd',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Image
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={{
                width: 20,
                height: 20,
                marginRight: 12
              }}
            />
            <Text style={{
              color: '#333333',
              fontSize: 16,
              fontWeight: '500',
              fontFamily: "Poppins_500Medium"
            }}>
              Continuar com Google
            </Text>
          </TouchableOpacity>

          {/* Botão Apple - só mostra no iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={handleAppleLogin}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                paddingVertical: 12,
                borderRadius: 15,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >

              <Ionicons name='logo-apple' size={24} color='#ffffff' style={{ marginRight: 16 }} />

              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '500',
                marginRight: 15,
                fontFamily: "Poppins_500Medium"
              }}>
                Continuar com Apple
              </Text>
            </TouchableOpacity>
          )}
        </MotiView>

        {/* Efeito de ondas no fundo */}
        <MotiView
          from={{
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 0.1, 0]
          }}
          transition={{
            type: 'timing',
            duration: 4000,
            loop: true
          }}
          style={{
            position: 'absolute',
            width: width * 2,
            height: width * 2,
            borderRadius: width,
            borderWidth: 1,
            borderColor: colors.primary,
            zIndex: -1
          }}
        />

        <MotiView
          from={{
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.05, 0]
          }}
          transition={{
            type: 'timing',
            duration: 4000,
            delay: 1000,
            loop: true
          }}
          style={{
            position: 'absolute',
            width: width * 1.5,
            height: width * 1.5,
            borderRadius: width * 0.75,
            borderWidth: 1,
            borderColor: colors.primary,
            zIndex: -1
          }}
        />
      </View>

      {/* Footer */}
      <MotiView
        from={{
          opacity: 0,
          translateY: 30
        }}
        animate={{
          opacity: 1,
          translateY: 0
        }}
        transition={{
          type: 'timing',
          duration: 1000,
          delay: 3000
        }}
        style={{
          paddingBottom: 40,
          alignItems: 'center'
        }}
      >
      </MotiView>
    </SafeAreaView>
  );
}