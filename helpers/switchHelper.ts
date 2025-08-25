import * as SecureStore from 'expo-secure-store';

interface SwitchState {
  routineId: string;
  state: boolean;
}

export const getSwitchState = async (routineId: string): Promise<SwitchState | null> => {
  try {
    const switchState = await SecureStore.getItemAsync(routineId);
    if (switchState === null) return null;

    return {
      routineId,
      state: switchState === "true", 
    };
  } catch (error) {
    console.error('Erro ao recuperar item', error);
    return null;
  }
};

export const setSwitchState = async (state: boolean, routineId: string): Promise<SwitchState> => {
  try {
    await SecureStore.setItemAsync(routineId, state.toString());
    return { routineId, state };
  } catch (error) {
    console.error('Erro ao salvar item', error);
    throw error;
  }
};

export const removeSwitchState = async (routineId: string): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(routineId);
    return true;
  } catch (error) {
    console.error('Erro ao remover item', error);
    return false;
  }
};
