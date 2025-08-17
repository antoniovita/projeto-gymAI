import { useEffect, useState } from 'react';
import { UserService } from '../api/service/userService';
import { AuthService } from '../api/service/authService';
import { deleteDatabase } from 'database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const [storedId, storedName] = await Promise.all([
        AuthService.getUserId(),
        AuthService.getUserName()
      ]);
      
      setUserId(storedId);
      setUserName(storedName);
      
      if (storedName) {
        console.log('Usuário carregado:', storedName);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string) => {
    setLoading(true);
    try {

      const newUserId = Date.now().toString();
      
      const userId = await UserService.createUser(newUserId, name);
      
      await Promise.all([
        AuthService.saveUserId(userId!),
        AuthService.saveUserName(name)
      ]);
      
      setUserId(userId!);
      setUserName(name);
      console.log('Usuário registrado:', name);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (id: string) => {
    setLoading(true);
    try {
      const user = await UserService.getUserById(id);
      
      await Promise.all([
        AuthService.saveUserId(user!.id),
        AuthService.saveUserName(user!.name)
      ]);
      
      setUserId(user!.id);
      setUserName(user!.name);
      console.log('Usuário logado:', user!.name);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await Promise.all([
        AsyncStorage.clear(),
        AuthService.clearAuth(),
        deleteDatabase()
      ]);
      
      setUserId(null);
      setUserName(null);
      console.log('Usuário deslogado e dados limpos');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeName = async (name: string) => {
    setLoading(true);
    try {
      await AuthService.saveUserName(name);
      setUserName(name);
      console.log('Nome alterado para:', name);
    } catch (error) {
      console.error('Erro ao alterar nome:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const storePin = async (pin: string) => {
    setLoading(true);
    try {
      await AuthService.saveUserPin(pin);
      console.log('PIN armazenado com sucesso');
    } catch (error) {
      console.error('Erro ao armazenar PIN:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePin = storePin;

  const verifyPin = async (pin: string): Promise<boolean> => {
    setLoading(true);
    try {
      const storedPin = await AuthService.getUserPin();
      const isValid = storedPin === pin;
      
      if (!isValid) {
        console.log('PIN inválido');
      }
      
      return isValid;
    } catch (error) {
      console.error('Erro ao verificar PIN:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasPin = async (): Promise<boolean> => {
    try {
      const storedPin = await AuthService.getUserPin();
      return !!storedPin && storedPin.length > 0;
    } catch (error) {
      console.error('Erro ao verificar existência do PIN:', error);
      return false;
    }
  };

  const getPin = async (): Promise<string | null> => {
    setLoading(true);
    try {
      const pin = await AuthService.getUserPin();
      return pin;
    } catch (error) {
      console.error('Erro ao obter PIN:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removePin = async () => {
    setLoading(true);
    try {
      await AuthService.removePin();
      console.log('PIN removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover PIN:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    userId,
    userName,
    loading,
    isLoggedIn: !!userId,
    
    // Auth Methods
    register,
    login,
    logout,
    changeName,
    
    // PIN Methods
    storePin,
    changePin,
    verifyPin,
    hasPin,
    getPin,
    removePin
  };
}