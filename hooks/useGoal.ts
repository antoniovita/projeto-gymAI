import { useState, useEffect } from 'react';
import { GoalService } from '../api/service/goalService';
import { Goal } from '../api/model/Goal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Update = {
  goalId: string;
  name: string;
}

export const useGoal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const GOALS_UPDATE_KEY = '@goals_update';

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const storedUpdates = await AsyncStorage.getItem(GOALS_UPDATE_KEY);
        if (storedUpdates) {
          setUpdates(JSON.parse(storedUpdates));
        }
      } catch (err) {
        console.error('Error loading updates from storage:', err);
      }
    };
    loadUpdates();
  }, []);

  const getGoals = async (userId: string): Promise<Goal[]> => {
    setLoading(true);
    setError(null);
    try {
      const userGoals = await GoalService.getGoals(userId);
      setGoals(userGoals);
      return userGoals;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (
    name: string,
    description: string,
    createdAt: string,
    deadline: string | null,
    userId: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const goalId = await GoalService.createGoal(name, description, createdAt, deadline, userId);
      
      const newGoal: Goal = {
        id: goalId,
        name,
        description,
        progress: 0,
        deadline: deadline || undefined,
        created_at: createdAt,
        user_id: userId,
        completed: 0
      };
      setGoals(prev => [...prev, newGoal]);
      
      return goalId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUpdateGoal = async (
    goalId: string,
    progress: number,
    name: string
  ): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const updatedCount = await GoalService.updateProgress(goalId, progress);
      
      // Update local state
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, progress }
          : goal
      ));
      
      // Add to updates
      const newUpdate: Update = { goalId, name };
      const updatedUpdates = [...updates, newUpdate];
      setUpdates(updatedUpdates);
      await AsyncStorage.setItem(GOALS_UPDATE_KEY, JSON.stringify(updatedUpdates));
      
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const updatedCount = await GoalService.updateGoal(goalId, updates);
      
      // Update local state
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates }
          : goal
      ));
      
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await GoalService.deleteGoal(goalId);
      
      // Remove from local state
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      // Remove from updates if exists
      await removeUpdate(goalId);
      
      return success;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearUpdates = async () => {
    setUpdates([]);
    await AsyncStorage.removeItem(GOALS_UPDATE_KEY);
  };

  const removeUpdate = async (goalId: string) => {
    const filteredUpdates = updates.filter(update => update.goalId !== goalId);
    setUpdates(filteredUpdates);
    await AsyncStorage.setItem(GOALS_UPDATE_KEY, JSON.stringify(filteredUpdates));
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    updates,
    goals,
    getGoals,
    createGoal,
    createUpdateGoal,
    updateGoal,
    deleteGoal,
    clearUpdates,
    removeUpdate,
    clearError,
  };
};