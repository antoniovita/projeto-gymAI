import { useState, useEffect, useCallback } from 'react';
import { RoutineService } from '../api/service/routineService';

export interface Task {
  id: string;
  title: string;
  content: string;
  datetime: string; // ISO string: "2025-06-12T07:12:00.000Z"
  type?: string;
  completed: 0 | 1;
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
    setLoading(true);
    setError(null);
    try {
      const data = await RoutineService.getRoutines(userId);
      // Cada rotina já vem com suas tasks
      setRoutines(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar rotinas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Busca a rotina de um dia específico e suas tarefas, atualizando 'routineByDay'.
   * @param dayOfWeek - Dia da semana para filtrar a rotina (ex: 'monday').
   */
  const fetchRoutineByDay = useCallback(
    async (dayOfWeek: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await RoutineService.getRoutineByDay(userId, dayOfWeek);
        // A rotina retornada inclui o array de tasks
        setRoutineByDay(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar rotina do dia.');
      } finally {
        setLoading(false);
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
      setLoading(true);
      setError(null);
      try {
        const newRoutine = await RoutineService.createRoutine(userId, dayOfWeek);
        newRoutine.tasks = []; // Inicializa sem tarefas
        setRoutines(prev => [...prev, newRoutine]);
      } catch (err: any) {
        setError(err.message || 'Erro ao criar rotina.');
      } finally {
        setLoading(false);
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
      setLoading(true);
      setError(null);
      try {
        await RoutineService.deleteRoutine(routineId);
        setRoutines(prev => prev.filter(r => r.id !== routineId));
      } catch (err: any) {
        setError(err.message || 'Erro ao deletar rotina.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Carrega todas as rotinas ao montar o hook ou quando 'userId' mudar
  useEffect(() => {
    if (userId) {
      fetchRoutines();
    }
  }, [userId, fetchRoutines]);

  return {
    routines,          // Lista de todas as rotinas do usuário, cada uma com seu array de tarefas
    routineByDay,      // Rotina específica por dia com suas tarefas
    loading,           // Indicador de carregamento
    error,             // Mensagem de erro, se houver
    fetchRoutines,     // Função para recarregar todas as rotinas
    fetchRoutineByDay, // Função para buscar rotina por dia
    createRoutine,     // Função para criar nova rotina (inicializa tasks vazias)
    deleteRoutine,     // Função para deletar rotina existente
  };
}
