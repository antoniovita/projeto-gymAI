import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, Animated, Dimensions, View, Pressable } from 'react-native';

const { width, height } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  currentLevel: number;
  onClose: () => void;
  xpGained?: number;
  title?: string;
  subtitle?: string;
  newXp?: number; // XP atual após ganhar o XP adicional
  totalXpToNext?: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  currentLevel,
  onClose,
  xpGained = 100,
  title = "Parabéns!",
  subtitle = "Você subiu de nível",
  newXp = 150, // XP atual após ganhar o XP adicional
  totalXpToNext = 500,
}) => {
  // Estado para controlar o número do nível exibido
  const [displayLevel, setDisplayLevel] = useState(currentLevel - 1);

  // Animações principais
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const slideValue = useRef(new Animated.Value(30)).current;
  
  // Animações dos elementos
  const levelScale = useRef(new Animated.Value(0)).current;
  const levelChangeScale = useRef(new Animated.Value(1)).current;
  const progressFill = useRef(new Animated.Value(0)).current;
  const progressEmpty = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(50)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Animação do botão continuar
  const closeButtonScale = useRef(new Animated.Value(0)).current;

  // Calcula o XP antigo (antes de ganhar o XP adicional)
  const oldXp = newXp - xpGained;
  const oldXpPercentage = (oldXp / totalXpToNext) * 100;

  useEffect(() => {
    if (visible) {
      // Reset dos valores
      setDisplayLevel(currentLevel - 1);
      fadeValue.setValue(0);
      scaleValue.setValue(0.8);
      slideValue.setValue(30);
      levelScale.setValue(0);
      levelChangeScale.setValue(1);
      progressFill.setValue(oldXpPercentage); // Começa com o XP antigo
      progressEmpty.setValue(0);
      statsSlide.setValue(50);
      closeButtonScale.setValue(0);
      sparkleOpacity.setValue(0);

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
        // Delay antes da animação da barra
        Animated.delay(500),
        // Animação da barra: preenche do XP antigo até 100%
        Animated.timing(progressFill, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: false,
        }),
        // Delay no 100% + animação do número do nível
        Animated.delay(300),
        // Animação do número do nível mudando
        // Esvazia a barra
        Animated.timing(progressFill, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
        // Delay pequeno após esvaziar
        Animated.delay(100),
        // Preenche 5% inicial do novo nível
        Animated.timing(progressEmpty, {
          toValue: 5,
          duration: 400,
          useNativeDriver: false,
        }),
        // Delay antes dos elementos finais
        Animated.delay(200),
        // Stats cards aparecem
        Animated.spring(statsSlide, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        // Botão continuar
        Animated.spring(closeButtonScale, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Timer para mudar o número do nível
      const levelChangeTimer = setTimeout(() => {
        setDisplayLevel(currentLevel);
      }, 2100); // Timing calculado para coincidir com a animação

      // Animações contínuas
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const sparkleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleOpacity, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );

      // Inicia animações contínuas após um delay
      const startContinuousTimer = setTimeout(() => {
        pulseAnimation.start();
        sparkleAnimation.start();
      }, 2000);

      return () => {
        clearTimeout(levelChangeTimer);
        clearTimeout(startContinuousTimer);
        pulseAnimation.stop();
        sparkleAnimation.stop();
      };
    }
  }, [visible, currentLevel, oldXpPercentage]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 300,
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
        {/* Efeitos de fundo */}
        <Animated.View
          style={{
            position: 'absolute',
            width: width,
            height: height,
            opacity: sparkleOpacity,
          }}
        >
          {/* Partículas/efeitos podem ser adicionados aqui */}
        </Animated.View>

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

          {/* Level Badge com animação melhorada */}
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: levelScale }],
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { scale: pulseValue },
                  { scale: levelChangeScale }
                ],
              }}
            >
              <View className="w-24 h-24 bg-rose-500 rounded-full items-center justify-center pt-2 mb-3">
                <Text className="text-white font-sans text-4xl font-bold">
                  {displayLevel}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* XP Progress com design melhorado */}
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
            
            <View className="bg-zinc-600 rounded-full h-3 mb-3 relative">
              {/* Barra de preenchimento completo (efeito de completar nível) */}
              <Animated.View
                className="bg-rose-500 rounded-full h-3 absolute top-0 left-0"
                style={{
                  width: progressFill.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                }}
              />
              
              {/* Barra do progresso atual (novo nível) */}
              <Animated.View
                className="bg-rose-500 rounded-full h-3 absolute top-0 left-0"
                style={{
                  width: progressEmpty.interpolate({
                    inputRange: [0, 5, 100],
                    outputRange: ['0%', '5%', '100%'],
                    extrapolate: 'clamp',
                  }),
                }}
              />
            </View>
            
            <Text className="text-zinc-400 text-sm text-center">
              {newXp}/{totalXpToNext} XP
            </Text>
          </Animated.View>

          {/* Botão Continuar melhorado */}
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