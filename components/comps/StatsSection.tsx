import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useStats } from '../../hooks/useStats';
import { useAuth } from '../../hooks/useAuth';
import { useTask } from '../../hooks/useTask';

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
      <View className="bg-[#35353a] rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-rose-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">{currentLevel}</Text>
            </View>
            <Text className="text-white font-medium text-base">Nível {currentLevel}</Text>
          </View>
          <Text className="text-zinc-400 text-sm">
            {currentXp}/{currentXp + xpToNextLevel} XP
          </Text>
        </View>
        <View className="bg-zinc-600 rounded-full h-2">
          <View
            className="bg-rose-500 rounded-full h-2"
            style={{ width: `${xpPercentage}%` }}
          />
        </View>
        <Text className="text-zinc-400 text-xs mt-1 text-center">
          {xpToNextLevel > 0 ? `${xpToNextLevel} XP para o próximo nível` : 'Nível máximo atingido!'}
        </Text>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="bg-[#35353a] rounded-xl p-3 flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="flame" size={16} color="#F97316" />
            <Text className="text-zinc-400 text-xs ml-1">Sequência</Text>
          </View>
          <Text className="text-white font-bold text-lg">{taskStats.consecutiveDays}</Text>
          <Text className="text-zinc-400 text-xs">dias seguidos</Text>
        </View>

        <View className="bg-[#35353a] rounded-xl p-3 flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-zinc-400 text-xs ml-1">Tarefas</Text>
          </View>
          <Text className="text-white font-bold text-lg">{taskStats.completedTasksQuantity}</Text>
          <Text className="text-zinc-400 text-xs">concluídas</Text>
        </View>

        <View className="bg-[#35353a] rounded-xl p-3 flex-1 mx-1">
          <View className="flex-row items-center mb-1">
            <Ionicons name="trophy" size={16} color="#FCD34D" />
            <Text className="text-zinc-400 text-xs ml-1">Conquistas</Text>
          </View>
          <Text className="text-white font-bold text-lg">{achievementCount}</Text>
          <Text className="text-zinc-400 text-xs">desbloqueadas</Text>
        </View>
      </View>
    </View>
  );
};