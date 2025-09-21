import * as SecureStore from 'expo-secure-store';

export const AuthService = {

//user_id
  saveUserId: async (userId: string) => {
    await SecureStore.setItemAsync('user_id', userId);
  },

  getUserId: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('user_id');
  },

  clearUserId: async () => {
    await SecureStore.deleteItemAsync('user_id');
  },

//user_name
  saveUserName: async (name: string) => {
    await SecureStore.setItemAsync('user_name', name);
  },

  getUserName: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('user_name');
  },

  clearUserName: async () => {
    await SecureStore.deleteItemAsync('user_name');
  },

//user_pin
  saveUserPin: async (pin: string) => {
    await SecureStore.setItemAsync('user_pin', pin, { requireAuthentication: false });
  },

  getUserPin: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('user_pin', { requireAuthentication: false });
  },

  clearUserPin: async () => {
    await SecureStore.deleteItemAsync('user_pin');
  },

//general_clear
  clearAuth: async () => {
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_name');
    await SecureStore.deleteItemAsync('user_pin');
  },

//isLogged condition
  isLoggedIn: async (): Promise<boolean> => {
    const id = await SecureStore.getItemAsync('user_id');
    return !!id;
  },
};
