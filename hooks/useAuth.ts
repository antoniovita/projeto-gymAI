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
    const loadUser = async () => {
      const storedId = await AuthService.getUserId();
      const storedName = await AuthService.getUserName();
      setUserId(storedId);
      setUserName(storedName);
      console.log('Usuário carregado:', storedName);
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (name: string) => {
    setLoading(true);
    try {
      const newUserId = await UserService.createUserLocal(name);
      if (!newUserId) {
        throw new Error('Failed to create user');
      }
      await AuthService.saveUserId(newUserId);
      await AuthService.saveUserName(name);
      setUserId(newUserId);
      setUserName(name);
      console.log('Usuário registrado:', name);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const storePin = async (pin: string) => {
    setLoading(true);
    try {
      await AuthService.saveUserPin(pin);
      console.log('PIN armazenado:', pin);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const changePin = async (pin: string) => {
    setLoading(true);
    try {
      await AuthService.saveUserPin(pin);
      console.log('PIN alterado para:', pin);
    } catch (error: any) {
      throw new Error(error.message);
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
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (id: string) => {
    setLoading(true);
    try {
      const user = await UserService.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }
      await AuthService.saveUserId(user.id);
      await AuthService.saveUserName(user.name);
      setUserId(user.id);
      setUserName(user.name);
      console.log('Usuário logado:', user.name);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.clear();
      await deleteDatabase();      
      setUserId(null);         
      setUserName(null);
      console.log('Usuário deslogado');
    } catch (error: any) {
      console.error('Erro ao deslogar:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userId,
    userName,
    loading,
    isLoggedIn: !!userId,
    register,
    storePin,
    changePin,
    changeName,
    login,
    logout,
  };
}
