import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedBackButtonProps {
  onPress: () => void;
}

const AnimatedBackButton: React.FC<AnimatedBackButtonProps> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconTranslateX = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(iconTranslateX, {
        toValue: -3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconTranslateX, {
        toValue: 0,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(63, 63, 70, 0.9)',
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateX: iconTranslateX }],
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#f472b6" />
        </Animated.View>
        
        <Text
          style={{
            color: '#fda4af',
            fontSize: 16,
            fontWeight: '500',
            marginLeft: 8,
          }}
        >
          Voltar
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedBackButton;