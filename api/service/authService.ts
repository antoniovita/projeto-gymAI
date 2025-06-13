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
  },

  isLoggedIn: async (): Promise<boolean> => {
    const id = await SecureStore.getItemAsync('user_id');
    return !!id;
  },
};
