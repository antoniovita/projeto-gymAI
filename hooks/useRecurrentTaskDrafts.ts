import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  startOfDay,
  format,
} from 'date-fns';
import { useTask } from './useTask';

type Draft = {
  id: string;
  title: string;
  content?: string;
  time: string;
  daysOfWeek: number[];
  userId: string;
  type?: string;
};

const DRAFTS_KEY = '@recurrent_task_drafts';
const RUNS_KEY = '@recurrent_task_runs';

export function useRecurrentTaskDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const executionLockRef = useRef<Set<string>>(new Set());


  const runsRef = useRef<Record<string, Record<string, string>>>({});

  const { createTask, deleteTask, getTaskById } = useTask();
  

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rawDrafts, rawRuns] = await Promise.all([
        AsyncStorage.getItem(DRAFTS_KEY),
        AsyncStorage.getItem(RUNS_KEY),
      ]);
      setDrafts(rawDrafts ? JSON.parse(rawDrafts) : []);
      runsRef.current = rawRuns ? JSON.parse(rawRuns) : {};
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDrafts = (list: Draft[]) =>
    AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(list));

  const saveRuns = () =>
    AsyncStorage.setItem(RUNS_KEY, JSON.stringify(runsRef.current));

  const getWeekday = (d: Date) => d.getDay();

  const buildDateTime = (date: Date, time: string) => {
    const [h, m] = time.split(':').map(Number);
    return setMilliseconds(
      setSeconds(setMinutes(setHours(date, h), m), 0),
      0
    );
  };

  const getNextWeekDates = () => {
    const today = startOfDay(new Date());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const taskExists = async (taskId: string): Promise<boolean> => {
      const task = await getTaskById(taskId);
      return !!task;

  };

  const generateTasksForDraft = async (draft: Draft) => {
    const weekDates = getNextWeekDates();
    const draftRuns = runsRef.current[draft.id] || {};
    
    for (const date of weekDates) {
      const weekday = getWeekday(date);
      const isoDay = format(date, 'yyyy-MM-dd');
      
      if (!draft.daysOfWeek.includes(weekday)) continue;
      
      if (draftRuns[isoDay]) {
        const existingTaskId = draftRuns[isoDay];
        const exists = await taskExists(existingTaskId);
        if (exists) continue;
        
        delete draftRuns[isoDay];
      }
      
      try {
        const dt = buildDateTime(date, draft.time).toISOString();
        const taskId = await createTask(
          draft.title,
          draft.content || '',
          dt,
          draft.userId,
          draft.type
        );
        
        if (!runsRef.current[draft.id]) {
          runsRef.current[draft.id] = {};
        }
        runsRef.current[draft.id][isoDay] = taskId as string;
      } catch (err) {
        console.error('Erro gerando task para draft:', draft.id, err);
      }
    }
    
    await saveRuns();
  };

  const addDraft = async (input: Omit<Draft, 'id'>) => {
    setLoading(true);
    try {
      const newDraft: Draft = { id: `draft_${Date.now()}`, ...input };
      
      const nextDrafts = [...drafts, newDraft];
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      await generateTasksForDraft(newDraft);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = async (updatedDraft: Draft) => {
    setLoading(true);
    try {
      const doneMap = runsRef.current[updatedDraft.id] || {};
      for (const taskId of Object.values(doneMap)) {
        try {
          const exists = await taskExists(taskId);
          if (exists) {
            await deleteTask(taskId);
          }
        } catch (err) {
          console.error('Erro deletando task antiga:', taskId, err);
        }
      }
      
      runsRef.current[updatedDraft.id] = {};
      
      const nextDrafts = drafts.map(d => d.id === updatedDraft.id ? updatedDraft : d);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      await generateTasksForDraft(updatedDraft);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    setLoading(true);
    try {
      const doneMap = runsRef.current[id] || {};
      for (const taskId of Object.values(doneMap)) {
          const exists = await taskExists(taskId);
          if (exists) {
            await deleteTask(taskId);
          }
      }
      
      delete runsRef.current[id];
      await saveRuns();
      
      const nextDrafts = drafts.filter(d => d.id !== id);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraftTaskForDay = async (draftId: string, date: Date) => {
    setLoading(true);
    try {
      const isoDay = format(startOfDay(date), 'yyyy-MM-dd');
      const draftRuns = runsRef.current[draftId] || {};
      
      if (draftRuns[isoDay]) {
        const taskId = draftRuns[isoDay];
        const exists = await taskExists(taskId);
        if (exists) {
          await deleteTask(taskId);
        }
        
        delete draftRuns[isoDay];
        await saveRuns();
        
        console.log('Task deletada para o dia:', isoDay, 'Draft ID:', draftId);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const tasksFromDraftDay = async (userId: string, date: Date) => {
      const isoDay = format(startOfDay(date), 'yyyy-MM-dd');
      const lockKey = `${userId}_${isoDay}`;
      
      if (executionLockRef.current.has(lockKey)) {
        console.log(`Execução já em andamento para ${lockKey}, ignorando...`);
        return;
      }
      
      executionLockRef.current.add(lockKey);
      
      try {
        setLoading(true);
        const weekday = getWeekday(date);
        
        console.log(`[${lockKey}] Iniciando processamento para ${isoDay}, weekday: ${weekday}`);
        
        const draftsForDay = drafts.filter(draft => 
          draft.daysOfWeek.includes(weekday) && draft.userId === userId
        );
        
        console.log(`[${lockKey}] Encontrados ${draftsForDay.length} drafts para processar`);
        
        for (const draft of draftsForDay) {
          try {
            console.log(`[${lockKey}] Processando draft ${draft.id} - ${draft.title}`);
            
            if (!runsRef.current[draft.id]) {
              runsRef.current[draft.id] = {};
            }
            
            const draftRuns = runsRef.current[draft.id];
            
            if (draftRuns[isoDay]) {
              const existingTaskId = draftRuns[isoDay];
              console.log(`[${lockKey}] Task já registrada: ${existingTaskId}`);
              
              const exists = await taskExists(existingTaskId);
              if (exists) {
                console.log(`[${lockKey}] Task ${existingTaskId} confirmada, pulando...`);
                continue;
              }
              
              console.log(`[${lockKey}] Task ${existingTaskId} não existe mais, limpando...`);
              delete draftRuns[isoDay];
            }
            
            if (!draftRuns[isoDay]) {
              console.log(`[${lockKey}] Criando nova task para draft ${draft.id}`);
              const dt = buildDateTime(date, draft.time).toISOString();
              const taskId = await createTask(
                draft.title,
                draft.content || '',
                dt,
                draft.userId,
                draft.type
              );
              
              runsRef.current[draft.id][isoDay] = taskId as string;
              console.log(`[${lockKey}] Task criada e registrada: ${taskId}`);
            }
            
          } catch (err) {
            console.error(`[${lockKey}] Erro processando draft ${draft.id}:`, err);
          }
        }
        
        await saveRuns();
        console.log(`[${lockKey}] Processamento concluído e salvo`);
        
      } catch (err: any) {
        console.error(`[${lockKey}] Erro geral:`, err);
        setError(err.message);
      } finally {
        executionLockRef.current.delete(lockKey);
        setLoading(false);
      }
    };

  const regenerateAllTasks = async () => {
    setLoading(true);
    try {
      for (const draft of drafts) {
        await generateTasksForDraft(draft);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAll(); 
  }, []);

  return {
    drafts,
    loading,
    error,
    addDraft,
    updateDraft,
    deleteDraft,
    deleteDraftTaskForDay,
    tasksFromDraftDay,
    regenerateAllTasks,
  };
}