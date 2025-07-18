import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { parseISO, formatISO, subHours, isSameDay } from 'date-fns';
import { TaskService } from '../api/service/taskService';
import { Task } from '../api/model/Task';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

export const useTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Helper to cancel all scheduled notifications for a given task
  const cancelTaskNotifications = async (taskId: string) => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        scheduled
          .filter(n => n.content.data?.taskId === taskId)
          .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    } catch (err) {
      console.warn('[cancelTaskNotifications] Falha ao cancelar notificações:', err);
    }
  };

  // Helper to schedule notifications for a task
  const scheduleNotifications = async (
    taskId: string,
    title: string,
    body: string,
    date: Date
  ) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const now = new Date();

    // Notification at exact time
    if (date > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: `⏰ Agora: ${title}`, body: body || 'Não perca a hora!', data: { taskId } },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date },
      });
    }

    // Notification 1 hour before
    const oneHourBefore = subHours(date, 1);
    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: `⏳ Em 1 hora: ${title}`, body: body || 'Falta pouco tempo!', data: { taskId } },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: oneHourBefore },
      });
    }
  };

  const createTask = async (
    title: string,
    content: string,
    datetimeISO: string,
    userId: string,
    type?: string,
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
        userId
      );
      console.log('[createTask] Task criada com ID:', taskId);

      // Schedule notifications
      await scheduleNotifications(taskId!, title, content ?? '', date);

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

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      let newDate: Date | null = null;
      if (updates.datetime) {
        newDate = parseISO(formatISO(parseISO(updates.datetime)));
        updates.datetime = formatISO(newDate);
      }

      console.log('[updateTask] Atualizando tarefa:', { taskId, updates });
      const updatedCount = await TaskService.updateTask(taskId, updates);
      console.log('[updateTask] Tarefa atualizada:', updatedCount);

      if (newDate || updates.title || updates.content) {
        await cancelTaskNotifications(taskId);

        const original = tasks.find(t => t.id === taskId);
        const title = updates.title ?? original?.title ?? '';
        const body = updates.content ?? original?.content ?? '';
        const dateToUse = newDate ?? (original ? parseISO(original.datetime) : new Date());

        await scheduleNotifications(taskId, title, body, dateToUse);
      }

      return updatedCount;
    } catch (err: any) {
      setError(err.message);
      console.error('[updateTask] Erro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[deleteTask] Cancelando notificações da tarefa ID:', taskId);
      await cancelTaskNotifications(taskId);

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

  const clearTasksByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[clearTasksByUser] Limpando tarefas do usuário:', userId);
      const userTasks = await TaskService.getTasks(userId);
      await Promise.all(userTasks!.map(t => cancelTaskNotifications(t.id)));

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

  const debugAllTasks = async () => {
    const all = await TaskService.debugAllTasks();
    console.log('[HOOK] Tarefas no banco:', all);
  };

    const getTaskById = async (taskId: string): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    try {
      const task = await TaskService.getTaskById(taskId);
      return task;
    } catch (err: any) {
      setError(err.message);
      console.error('[getTaskById] Erro:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  return {
    loading,
    error,
    tasks,
    debugAllTasks,
    createTask,
    fetchTasks,
    updateTask,
    updateTaskCompletion,
    deleteTask,
    clearTasksByUser,
    getTaskById
  };
};
 