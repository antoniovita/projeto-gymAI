import { useState, useEffect } from 'react';
import { GoalService } from '../api/service/goalService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Update = {
  goalId: string;
  name: string;
}

export const useGoal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  
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
      const updatedProgress = await GoalService.updateProgress(goalId, progress);
      const newUpdate: Update = { goalId, name };
      const updatedUpdates = [...updates, newUpdate];
      
      setUpdates(updatedUpdates);
      await AsyncStorage.setItem(GOALS_UPDATE_KEY, JSON.stringify(updatedUpdates));
      
      return updatedProgress;
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

  return {
    loading,
    error,
    updates,
    createGoal,
    createUpdateGoal,
    clearUpdates,
    removeUpdate,
  };
};