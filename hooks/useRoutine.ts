import { useState, useEffect, useCallback } from 'react';
import { RoutineService } from '../api/service/routineService';

export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string; // ISO string: "2025-06-12T07:12:00.000Z"
  type?: string;
  user_id: string;
  routine_id?: string;
}

export interface Routine {
  id: string;
  dayOfWeek: string;
  tasks: Task[];
  [key: string]: any;
}

/**
 * Hook para gerenciar rotinas e suas tarefas de um usuário.
 * @param userId - ID do usuário cujas rotinas serão manipuladas.
 */
export function useRoutine(userId: string) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineByDay, setRoutineByDay] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todas as rotinas do usuário e suas tarefas, atualizando o estado 'routines'.
   */
  const fetchRoutines = useCallback(async () => {
    console.log('[useRoutine] fetchRoutines: iniciando para userId=', userId);
    setLoading(true);
    setError(null);
    try {
      const data = await RoutineService.getRoutines(userId);
      console.log('[useRoutine] fetchRoutines: recuperou', data.length, 'rotinas', data);
      setRoutines(data);
    } catch (err: any) {
      console.error('[useRoutine] fetchRoutines: erro', err);
      setError(err.message || 'Erro ao buscar rotinas.');
    } finally {
      setLoading(false);
      console.log('[useRoutine] fetchRoutines: finalizado');
    }
  }, [userId]);

  /**
   * Busca a rotina de um dia específico e suas tarefas, atualizando 'routineByDay'.
   * @param dayOfWeek - Dia da semana para filtrar a rotina (ex: 'monday').
   */
  const fetchRoutineByDay = useCallback(
    async (dayOfWeek: string) => {
      console.log('[useRoutine] fetchRoutineByDay: dia=', dayOfWeek);
      setLoading(true);
      setError(null);
      try {
        const data = await RoutineService.getRoutineByDay(userId, dayOfWeek);
        console.log('[useRoutine] fetchRoutineByDay: rotina=', data);
        setRoutineByDay(data);
      } catch (err: any) {
        console.error('[useRoutine] fetchRoutineByDay: erro', err);
        setError(err.message || 'Erro ao buscar rotina do dia.');
      } finally {
        setLoading(false);
        console.log('[useRoutine] fetchRoutineByDay: finalizado');
      }
    },
    [userId]
  );

  /**
   * Cria uma nova rotina para um dia da semana e adiciona à lista 'routines'.
   * @param dayOfWeek - Dia da semana para a nova rotina.
   */
  const createRoutine = useCallback(
    async (dayOfWeek: string) => {
      console.log('[useRoutine] createRoutine: dia=', dayOfWeek);
      setLoading(true);
      setError(null);
      try {
        const newRoutine = await RoutineService.createRoutine(userId, dayOfWeek);
        newRoutine.tasks = [];
        console.log('[useRoutine] createRoutine: criada', newRoutine);
        setRoutines(prev => [...prev, newRoutine]);
      } catch (err: any) {
        console.error('[useRoutine] createRoutine: erro', err);
        setError(err.message || 'Erro ao criar rotina.');
      } finally {
        setLoading(false);
        console.log('[useRoutine] createRoutine: finalizado');
      }
    },
    [userId]
  );

  /**
   * Exclui uma rotina existente e remove da lista 'routines'.
   * @param routineId - ID da rotina a ser deletada.
   */
  const deleteRoutine = useCallback(
    async (routineId: string) => {
      console.log('[useRoutine] deleteRoutine: id=', routineId);
      setLoading(true);
      setError(null);
      try {
        await RoutineService.deleteRoutine(routineId);
        console.log('[useRoutine] deleteRoutine: sucesso');
        setRoutines(prev => prev.filter(r => r.id !== routineId));
      } catch (err: any) {
        console.error('[useRoutine] deleteRoutine: erro', err);
        setError(err.message || 'Erro ao deletar rotina.');
      } finally {
        setLoading(false);
        console.log('[useRoutine] deleteRoutine: finalizado');
      }
    },
    []
  );


  // Carrega todas as rotinas ao montar o hook ou quando 'userId' mudar
  useEffect(() => {
    console.log('[useRoutine] useEffect: userId mudou para', userId);
    if (userId) {
      fetchRoutines();
    }
  }, [userId, fetchRoutines]);

  return {
    routines,          // Lista de todas as rotinas do usuário
    routineByDay,      // Rotina específica por dia
    loading,           // Indicador de carregamento
    error,             // Mensagem de erro
    fetchRoutines,     // Recarregar todas as rotinas
    fetchRoutineByDay, // Buscar rotina por dia
    createRoutine,     // Criar nova rotina
    deleteRoutine,     // Deletar rotina existente
  };
}
