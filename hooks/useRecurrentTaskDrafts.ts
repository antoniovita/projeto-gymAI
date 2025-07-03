import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuidv4 from 'react-native-uuid';
import { useTask } from '../hooks/useTask'; // Assumindo hook ou módulo com método createTask

// Interface para representar um rascunho de tarefa recorrente
export interface Draft {
  id: string;
  title: string;
  content?: string;
  time: string;           // formato "HH:mm"
  daysOfWeek: number[];   // 0=domingo … 6=sábado
  userId: string;
  type?: string;
  jobIds?: string[];
}

const {createTask} = useTask()

const STORAGE_KEY = '@recurrent_task_drafts';
const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Custom hook para gerenciar rascunhos de tarefas recorrentes
 */
export function useRecurrentTaskDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Ref para armazenar IDs de timers de cada draft (timeout e interval)
  const jobTimersRef = useRef<Record<string, number[]>>({});

  /**
   * Carrega rascunhos do AsyncStorage ao montar o hook
   */
  const loadDrafts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useRecurrentTaskDrafts] Carregando drafts...');
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const stored: Omit<Draft, 'jobIds'>[] = json ? JSON.parse(json) : [];
      setDrafts(stored as Draft[]);
      // Agendar timers para cada draft carregado
      stored.forEach((d) => scheduleDraftJobs(d as Draft));
      console.log(`[useRecurrentTaskDrafts] Carregados ${stored.length} drafts`);
    } catch (err: any) {
      console.log('[useRecurrentTaskDrafts] Erro ao carregar drafts', err);
      setError(err.message || 'Erro ao carregar rascunhos');
    } finally {
      setLoading(false);
    }
  };

  // Carrega ao montar
  useEffect(() => {
    loadDrafts();
    // Ao desmontar, cancelar todos timers
    return () => {
      drafts.forEach((d) => cancelDraftJobs(d.id));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Persiste array de rascunhos (sem jobIds) no AsyncStorage
   */
  const saveDrafts = async (all: Draft[]) => {
    try {
      const toStore = all.map(({ jobIds, ...rest }) => rest);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      console.log(`[useRecurrentTaskDrafts] Salvos ${toStore.length} drafts no storage`);
    } catch (err: any) {
      console.log('[useRecurrentTaskDrafts] Erro ao salvar drafts', err);
      setError(err.message || 'Erro ao salvar rascunhos');
    }
  };

  /**
   * Calcula o próximo timestamp de disparo de acordo com dia da semana e horário
   */
  const getNextTriggerTime = (dayOfWeek: number, time: string): Date => {
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    let diff = (dayOfWeek - next.getDay() + 7) % 7;
    if (diff === 0 && next <= now) diff = 7; // se hoje mas horário já passou
    next.setDate(next.getDate() + diff);
    return next;
  };

  /**
   * (Re)agenda todos os timers para um draft específico
   */
  const scheduleDraftJobs = (draft: Draft) => {
    // Limpa timers antigos, se houver
    cancelDraftJobs(draft.id);
    jobTimersRef.current[draft.id] = [];

    draft.daysOfWeek.forEach((day) => {
      const nextTime = getNextTriggerTime(day, draft.time);
      const msUntil = nextTime.getTime() - Date.now();

      // Timeout inicial para disparo único
      const timeoutId = setTimeout(() => {
        console.log(`[useRecurrentTaskDrafts] Disparando tarefa inicial para draft ${draft.id}`);
        createTask(
          draft.title,
          draft.content ?? '',
          nextTime.toISOString(),
          draft.userId,
          draft.type
        );
        // Após disparo, agenda repetições semanais
        const intervalId = setInterval(() => {
          const now = new Date();
          const triggerISO = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            ...draft.time.split(':').map(Number),
          ).toISOString();
          console.log(`[useRecurrentTaskDrafts] Disparando tarefa semanal para draft ${draft.id}`);
          createTask(
            draft.title,
            draft.content ?? '',
            triggerISO,
            draft.userId,
            draft.type
          );
        }, MS_IN_WEEK);
        jobTimersRef.current[draft.id].push(intervalId as unknown as number);
      }, msUntil);

      jobTimersRef.current[draft.id].push(timeoutId as unknown as number);
    });

    // Atualiza estado local com jobIds (não persiste)
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draft.id
          ? { ...d, jobIds: jobTimersRef.current[draft.id].map((id) => id.toString()) }
          : d
      )
    );
    console.log(`[useRecurrentTaskDrafts] Agendados ${draft.daysOfWeek.length} timers para draft ${draft.id}`);
  };

  /**
   * Cancela todos os timers associados a um draft
   */
  const cancelDraftJobs = (draftId: string) => {
    const timers = jobTimersRef.current[draftId] || [];
    timers.forEach((tid) => {
      clearTimeout(tid);
      clearInterval(tid);
    });
    jobTimersRef.current[draftId] = [];
    console.log(`[useRecurrentTaskDrafts] Cancelados ${timers.length} timers para draft ${draftId}`);
  };

  /**
   * Adiciona um novo draft, agenda jobs e persiste
   */
  const addDraft = async (input: Omit<Draft, 'id' | 'jobIds'>) => {
    setLoading(true);
    setError(null);
    try {
      const newDraft: Draft = { ...input, id: uuidv4.v4() };
      setDrafts((prev) => [...prev, newDraft]);
      scheduleDraftJobs(newDraft);
      saveDrafts([...drafts, newDraft]);
      console.log(`[useRecurrentTaskDrafts] Adicionado draft ${newDraft.id}`);
    } catch (err: any) {
      console.log('[useRecurrentTaskDrafts] Erro ao adicionar draft', err);
      setError(err.message || 'Erro ao adicionar rascunho');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza um draft existente, reagenda jobs e persiste
   */
  const updateDraft = async (draft: Draft) => {
    setLoading(true);
    setError(null);
    try {
      cancelDraftJobs(draft.id);
      scheduleDraftJobs(draft);
      const updated = drafts.map((d) => (d.id === draft.id ? draft : d));
      setDrafts(updated);
      saveDrafts(updated);
      console.log(`[useRecurrentTaskDrafts] Atualizado draft ${draft.id}`);
    } catch (err: any) {
      console.log('[useRecurrentTaskDrafts] Erro ao atualizar draft', err);
      setError(err.message || 'Erro ao atualizar rascunho');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove um draft, cancela jobs e persiste
   */
  const removeDraft = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      cancelDraftJobs(id);
      const filtered = drafts.filter((d) => d.id !== id);
      setDrafts(filtered);
      saveDrafts(filtered);
      console.log(`[useRecurrentTaskDrafts] Removido draft ${id}`);
    } catch (err: any) {
      console.log('[useRecurrentTaskDrafts] Erro ao remover draft', err);
      setError(err.message || 'Erro ao remover rascunho');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarrega os drafts manualmente
   */
  const reloadDrafts = async () => {
    await loadDrafts();
  };

  return {
    drafts,
    loading,
    error,
    addDraft,
    updateDraft,
    removeDraft,
    reloadDrafts,
  };
}
