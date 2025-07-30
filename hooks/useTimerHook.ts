import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomTimer {
  id: string;
  name: string | null;
  seconds: number;
}

export const useTimerHook = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTimer, setCustomTimer] = useState<CustomTimer[]>([]);
  
  const CUSTOM_TIMER_KEY = "@custom_timer";

  useEffect(() => {
    const loadCustomTimer = async () => {
      setLoading(true);
      try {
        const storedTimers = await AsyncStorage.getItem(CUSTOM_TIMER_KEY);
        if (storedTimers) {
          const parsedTimers = JSON.parse(storedTimers);

          if (Array.isArray(parsedTimers)) {
            setCustomTimer(parsedTimers);
          }
        }
      } catch (err: any) {
        console.error('Error loading custom timers from storage:', err);
        setError(err.message || 'Erro ao carregar timers personalizados');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomTimer();
  }, []);

  const createCustomTimer = async (
    id: string,
    name: string,
    seconds: number
  ): Promise<CustomTimer> => {
    setSaving(true);
    setError(null);
    
    try {
      // Validação dos parâmetros
      if (!id || typeof id !== 'string') {
        throw new Error('ID é obrigatório e deve ser uma string');
      }
      if (typeof seconds !== 'number' || seconds <= 0) {
        throw new Error('Segundos deve ser um número positivo');
      }
      
      const existingTimer = customTimer.find(timer => timer.id === id);
      if (existingTimer) {
        throw new Error('Já existe um timer com este ID');
      }

      const newCustomTimer: CustomTimer = {
        id,
        name,
        seconds,
      };

      const updatedCustomTimer = [...customTimer, newCustomTimer];
      setCustomTimer(updatedCustomTimer);
      
      await AsyncStorage.setItem(CUSTOM_TIMER_KEY, JSON.stringify(updatedCustomTimer));
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return newCustomTimer;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar timer personalizado';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const removeCustomTimer = async (id: string): Promise<void> => {
    setSaving(true);
    setError(null);
    
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID é obrigatório para remover o timer');
      }

      const filteredCustomTimers = customTimer.filter(timer => timer.id !== id);
      setCustomTimer(filteredCustomTimers);
      
      await AsyncStorage.setItem(CUSTOM_TIMER_KEY, JSON.stringify(filteredCustomTimers));
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover timer personalizado';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateCustomTimer = async (
    id: string,
    updates: Partial<Omit<CustomTimer, 'id'>>
  ): Promise<CustomTimer> => {
    setSaving(true);
    setError(null);
    
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID é obrigatório para atualizar o timer');
      }

      const timerIndex = customTimer.findIndex(timer => timer.id === id);
      if (timerIndex === -1) {
        throw new Error('Timer não encontrado');
      }

      const updatedTimer = { ...customTimer[timerIndex], ...updates };
      const updatedCustomTimers = [...customTimer];
      updatedCustomTimers[timerIndex] = updatedTimer;

      setCustomTimer(updatedCustomTimers);
      await AsyncStorage.setItem(CUSTOM_TIMER_KEY, JSON.stringify(updatedCustomTimers));

      return updatedTimer;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar timer personalizado';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearAllTimers = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    
    try {
      setCustomTimer([]);
      await AsyncStorage.removeItem(CUSTOM_TIMER_KEY);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao limpar todos os timers';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    customTimer,
    error,
    clearError,
    createCustomTimer,
    removeCustomTimer,
    updateCustomTimer,
    clearAllTimers,
  };
};