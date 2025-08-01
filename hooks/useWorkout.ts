import { useState } from 'react';
import { WorkoutService } from '../api/service/workoutService';
import { Workout, Exercise } from 'api/model/Workout';

export const useWorkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const createWorkout = async (
    name: string,
    exercises: Exercise[],
    date: string,
    userId: string,
    type?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const workoutId = await WorkoutService.createWorkout(name, exercises, date, userId, type);
      return workoutId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await WorkoutService.getWorkouts(userId);
      setWorkouts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutsByType = async (userId: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await WorkoutService.getWorkoutsByType(userId, type);
      setWorkouts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (
    workoutId: string,
    updates: Partial<{
      name?: string;
      exercises?: Exercise[];
      date?: string;
      type?: string;
    }>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCount = await WorkoutService.updateWorkout(workoutId, updates);
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    setLoading(true);
    setError(null);
    try {
      await WorkoutService.deleteWorkout(workoutId);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearWorkoutsByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const deletedCount = await WorkoutService.clearWorkoutsByUser(userId);
      return deletedCount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    workouts,
    createWorkout,
    fetchWorkouts,
    fetchWorkoutsByType,
    updateWorkout,
    deleteWorkout,
    clearWorkoutsByUser
  };
};
