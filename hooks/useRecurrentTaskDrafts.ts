import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDays,
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

  const combineDateAndTime = (date: Date, time: Date): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

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

  const saveDrafts = async (list: Draft[]) => {
    try {
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(list));
    } catch (err: any) {
      console.error('Erro salvando drafts:', err);
      throw err;
    }
  };

  const saveRuns = async () => {
    try {
      await AsyncStorage.setItem(RUNS_KEY, JSON.stringify(runsRef.current));
    } catch (err: any) {
      console.error('Erro salvando runs:', err);
      throw err;
    }
  };

  const getWeekday = (d: Date) => d.getDay();

  const getNextWeekDates = () => {
    const today = startOfDay(new Date());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const taskExists = async (taskId: string): Promise<boolean> => {
    try {
      const task = await getTaskById(taskId);
      return !!task;
    } catch (err) {
      console.error('Erro verificando se task existe:', taskId, err);
      return false;
    }
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
        const [hours, minutes] = draft.time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        
        const combinedDateTime = combineDateAndTime(date, timeDate);
        const datetimeISO = combinedDateTime.toISOString();
        
        const taskId = await createTask(
          draft.title,
          draft.content || '',
          datetimeISO,
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
      
      // Removido: não gera tasks automaticamente no addDraft
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = async (updatedDraft: Draft) => {
    setLoading(true);
    try {
      // Limpa tasks antigas relacionadas ao draft
      const doneMap = runsRef.current[updatedDraft.id] || {};
      const deletePromises = Object.values(doneMap).map(async (taskId) => {
        try {
          const exists = await taskExists(taskId);
          if (exists) {
            await deleteTask(taskId);
          }
        } catch (err) {
          console.error('Erro deletando task antiga:', taskId, err);
        }
      });
      
      await Promise.all(deletePromises);
      
      // Limpa registros do draft
      runsRef.current[updatedDraft.id] = {};
      
      // Atualiza o draft
      const nextDrafts = drafts.map(d => d.id === updatedDraft.id ? updatedDraft : d);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      // Gera novas tasks para o draft atualizado
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
      console.log('=== INICIANDO DELEÇÃO DO DRAFT ===');
      console.log('Draft a ser deletado:', id);
      console.log('Drafts antes da deleção:', drafts.map(d => ({ id: d.id, title: d.title })));
      
      // Busca todas as tasks relacionadas ao draft
      const draftRuns = runsRef.current[id] || {};
      const taskIds = Object.values(draftRuns);
      
      console.log(`Encontradas ${taskIds.length} tasks para deletar:`, taskIds);
      
      // Deleta todas as tasks em paralelo
      const deletePromises = taskIds.map(async (taskId) => {
        try {
          console.log('Verificando task:', taskId);
          const exists = await taskExists(taskId);
          if (exists) {
            console.log('Deletando task:', taskId);
            await deleteTask(taskId);
            console.log('Task deletada com sucesso:', taskId);
          } else {
            console.log('Task não existe mais:', taskId);
          }
        } catch (err) {
          console.error('Erro ao deletar task:', taskId, err);
          // Não interrompe o processo se uma task falhar
        }
      });
      
      await Promise.all(deletePromises);
      
      // Remove o draft dos registros
      delete runsRef.current[id];
      await saveRuns();
      
      // Remove o draft da lista
      const nextDrafts = drafts.filter(d => d.id !== id);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      console.log('Draft deletado com sucesso:', id);
      console.log('Drafts após deleção:', nextDrafts.map(d => ({ id: d.id, title: d.title })));
      console.log('=== DELEÇÃO DO DRAFT CONCLUÍDA ===');
      
    } catch (err: any) {
      console.error('Erro ao deletar draft:', id, err);
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
      console.log(`[${lockKey}] Todos os drafts disponíveis:`, drafts.map(d => ({ id: d.id, title: d.title, userId: d.userId, daysOfWeek: d.daysOfWeek })));
      
      const draftsForDay = drafts.filter(draft => 
        draft.daysOfWeek.includes(weekday) && draft.userId === userId
      );
      
      console.log(`[${lockKey}] Encontrados ${draftsForDay.length} drafts para processar:`, draftsForDay.map(d => ({ id: d.id, title: d.title })));
      
      const validDrafts = [];
      for (const draft of draftsForDay) {
        const stillExists = drafts.some(d => d.id === draft.id);
        if (stillExists) {
          validDrafts.push(draft);
        } else {
          console.log(`[${lockKey}] Draft ${draft.id} foi deletado, ignorando...`);
        }
      }
      
      console.log(`[${lockKey}] Drafts válidos após verificação: ${validDrafts.length}`);
      
      for (const draft of validDrafts) {
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
            
            const [hours, minutes] = draft.time.split(':').map(Number);
            const timeDate = new Date();
            timeDate.setHours(hours, minutes, 0, 0);
            
            const combinedDateTime = combineDateAndTime(date, timeDate);
            const datetimeISO = combinedDateTime.toISOString();
            
            const taskId = await createTask(
              draft.title,
              draft.content || '',
              datetimeISO,
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

  const clearError = () => setError(null);

  useEffect(() => { 
    loadAll(); 
  }, []);

  useEffect(() => {
    const processDraftsForToday = async () => {
      
      if (drafts.length === 0) {
        console.log('Nenhum draft disponível, pulando processamento...');
        return;
      }
      
      console.log('=== PROCESSAMENTO AUTOMÁTICO INICIADO ===');
      console.log('Total de drafts:', drafts.length);
      console.log('Drafts completos:', drafts.map(d => ({ 
        id: d.id, 
        title: d.title, 
        userId: d.userId, 
        daysOfWeek: d.daysOfWeek,
        time: d.time 
      })));
      
      const userIds = [...new Set(drafts.map(draft => draft.userId))];
      console.log('Usuários únicos encontrados:', userIds);
      
      for (const userId of userIds) {
        try {
          console.log(`Processando drafts para usuário: ${userId}`);
          await tasksFromDraftDay(userId, new Date());
        } catch (err) {
          console.error('Erro processando drafts para usuário:', userId, err);
        }
      }
      
      console.log('=== PROCESSAMENTO AUTOMÁTICO FINALIZADO ===');
    };

    processDraftsForToday();
  }, [drafts]);

  return {
    drafts,
    loading,
    error,
    loadAll,
    addDraft,
    updateDraft,
    deleteDraft,
    deleteDraftTaskForDay,
    tasksFromDraftDay,
    regenerateAllTasks,
    clearError,
  };
}