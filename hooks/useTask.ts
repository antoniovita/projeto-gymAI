import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { parseISO, formatISO, subHours } from 'date-fns';
import { TaskService } from '../api/service/taskService';
import { Task } from '../api/model/Task';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { isSameDay } from 'date-fns';


export const useTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const createTask = async (
    title: string,
    content: string,
    datetimeISO: string,
    userId: string,
    type?: string,
    routineId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const date = parseISO(datetimeISO);
      const datetime = formatISO(date);

      console.log('[createTask] Criando task com datetime:', datetime);
      const taskId = await TaskService.createTask(
        title,
        content,
        datetime,
        type ?? '',
        userId,
        routineId ?? ''
      );
      console.log('[createTask] Task criada com ID:', taskId);

      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        const now = new Date();

        if (isSameDay(date, new Date())) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🗓️ Tarefa para hoje: ${title}`,
              body: content || 'Você tem uma tarefa hoje!',
              data: { taskId },
            },
            trigger: null,
          });
        }

        if (date > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Agora: ${title}`,
              body: content || 'Não perca a hora!',
              data: { taskId },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              date,
            },
          });
        }

        const oneHourBefore = subHours(date, 1);
        if (oneHourBefore > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏳ Em 1 hora: ${title}`,
              body: content || 'Falta pouco tempo!',
              data: { taskId },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              date: oneHourBefore,
            },
          });
        }
      }

      return taskId;
    } catch (err: any) {
      setError(err.message);
      console.error('[createTask] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[fetchTasks] Buscando todas as tarefas do usuário:', userId);
      const data = await TaskService.getTasks(userId);
      console.log('[fetchTasks] Tarefas retornadas:', data);

      setTasks(oldTasks => {
        if (JSON.stringify(oldTasks) === JSON.stringify(data)) {
          return oldTasks;
        }
        return data || [];
      });
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchTasks] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskCompletion = async (taskId: string, completed: 0 | 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[updateTaskCompletion] Atualizando status:', { taskId, completed });
      const updatedCount = await TaskService.updateTaskCompletion(taskId, completed);
      console.log('[updateTaskCompletion] Atualizações aplicadas:', updatedCount);
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[updateTaskCompletion] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[deleteTask] Deletando tarefa ID:', taskId);
      await TaskService.deleteTask(taskId);
      console.log('[deleteTask] Tarefa deletada com sucesso');
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('[deleteTask] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearTasksByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[clearTasksByUser] Limpando tarefas do usuário:', userId);
      const deletedCount = await TaskService.clearTasksByUser(userId);
      console.log('[clearTasksByUser] Total deletado:', deletedCount);
      return deletedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[clearTasksByUser] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      if (updates.datetime) {
        updates.datetime = formatISO(parseISO(updates.datetime));
      }

      console.log('[updateTask] Atualizando tarefa:', { taskId, updates });
      const updatedCount = await TaskService.updateTask(taskId, updates);
      console.log('[updateTask] Tarefa atualizada:', updatedCount);
      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[updateTask] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const debugAllTasks = async () => {
    const all = await TaskService.debugAllTasks();
    console.log('[HOOK] Tarefas no banco:', all);
  };

  return {
    loading,
    error,
    tasks,
    debugAllTasks,
    createTask,
    updateTask,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
    clearTasksByUser,
  };
};
