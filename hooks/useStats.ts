//general imports
import { useState, useCallback } from 'react';

//services
import { UserService } from '../api/service/userService';

interface UserStats {
  id: string;
  name: string;
  level: number;
  xp: number;
  achievements: string[];
  badges: string[];
}

export function useStats() {
  const [loading, setLoading] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const loadUserStats = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const userData = await UserService.getUserById(userId);
      setUserStats(userData!);
      return userData;
    } catch (error) {
      console.error('Erro ao carregar stats do usuário:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLevel = useCallback(async (userId: string, level: number, xp: number) => {
    setLoading(true);
    try {
      const message = await UserService.updateUserLevel(userId, level, xp);
      
      if (userStats && userStats.id === userId) {
        setUserStats(prev => prev ? { ...prev, level, xp } : null);
      }
      
      console.log(message);
      return message;
    } catch (error) {
      console.error('Erro ao atualizar nível:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userStats]);

  const addExperience = useCallback(async (
    userId: string, 
    xpToAdd: number, 
    base: number = 200, 
    step: number = 50
  ) => {
    setLoading(true);
    try {
      const result = await UserService.addExperience(userId, xpToAdd, base, step);
      
      if (userStats && userStats.id === userId) {
        setUserStats(prev => prev ? {
          ...prev,
          level: result.data!.newLevel,
          xp: result.data!.newXp
        } : null);
      }
      
      console.log(result.message);
      return result;
    } catch (error) {
      console.error('Erro ao adicionar experiência:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userStats]);

  const addAchievement = useCallback(async (userId: string, achievement: string) => {
    setLoading(true);
    try {
      const message = await UserService.addAchievement(userId, achievement);
      
      if (userStats && userStats.id === userId) {
        setUserStats(prev => prev ? {
          ...prev,
          achievements: [...prev.achievements, achievement]
        } : null);
      }
      
      console.log(message);
      return message;
    } catch (error) {
      console.error('Erro ao adicionar conquista:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userStats]);

  const addBadge = useCallback(async (userId: string, badge: string) => {
    setLoading(true);
    try {
      const message = await UserService.addBadge(userId, badge);
      
      if (userStats && userStats.id === userId) {
        setUserStats(prev => prev ? {
          ...prev,
          badges: [...prev.badges, badge]
        } : null);
      }
      
      console.log(message);
      return message;
    } catch (error) {
      console.error('Erro ao adicionar badge:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userStats]);

  const hasAchievement = useCallback((achievement: string): boolean => {
    return userStats?.achievements.includes(achievement) || false;
  }, [userStats]);

  const hasBadge = useCallback((badge: string): boolean => {
    return userStats?.badges.includes(badge) || false;
  }, [userStats]);

  const getXpToNextLevel = useCallback((
    base: number = 200,
    step: number = 50
  ): number => {
    if (!userStats) return 0;
    
    const currentLevel = userStats.level;
    const currentXp = userStats.xp;
    
    const totalXpForNextLevel = (level: number) => {
      if (level <= 1) return 0;
      let total = 0;
      for (let l = 2; l <= level; l++) {
        total += base + step * (l - 2);
      }
      return total;
    };
    
    const xpForNextLevel = totalXpForNextLevel(currentLevel + 1);
    return Math.max(0, xpForNextLevel - currentXp);
  }, [userStats]);

  const getLevelProgress = useCallback((
    base: number = 200,
    step: number = 50
  ): number => {
    if (!userStats) return 0;
    
    const currentLevel = userStats.level;
    const currentXp = userStats.xp;
    
    if (currentLevel === 1) {
      const xpForLevel2 = base;
      return Math.min(100, (currentXp / xpForLevel2) * 100);
    }
    
    const totalXpForCurrentLevel = (level: number) => {
      if (level <= 1) return 0;
      let total = 0;
      for (let l = 2; l <= level; l++) {
        total += base + step * (l - 2);
      }
      return total;
    };
    
    const xpForCurrentLevel = totalXpForCurrentLevel(currentLevel);
    const xpForNextLevel = totalXpForCurrentLevel(currentLevel + 1);
    
    if (xpForNextLevel === xpForCurrentLevel) return 100;
    
    const progress = ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [userStats]);

  const clearStats = useCallback(() => {
    setUserStats(null);
  }, []);

  return {
    // State
    userStats,
    loading,
    
    // Data Methods
    loadUserStats,
    clearStats,
    
    // Level & Experience Methods
    updateLevel,
    addExperience,
    getXpToNextLevel,
    getLevelProgress,
    
    // Achievement Methods
    addAchievement,
    hasAchievement,
    
    // Badge Methods
    addBadge,
    hasBadge,
    
    // Computed Properties
    currentLevel: userStats?.level || 1,
    currentXp: userStats?.xp || 0,
    achievementCount: userStats?.achievements.length || 0,
    badgeCount: userStats?.badges.length || 0
  };
}