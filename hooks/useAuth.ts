import { useEffect, useState } from 'react';
import { UserService } from '../api/service/userService';
import { AuthService } from '../api/service/authService';
import { deleteDatabase } from 'database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [userId,   setUserId]   = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading,  setLoading]  = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const [storedId, storedName] = await Promise.all([
        AuthService.getUserId(),
        AuthService.getUserName()
      ]);
      setUserId(storedId);
      setUserName(storedName);
      console.log('Usuário carregado:', storedName);
      setLoading(false);
    })();
  }, []);

  const register = async (name: string) => {
    setLoading(true);
    try {
      const newUserId = await UserService.createUserLocal(name);
      if (!newUserId) throw new Error('Failed to create user');
      await Promise.all([
        AuthService.saveUserId(newUserId),
        AuthService.saveUserName(name)
      ]);
      setUserId(newUserId);
      setUserName(name);
      console.log('Usuário registrado:', name);
    } finally {
      setLoading(false);
    }
  };

  const storePin = async (pin: string) => {
    setLoading(true);
    try {
      await AuthService.saveUserPin(pin);
      console.log('PIN armazenado:', pin);
    } finally {
      setLoading(false);
    }
  };

  const changePin = storePin;

  const verifyPin = async (pin: string): Promise<boolean> => {
    setLoading(true);
    try {
      const stored = await AuthService.getUserPin();
      console.log('PIN armazenado no AsyncStorage:', stored);
      return stored === pin;
    } finally {
      setLoading(false);
    }
  };

  const hasPin = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const stored = await AuthService.getUserPin();
      console.log('PIN armazenado no AsyncStorage:', stored);
      return !!stored && stored.length > 0;
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
    } finally {
      setLoading(false);
    }
  };

  const login = async (id: string) => {
    setLoading(true);
    try {
      const user = await UserService.getUserById(id);
      if (!user) throw new Error('User not found');
      await Promise.all([
        AuthService.saveUserId(user.id),
        AuthService.saveUserName(user.name)
      ]);
      setUserId(user.id);
      setUserName(user.name);
      console.log('Usuário logado:', user.name);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.clear()
      await AuthService.clearAuth();
      await deleteDatabase();
      setUserId(null);
      setUserName(null);
      console.log('Usuário deslogado e PIN removido');
    } finally {
      setLoading(false);
    }
  };

  const removePin = async () => {
    setLoading(true);
    try {
      await AuthService.removePin()
      console.log('PIN removido.')
    } finally {
      setLoading(false);
    }
  }


  return {
    userId,
    userName,
    loading,
    isLoggedIn: !!userId,
    register,
    storePin,
    changePin,
    verifyPin,
    hasPin,
    changeName,
    login,
    removePin,
    logout,
  };
}
