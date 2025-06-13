import { useEffect, useState } from 'react';
import { UserService } from '../api/service/userService';
import { AuthService } from '../api/service/authService';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedId = await AuthService.getUserId();
      setUserId(storedId);
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (name: string) => {
    setLoading(true);
    try {
      const newUserId = await UserService.createUserLocal(name);
      if (!newUserId) {
        throw new Error("Failed to create user");
      }
      await AuthService.saveUserId(newUserId);
      setUserId(newUserId);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (id: string) => {
    setLoading(true);
    try {
      const user = await UserService.getUserById(id); // Verifica se existe
      if (!user) {
        throw new Error("User not found");
      }
      await AuthService.saveUserId(user.id);
      setUserId(user.id);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.clearUserId();
    setUserId(null);
  };

  return {
    userId,
    loading,
    isLoggedIn: !!userId,
    register,
    login,
    logout,
  };
}
