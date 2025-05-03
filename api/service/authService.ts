import * as SecureStore from 'expo-secure-store';

export const AuthService = {
  saveUserId: async (userId: string) => {
    await SecureStore.setItemAsync('user_id', userId);
  },

  getUserId: async (): Promise<string | null> => {
    const storedId = await SecureStore.getItemAsync('user_id');
    return storedId;
  },

  clearUserId: async () => {
    await SecureStore.deleteItemAsync('user_id');
  }
};
