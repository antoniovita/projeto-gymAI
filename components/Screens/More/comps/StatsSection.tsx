import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStats } from '../../../../hooks/useStats';
import { useAuth } from '../../../../hooks/useAuth';
import { useTask } from '../../../../hooks/useTask';
import GradientIcon from 'components/generalComps/GradientIcon';
import { MAIN } from 'imageConstants';

export const StatsSection = () => {
  const { userId } = useAuth();
  const {
    userStats,
    loadUserStats,
    currentLevel,
    currentXp,
    getLevelProgress,
    getXpToNextLevel,
    achievementCount,
  } = useStats();
  const { taskCompletedStats, tasks } = useTask();
  const [taskStats, setTaskStats] = useState({
    consecutiveDays: 0,
    completedTasksQuantity: 0
  });
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Refs para animação
  const blinkOpacity = useRef(new Animated.Value(1)).current;
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para criar o efeito de piscar realista
  const performBlink = useCallback(() => {
    setIsBlinking(true);
    
    // Primeira parte do piscar - fechar os olhos (mais rápido)
    Animated.timing(blinkOpacity, {
      toValue: 0,
      duration: 120, // Muito rápido para simular fechamento dos olhos
      useNativeDriver: true,
    }).start(() => {
      // Segunda parte - abrir os olhos (um pouco mais lento)
      Animated.timing(blinkOpacity, {
        toValue: 1,
        duration: 240, // Ligeiramente mais lento para abertura
        useNativeDriver: true,
      }).start(() => {
        setIsBlinking(false);
      });
    });
  }, [blinkOpacity]);

  // Configurar intervalos de piscar mais naturais
  const scheduleBlink = useCallback(() => {
    // Intervalo aleatório entre 2-5 segundos para parecer mais natural
    const randomInterval = Math.random() * 3000 + 2000;
    
    blinkTimeoutRef.current = setTimeout(() => {
      performBlink();
      scheduleBlink(); // Agendar próxima piscada
    }, randomInterval);
  }, [performBlink]);

  useEffect(() => {
    scheduleBlink();
    
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [scheduleBlink]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (userId) {
          try {
            await loadUserStats(userId);
            const stats = await taskCompletedStats(userId);
            setTaskStats(stats);
          } catch (error) {
            console.error('Erro ao carregar dados:', error);
          }
        }
      };
      loadData();
    }, [userId, tasks, currentLevel, currentXp, achievementCount, userStats?.badges?.length])
  );

  const xpPercentage = getLevelProgress();
  const xpToNextLevel = getXpToNextLevel();

  return (
    <View className="mb-4">
      {/* Seção de Nível e XP */}
      <View className="bg-[#35353a] rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-[#ffa41f] rounded-full items-center justify-center mr-3">
              <Text className="text-black font-bold text-lg">{currentLevel}</Text>
            </View>
            <Text className="text-white font-poppins text-base">Nível {currentLevel}</Text>
          </View>
          <Text className="text-zinc-400 font-poppins text-sm">
            {currentXp}/{currentXp + xpToNextLevel} XP
          </Text>
        </View>
        <View className="bg-zinc-600 rounded-full h-2">
          <View
            className="bg-[#ffa41f] rounded-full h-2"
            style={{ width: `${xpPercentage}%` }}
          />
        </View>
      </View>

      
      <View className='flex-row '>

          <View className=' flex-col w-[32%]  h-[100%] bg-[#35353a] rounded-2xl mr-3'>
              <TouchableOpacity className="absolute -top-2 -right-2 z-10">
                <View className="w-12 h-12 bg-zinc-800 rounded-full items-center justify-center">
                  <LinearGradient
                      colors={['#FFD45A', '#FFA928', '#FF7A00']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "100%"}}
                      >
                    <Ionicons name="bag-handle" strokeWidth={3} size={18} color="black" />
                  </LinearGradient>                
                </View>
              </TouchableOpacity>

              <View style={{ position: 'relative' }}>
                {/* Sombra no piso */}
                <View 
                  style={{
                    width: 50,
                    height: 9,
                    shadowColor: "black",
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                    borderRadius: 100,
                    position: 'absolute',
                    left: 33,
                    bottom: 2,
                    zIndex: 0
                  }}
                />
                
                <View style={{ position: 'relative' }}>
                  <Image
                    source={MAIN.fuocoPISCANDO}
                    style={{
                      width: 110,
                      height: 110,
                      alignSelf: 'center',
                      marginTop: 40
                    }}
                  />
                  
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 40,
                      alignSelf: 'center',
                      opacity: blinkOpacity,
                    }}
                  >
                    <Image
                      source={MAIN.fuocoICON}
                      style={{
                        width: 110,
                        height: 110,
                      }}
                    />
                  </Animated.View>
                </View>
              </View>
          </View>


        <View className="bg-[#35353a] rounded-2xl w-[65%] p-2">
          <View className="flex-row items-center">
            {/* Grid das Estatísticas */}
            <View className=' w-[100%]'>
            <View className="flex-1">
              <View className="flex-row flex-wrap gap-2">
                {/* Sequência de dias */}
                <View className="bg-[#2a2a2f] rounded-xl py-4 p-3 flex-1 min-w-[70px] border border-zinc-700/50">
                  <View className="flex-row items-center gap-1 mb-1">
                    <GradientIcon name="flame" size={20} />
                    <Text className="text-white font-poppins text-xl font-bold">
                      {taskStats.consecutiveDays}
                    </Text>
                  </View>
                  <Text className="text-zinc-400 font-poppins text-[11px] pt-1 leading-3">
                    dias seguidos
                  </Text>
                </View>

                {/* Tarefas completadas */}
              <View className="bg-[#2a2a2f] rounded-xl p-3 flex-1 min-w-[70px] border border-zinc-700/50">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <GradientIcon name="checkmark-circle" size={20} />
                    <Text className="text-white font-poppins text-xl font-bold">
                      {taskStats.completedTasksQuantity}
                    </Text>
                  </View>
                  <Text className="text-zinc-400 font-poppins text-[11px] pt-1 leading-3">
                    tarefas feitas
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2 mt-2">
                {/* Conquistas */}
              <View className="bg-[#2a2a2f] rounded-xl p-3 flex-1 min-w-[70px] border border-zinc-700/50">
                  <View className="flex-row items-center gap-2 mb-1">
                    <GradientIcon name="trophy" size={19} />
                    <Text className="text-white font-poppins text-xl font-bold">
                      {taskStats.completedTasksQuantity}
                    </Text>
                  </View>
                  <Text className="text-zinc-400 font-poppins text-[11px] pt-1 leading-3">
                    conquistas
                  </Text>
                </View>

                {/* Badges */}
                <View className="bg-[#2a2a2f] rounded-xl p-3 flex-1 min-w-[70px] border border-zinc-700/50">
                  <View className="flex-row items-center gap-2 mb-1">
                    <GradientIcon name="star" size={19} />
                    <Text className="text-white font-poppins text-xl font-bold">
                      {taskStats.completedTasksQuantity}
                    </Text>
                  </View>
                  <Text className="text-zinc-400 font-poppins text-[11px] pt-1 leading-3">
                    medalhas
                  </Text>
                </View>
              </View>
            </View>
            </View>
          </View>
        </View>
        </View>
    </View>
  );
};