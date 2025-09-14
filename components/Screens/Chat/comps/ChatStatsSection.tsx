import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MAIN } from "imageConstants";
import { View, Text, Image, Animated} from "react-native";

type ChatStatsSectionProps = {
  isTyping: boolean;
};

const ChatStatsSection: React.FC<ChatStatsSectionProps> = ({ isTyping }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Refs para animação
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
    const randomInterval = Math.random() * 3000 + 2000;
    blinkTimeoutRef.current = setTimeout(() => {
      performBlink();
      scheduleBlink();
    }, randomInterval);
  }, [performBlink]);

  useEffect(() => {
    // Só agenda o piscar se NÃO estiver digitando
    if (!isTyping) {
      scheduleBlink();
    }
    
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [scheduleBlink, isTyping]);

  // Limpa o timeout quando começa a digitar
  useEffect(() => {
    if (isTyping && blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }
  }, [isTyping]);

  return (
    <View className="mx-4 mb-4 mt-4 rounded-2xl overflow-hidden bg-[#35353a] h-[120px] flex-row justify-end items-center gap-3 relative">
      {/* Imagem base - muda baseado em isTyping */}
      <Image
        source={isTyping ? MAIN.fuocoTALKING : MAIN.fuocoPISCANDO}
        style={{
          position: 'absolute',
          width: 150,
          height: 150,
          left: 0,
          bottom: -35,
        }}
      />
      
      {/* Animação de piscar - só aparece quando NÃO está digitando */}
      {!isTyping && (
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            bottom: -35,
            opacity: blinkOpacity,
          }}
        >
          <Image
            source={MAIN.fuocoICON}
            style={{
              width: 150,
              height: 150,
            }}
          />
        </Animated.View>
      )}
      
      <View className="h-[100%] w-[60%] flex-col p-4">
        <View className="flex-row self-end justify-between items-center gap-2 rounded-2xl bg-[#1e1e1e] px-3 py-1">
          <View style={{width: 10, height: 10, borderRadius: "100%", backgroundColor: "#ffa41f"}} />
          <Text className="text-white font-poppins"> Fuoco </Text>
        </View>
      </View>
    </View>
  );
};

export default ChatStatsSection;