import * as SecureStore from 'expo-secure-store';
import { SQLiteDatabase } from 'expo-sqlite';

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
  },

  // Função para registrar usuário: chama backend, salva securestore, cria local no SQLite
  registerUser: async (db: SQLiteDatabase, name: string, email: string, password: string) => {
    const response = await fetch('https://api.seuservidor.com/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Falha no registro');
    }

    const data = await response.json();

    await SecureStore.setItemAsync('user_id', data.user_id);

    // Exemplo: salvar status da assinatura (pode adaptar conforme seu backend)
    await SecureStore.setItemAsync('isSubscribed', data.subscription.status === 'active' ? '1' : '0');

    // Cria usuário localmente no SQLite
    await db.runAsync(
      'INSERT INTO user (id, name) VALUES (?, ?)', 
      data.user_id, 
      name
    );

    return data.user_id;
  }
};
