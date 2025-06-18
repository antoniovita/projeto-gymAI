import React, { useRef, useState } from 'react';
import { TouchableOpacity, Animated, Easing, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RefreshButton({ onPress }: { onPress: () => void }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const [isRotating, setIsRotating] = useState(false);

  const startRotation = () => {
    setIsRotating(true);
    rotation.setValue(0); // garante que comece do zero
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 400, // mais rápido
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    setIsRotating(false);
    rotation.stopAnimation(() => {
      rotation.setValue(0); // resetar ao parar para não ficar "meio girado"
    });
  };

  const handlePress = () => {
    if (isRotating) return;
    startRotation();
    onPress();
    setTimeout(() => {
      stopRotation();
    }, 1200); // dura um pouco menos, ajuste conforme quiser
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={{
          transform: [{ rotate: rotateInterpolate }],
          justifyContent: 'center',
          alignItems: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Ionicons name="refresh-circle-outline" size={24} color="#ff7a7f" />
      </Animated.View>
    </TouchableOpacity>
  );
}
