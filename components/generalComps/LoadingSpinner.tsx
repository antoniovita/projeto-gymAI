import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface LoadingSpinnerProps {
  visible: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  text = 'Carregando...'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const showStartTime = useRef<number | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const [internalVisible, setInternalVisible] = useState(false);
  
  // Add theme hook
  const theme = useTheme();
  
  const ANIMATION_DURATION = 1200; // Duração de uma volta completa
  const MIN_DISPLAY_TIME = ANIMATION_DURATION; // Tempo mínimo de exibição

  useEffect(() => {
    if (visible) {
      // Limpa qualquer timeout pendente
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
      
      // Marca o tempo de início da exibição
      showStartTime.current = Date.now();
      setInternalVisible(true);
      
      // Animações de entrada
      Animated.parallel([
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animação de rotação
      spinValue.setValue(0);
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    } else {
      // Calcula quanto tempo passou desde que começou a mostrar
      const elapsedTime = showStartTime.current ? Date.now() - showStartTime.current : 0;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);
      
      // Se ainda não passou o tempo mínimo, espera
      if (remainingTime > 0) {
        hideTimeout.current = setTimeout(() => {
          hideSpinner();
        }, remainingTime);
      } else {
        // Se já passou o tempo mínimo, esconde imediatamente
        hideSpinner();
      }
    }

    // Cleanup function
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    };
  }, [visible]);

  const hideSpinner = () => {
    // Animações de saída
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Callback executado quando a animação de saída termina
      setInternalVisible(false);
      showStartTime.current = null;
    });
    
    // Para a animação de rotação
    spinAnimation.current?.stop();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent
      visible={internalVisible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={{
          opacity: fadeValue,
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 120,
            minHeight: 120,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
              marginBottom: 12,
            }}
          >
            <Feather name="loader" size={32} color={theme.colors.primary} />
          </Animated.View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontFamily: 'Poppins',
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            {text}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default LoadingSpinner;