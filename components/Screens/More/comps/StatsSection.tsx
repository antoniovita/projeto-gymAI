import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStats } from '../../../../hooks/useStats';
import { useAuth } from '../../../../hooks/useAuth';
import { useTask } from '../../../../hooks/useTask';
import GradientIcon from 'components/generalComps/GradientIcon';
import { MAIN } from 'imageConstants';
import { useTheme } from 'styled-components/native';

export const StatsSection = () => {
  const theme = useTheme();
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
    completedTasksQuantity: 0,
  });
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
    scheduleBlink();
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [scheduleBlink]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (!userId) return;
        try {
          await loadUserStats(userId);
          const stats = await taskCompletedStats(userId);
          setTaskStats(stats);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
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
      <View
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: theme.colors.secondary }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Text
                className="font-bold text-lg"
                style={{ color: theme.colors.onPrimary }}
              >
                {currentLevel}
              </Text>
            </View>
            <Text
              className="font-poppins text-base"
              style={{ color: theme.colors.text }}
            >
              Nível {currentLevel}
            </Text>
          </View>

          <Text
            className="font-poppins text-sm"
            style={{ color: theme.colors.textMuted }}
          >
            {currentXp}/{currentXp + xpToNextLevel} XP
          </Text>
        </View>

        <View
          className="rounded-full h-2"
          style={{ backgroundColor: theme.colors.border }}
        >
          <View
            className="rounded-full h-2"
            style={{
              width: `${xpPercentage}%`,
              backgroundColor: theme.colors.primary,
            }}
          />
        </View>
      </View>

      <View className="flex-row">
        {/* Card do mascote/ícone */}
        <View
          className="flex-col w-[32%] h-[100%] rounded-2xl mr-3"
          style={{ backgroundColor: theme.colors.secondary }}
        >
          <TouchableOpacity className="absolute -top-2 -right-2 z-10">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.colors.background }}
            >
              <LinearGradient
                colors={[...theme.colors.linearGradient.primary] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 100,
                }}
              >
                <Ionicons
                  name="bag-handle"
                  size={18}
                  color={theme.colors.onPrimary}
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <View style={{ position: 'relative' }}>
            {/* “Sombra” no piso (pode ficar fixa) */}
            <View
              style={{
                width: 50,
                height: 9,
                shadowColor: 'black',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: 100,
                position: 'absolute',
                left: 33,
                bottom: 2,
                zIndex: 0,
              }}
            />

            <View style={{ position: 'relative' }}>
              <Image
                source={MAIN.fuocoPISCANDO}
                style={{ width: 110, height: 110, alignSelf: 'center', marginTop: 40 }}
              />

              <Animated.View
                style={{
                  position: 'absolute',
                  top: 40,
                  alignSelf: 'center',
                  opacity: blinkOpacity,
                }}
              >
                <Image source={MAIN.fuocoICON} style={{ width: 110, height: 110 }} />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Card das estatísticas */}
        <View
          className="rounded-2xl w-[65%]"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <View className="flex-row items-center">
            <View className="w-[100%]">
              <View className="flex-1">
                <View className="flex-row flex-wrap gap-2">
                  {/* Sequência de dias */}
                  <View
                    className="rounded-xl py-4 p-3 flex-1 min-w-[70px]"
                    style={{
                      backgroundColor: theme.colors.secondary,

                    }}
                  >
                    <View className="flex-row items-center gap-1 mb-1">
                      <GradientIcon name="flame" size={20} />
                      <Text
                        className="font-poppins text-xl font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {taskStats.consecutiveDays}
                      </Text>
                    </View>
                    <Text
                      className="font-poppins text-[11px] pt-1 leading-3"
                      style={{ color: theme.colors.textMuted }}
                    >
                      dias seguidos
                    </Text>
                  </View>

                  {/* Tarefas completadas */}
                  <View
                    className="rounded-xl p-3 flex-1 min-w-[70px]"
                    style={{
                      backgroundColor: theme.colors.secondary,

                    }}
                  >
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <GradientIcon name="checkmark-circle" size={20} />
                      <Text
                        className="font-poppins text-xl font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {taskStats.completedTasksQuantity}
                      </Text>
                    </View>
                    <Text
                      className="font-poppins text-[11px] pt-1 leading-3"
                      style={{ color: theme.colors.textMuted }}
                    >
                      tarefas feitas
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mt-2">
                  {/* Conquistas */}
                  <View
                    className="rounded-xl p-3 flex-1 min-w-[70px]"
                    style={{
                      backgroundColor: theme.colors.secondary,

                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      <GradientIcon name="trophy" size={19} />
                      <Text
                        className="font-poppins text-xl font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {taskStats.completedTasksQuantity}
                      </Text>
                    </View>
                    <Text
                      className="font-poppins text-[11px] pt-1 leading-3"
                      style={{ color: theme.colors.textMuted }}
                    >
                      conquistas
                    </Text>
                  </View>

                  {/* Badges */}
                  <View
                    className="rounded-xl p-3 flex-1 min-w-[70px]"
                    style={{
                      backgroundColor: theme.colors.secondary,

                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      <GradientIcon name="star" size={19} />
                      <Text
                        className="font-poppins text-xl font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {taskStats.completedTasksQuantity}
                      </Text>
                    </View>
                    <Text
                      className="font-poppins text-[11px] pt-1 leading-3"
                      style={{ color: theme.colors.textMuted }}
                    >
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
