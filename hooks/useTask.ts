import { useState } from 'react';
import { TaskService } from '../api/service/taskService';
import { Task } from '../api/model/Task';

export const useTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const createTask = async (
    title: string,
    content: string,
    date: string,
    type: string,
    userId: string,
    routineId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const taskId = await TaskService.createTask(title, content, date, type, userId, routineId);
      return taskId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaskService.getTasks(userId);
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksByType = async (userId: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaskService.getTasksByType(userId, type);
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskCompletion = async (taskId: string, completed: 0 | 1) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCount = await TaskService.updateTaskCompletion(taskId, completed);
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await TaskService.deleteTask(taskId);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearTasksByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const deletedCount = await TaskService.clearTasksByUser(userId);
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
    tasks,
    createTask,
    fetchTasks,
    fetchTasksByType,
    updateTaskCompletion,
    deleteTask,
    clearTasksByUser,
  };
};
