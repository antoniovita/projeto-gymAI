import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import "./global.css";

import { AuthService } from 'api/service/authService';
import { initDatabase, getDb } from 'database';

import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './widgets/MainTabs';
import SettingsScreen from 'components/SettingsScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins: require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isAuthenticated !== null && isDbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated, isDbReady]);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await AuthService.getUserId();
      setIsAuthenticated(!!userId);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initDatabase();
        const db = getDb();
        console.log('Banco de dados inicializado:', db);
        setIsDbReady(true);
      } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
      }
    };
    initDb();
  }, []);

  if (!fontsLoaded || isAuthenticated === null || !isDbReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          )}
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
