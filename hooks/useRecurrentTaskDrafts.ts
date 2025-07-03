import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  parseISO,
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
  time: string;           // "HH:mm"
  daysOfWeek: number[];   // 0=domingo … 6=sábado
  userId: string;
  type?: string;
};

const DRAFTS_KEY = '@recurrent_task_drafts';
const RUNS_KEY = '@recurrent_task_runs';

/**
 * Hook que gerencia drafts recorrentes e suas tasks
 * Gera tasks para uma semana a partir de hoje
 */
export function useRecurrentTaskDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de registros de execuções: { draftId: { 'yyyy-MM-dd': taskId } }
  const runsRef = useRef<Record<string, Record<string, string>>>({});

  const { createTask, deleteTask } = useTask();

  /** Carrega drafts e runs do AsyncStorage */
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

  /** Persiste lista de drafts */
  const saveDrafts = (list: Draft[]) =>
    AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(list));

  /** Persiste registros de runs */
  const saveRuns = () =>
    AsyncStorage.setItem(RUNS_KEY, JSON.stringify(runsRef.current));

  /** Retorna dia da semana (0–6) */
  const getWeekday = (d: Date) => d.getDay();

  /** Combina data + horário "HH:mm" */
  const buildDateTime = (date: Date, time: string) => {
    const [h, m] = time.split(':').map(Number);
    return setMilliseconds(
      setSeconds(setMinutes(setHours(date, h), m), 0),
      0
    );
  };

  /** Gera datas dos próximos 7 dias */
  const getNextWeekDates = () => {
    const today = startOfDay(new Date());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  /** Gera tasks para um draft específico nos próximos 7 dias */
  const generateTasksForDraft = async (draft: Draft) => {
    const weekDates = getNextWeekDates();
    const draftRuns = runsRef.current[draft.id] || {};
    
    for (const date of weekDates) {
      const weekday = getWeekday(date);
      const isoDay = format(date, 'yyyy-MM-dd');
      
      // Só gera se o draft tem esse dia da semana configurado
      if (!draft.daysOfWeek.includes(weekday)) continue;
      
      // Evita duplicatas
      if (draftRuns[isoDay]) continue;
      
      try {
        const dt = buildDateTime(date, draft.time).toISOString();
        const taskId = await createTask(
          draft.title,
          draft.content || '',
          dt,
          draft.userId,
          draft.type
        );
        
        // Atualiza registro de runs
        if (!runsRef.current[draft.id]) {
          runsRef.current[draft.id] = {};
        }
        runsRef.current[draft.id][isoDay] = taskId as string;
      } catch (err) {
        console.error('[useRecurrentTaskDrafts] Erro gerando task:', draft.id, err);
      }
    }
    
    await saveRuns();
  };

  /** Adiciona um draft e gera suas tasks para a próxima semana */
  const addDraft = async (input: Omit<Draft, 'id'>) => {
    setLoading(true);
    try {
      const newDraft: Draft = { id: `draft_${Date.now()}`, ...input };
      
      // Adiciona o draft à lista
      const nextDrafts = [...drafts, newDraft];
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      // Gera tasks para este draft
      await generateTasksForDraft(newDraft);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Atualiza draft - remove todas as tasks antigas e cria novas */
  const updateDraft = async (updatedDraft: Draft) => {
    setLoading(true);
    try {
      // 1) Remove todas as tasks antigas deste draft
      const doneMap = runsRef.current[updatedDraft.id] || {};
      for (const taskId of Object.values(doneMap)) {
        try {
          await deleteTask(taskId);
        } catch (err) {
          console.error('[useRecurrentTaskDrafts] Erro deletando task antiga:', taskId, err);
        }
      }
      
      // 2) Limpa registros de runs
      runsRef.current[updatedDraft.id] = {};
      
      // 3) Atualiza o draft na lista
      const nextDrafts = drafts.map(d => d.id === updatedDraft.id ? updatedDraft : d);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
      // 4) Gera novas tasks com os dados atualizados
      await generateTasksForDraft(updatedDraft);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Remove draft e todas suas tasks */
  const deleteDraft = async (id: string) => {
    setLoading(true);
    try {
      // 1) Deleta todas as tasks criadas para esse draft
      const doneMap = runsRef.current[id] || {};
      for (const taskId of Object.values(doneMap)) {
          await deleteTask(taskId);
        }
      
      // 2) Remove registros de runs
      delete runsRef.current[id];
      await saveRuns();
      
      // 3) Remove o draft da lista
      const nextDrafts = drafts.filter(d => d.id !== id);
      setDrafts(nextDrafts);
      await saveDrafts(nextDrafts);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Gera tasks para todos os drafts que devem executar em um dia específico */
  const tasksFromDraftDay = async (date: Date) => {
    setLoading(true);
    try {
      const weekday = getWeekday(date);
      const isoDay = format(startOfDay(date), 'yyyy-MM-dd');
      
      // Filtra drafts que devem executar neste dia da semana
      const draftsForDay = drafts.filter(draft => 
        draft.daysOfWeek.includes(weekday)
      );
      
      for (const draft of draftsForDay) {
        const draftRuns = runsRef.current[draft.id] || {};
        
        // Evita duplicatas pelos registros de runs
        if (draftRuns[isoDay]) continue;
        
        try {
          // Verifica se já existe uma task com o mesmo nome na data
          await fetchTasksByDateAndName(draft.userId, isoDay, draft.title);
          
          // Se a consulta retornou tasks, significa que já existe uma task com esse nome
          if (tasks.length > 0) {
            console.log('[useRecurrentTaskDrafts] Task já existe para:', isoDay, 'Draft:', draft.title);
            
            // Registra como se tivesse sido criada por este draft para evitar futuras duplicatas
            if (!runsRef.current[draft.id]) {
              runsRef.current[draft.id] = {};
            }
            runsRef.current[draft.id][isoDay] = tasks[0].id; // Usa o ID da task existente
            continue;
          }
          
          // Se não existe, cria a nova task
          const dt = buildDateTime(date, draft.time).toISOString();
          const taskId = await createTask(
            draft.title,
            draft.content || '',
            dt,
            draft.userId,
            draft.type
          );

          console.log('[useRecurrentTaskDrafts] Task criada para dia:', isoDay, 'Draft ID:', draft.id, 'Task ID:', taskId);
          
          // Atualiza registro de runs
          if (!runsRef.current[draft.id]) {
            runsRef.current[draft.id] = {};
          }
          runsRef.current[draft.id][isoDay] = taskId as string;
        } catch (err) {
          console.error('[useRecurrentTaskDrafts] Erro gerando task para dia:', draft.id, err);
        }
      }
      
      await saveRuns();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Regenera todas as tasks para todos os drafts (útil para sincronização) */
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

  // Carrega dados ao montar o componente
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
    tasksFromDraftDay,
    regenerateAllTasks,
  };
}