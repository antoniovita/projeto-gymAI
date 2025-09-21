//general imports
import { useState } from 'react';

//services
import { WorkoutService } from '../api/service/workoutService';

//types
import { Exercise, Workout } from 'api/types/workoutTypes';

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

  const getWorkoutById = async (userId: string, workoutId: string) => {
    setLoading(true);
    setError(null);
    try {
      const workout = await WorkoutService.getWorkoutById(userId, workoutId);
      return workout;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const duplicateWorkout = async (userId: string, workoutId: string) => {
    setLoading(true);
    setError(null);
    try {

      const originalWorkout = await WorkoutService.getWorkoutById(userId, workoutId) as Workout;
      
      if (!originalWorkout) {
        throw new Error('Treino não encontrado');
      }

      let exercises: Exercise[] = [];
      try {
        if (typeof originalWorkout.exercises === 'string') {
          exercises = JSON.parse(originalWorkout.exercises);
        } else if (Array.isArray(originalWorkout.exercises)) {
          exercises = originalWorkout.exercises;
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse dos exercises:', parseError);
        exercises = [];
      }

      const duplicatedName = `Cópia de ${originalWorkout.name || 'Treino'}`;
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newWorkoutId = await WorkoutService.createWorkout(
        duplicatedName,
        exercises,
        currentDate,
        userId,
        originalWorkout.type
      );
      
      return newWorkoutId;
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
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    duplicateWorkout,
    clearWorkoutsByUser
  };
};