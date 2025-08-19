import React, { useEffect, useRef } from 'react';
import { Modal, Text, Animated, Dimensions, View, Pressable } from 'react-native';

const { width, height } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  currentLevel: number;
  onClose: () => void;
  xpGained?: number;
  title?: string;
  subtitle?: string;
  newXp?: number;
  totalXpToNext?: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  currentLevel,
  onClose,
  xpGained = 100,
  title = "Parabéns!",
  subtitle = "Você subiu de nível!",
  newXp = 150,
  totalXpToNext = 500,
}) => {
  // Animações principais
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const slideValue = useRef(new Animated.Value(30)).current;
  
  // Animações dos elementos
  const levelScale = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(50)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Partículas
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle1Opacity = useRef(new Animated.Value(0)).current;
  const particle2Opacity = useRef(new Animated.Value(0)).current;

  // Animação do botão continuar
  const closeButtonScale = useRef(new Animated.Value(0)).current;

  const xpPercentage = (newXp / totalXpToNext) * 100;

  useEffect(() => {
    if (visible) {
      // Reset dos valores
      fadeValue.setValue(0);
      scaleValue.setValue(0.8);
      slideValue.setValue(30);
      levelScale.setValue(0);
      progressWidth.setValue(0);
      statsSlide.setValue(50);
      closeButtonScale.setValue(0);

      // Sequência de animações
      Animated.sequence([
        // Entrada do modal
        Animated.parallel([
          Animated.timing(fadeValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(slideValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Animação do nível
        Animated.spring(levelScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        // Barra de progresso (sem animação)
        Animated.timing(progressWidth, {
          toValue: xpPercentage,
          duration: 0,
          useNativeDriver: false,
        }),
        // Stats cards
        Animated.spring(statsSlide, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        // Botão continuar
        Animated.spring(closeButtonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animações contínuas
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      const sparkleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      sparkleAnimation.start();

      // Partículas
      const particleAnimation1 = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(particle1Y, {
              toValue: -40,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle1Opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(1500),
              Animated.timing(particle1Opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(particle1Y, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      const particleAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.delay(800),
          Animated.parallel([
            Animated.timing(particle2Y, {
              toValue: -35,
              duration: 2200,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle2Opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.delay(1400),
              Animated.timing(particle2Opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(particle2Y, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      particleAnimation1.start();
      particleAnimation2.start();

      // Auto close
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 60000000000);

      return () => {
        clearTimeout(autoCloseTimer);
        pulseAnimation.stop();
        sparkleAnimation.stop();
        particleAnimation1.stop();
        particleAnimation2.stop();
      };
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          opacity: fadeValue,
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Modal Principal */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleValue },
              { translateY: slideValue }
            ],
            backgroundColor: '#35353a',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            width: width * 0.9,
            maxWidth: 340,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          }}
        >


          {/* Título e Subtítulo */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginBottom: 24,
              marginTop: 8,
              transform: [{ translateY: slideValue }],
            }}
          >
            <Text className="text-white font-sans text-2xl font-bold mb-2">
              {title}
            </Text>
            <Text className="text-zinc-300 font-sans text-base">
              {subtitle}
            </Text>
          </Animated.View>

          {/* Level Badge */}
          <Animated.View
            style={{
              alignItems: 'center',
            }}
          >
            <Animated.View
              style={{
              }}
            >
              <View className="w-24 h-24 bg-rose-500 rounded-full items-center justify-center pt-2 mb-3">
                <Text className="text-white font-sans text-4xl font-bold">{currentLevel}</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* XP Progress */}
          <Animated.View
            style={{
              width: '100%',
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-medium text-base">Progresso XP</Text>
              <Animated.View style={{ opacity: sparkleOpacity }}>
                <Text className="text-rose-400 text-sm font-bold">+{xpGained} XP</Text>
              </Animated.View>
            </View>
            <View className="bg-zinc-600 rounded-full h-3 mb-3">
              <Animated.View
                className="bg-gradient-to-r from-rose-500 to-rose-400 rounded-full h-3"
                style={{
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                }}
              />
            </View>
            <Text className="text-zinc-400 text-sm text-center">
              {newXp}/{totalXpToNext} XP
            </Text>
          </Animated.View>

          {/* Botão Continuar */}
          <Animated.View
            style={{
              width: '100%',
              marginTop: 24,
              transform: [{ scale: closeButtonScale }],
            }}
          >
            <Pressable
              onPress={handleClose}
              style={{
                backgroundColor: '#f43f5e',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-sans text-lg">
                Continuar
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default LevelUpModal;