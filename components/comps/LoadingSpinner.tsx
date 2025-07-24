import React, { useEffect, useRef } from 'react';
import { Modal, Text, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

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

  useEffect(() => {
    if (visible) {
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
          duration: 1200,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    } else {
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
      ]).start();

      // Para a animação de rotação
      spinAnimation.current?.stop();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent
      visible={visible}
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
            backgroundColor: 'rgba(28, 28, 30, 0.9)',
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
            <Feather name="loader" size={32} color="#ff7a7f" />
          </Animated.View>
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontFamily: 'Poppins',
            textAlign: 'center',
            opacity: 0.9,
          }}>
            {text}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default LoadingSpinner;