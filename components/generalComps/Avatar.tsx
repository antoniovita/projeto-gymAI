import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Image, Animated } from 'react-native';

interface AvatarProps {
  source: any;
  blinkSource?: any;
  width: number;
  height: number;
  minBlinkInterval?: number;
  maxBlinkInterval?: number;
  blinkOutDuration?: number;
  blinkInDuration?: number;
  containerStyle?: any;
  imageStyle?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  blinkSource,
  width,
  height,
  minBlinkInterval = 2000,
  maxBlinkInterval = 5000,
  blinkOutDuration = 120,
  blinkInDuration = 240,
  containerStyle,
  imageStyle,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkOpacity = useRef(new Animated.Value(1)).current;
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performBlink = useCallback(() => {
    setIsBlinking(true);
    Animated.timing(blinkOpacity, {
      toValue: 0,
      duration: blinkOutDuration,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(blinkOpacity, {
        toValue: 1,
        duration: blinkInDuration,
        useNativeDriver: true,
      }).start(() => setIsBlinking(false));
    });
  }, [blinkOpacity, blinkOutDuration, blinkInDuration]);

  const scheduleBlink = useCallback(() => {
    const randomInterval = Math.random() * (maxBlinkInterval - minBlinkInterval) + minBlinkInterval;
    blinkTimeoutRef.current = setTimeout(() => {
      performBlink();
      scheduleBlink();
    }, randomInterval);
  }, [performBlink, minBlinkInterval, maxBlinkInterval]);

  useEffect(() => {
    scheduleBlink();
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [scheduleBlink]);

  const imageProps = {
    style: [{ width, height }, imageStyle],
  };

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      {/* Imagem de fundo (aparece durante o piscar se blinkSource for fornecida) */}
      {blinkSource && (
        <Image
          source={blinkSource}
          {...imageProps}
        />
      )}

      {/* Imagem principal com animação de piscar */}
      <Animated.View
        style={{
          position: blinkSource ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          opacity: blinkOpacity,
        }}
      >
        <Image
          source={source}
          {...imageProps}
        />
      </Animated.View>
    </View>
  );
};