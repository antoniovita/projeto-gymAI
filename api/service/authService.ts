import * as SecureStore from 'expo-secure-store';

export const AuthService = {
  saveUserId: async (userId: string) => {
    await SecureStore.setItemAsync('user_id', userId);
  },

  getUserId: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('user_id');
  },

  clearUserId: async () => {
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_name');
  },

  isLoggedIn: async (): Promise<boolean> => {
    const id = await SecureStore.getItemAsync('user_id');
    return !!id;
  },

  saveUserName: async (name: string) => {
    await SecureStore.setItemAsync('user_name', name);
  },

  getUserName: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('user_name');
  },

  clearUserName: async () => {
    await SecureStore.deleteItemAsync('user_name');
  },
};
