import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import "./global.css";
import { AuthService } from 'api/service/authService';
import { initDatabase, getDb } from 'database';
import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './widgets/MainTabs';
import SettingsScreen from 'components/SettingsScreen';
import { RootStackParamList } from 'widgets/types';
import InfoScreen from 'components/subScreens/InfoScreen';
import HelpScreen from 'components/subScreens/HelpScreen';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins: require('./assets/Poppins/Poppins-Regular.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permissão de notificações negada');
      }
    })();
  }, []);

  useEffect(() => {
    const receiveSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta da notificação:', response);
    });
    return () => {
      receiveSub.remove();
      responseSub.remove();
    };
  }, []);

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isAuthenticated !== null && isDbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated, isDbReady]);

  if (!fontsLoaded || isAuthenticated === null || !isDbReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'MainTabs' : 'WelcomeScreen'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="InfoScreen" component={InfoScreen} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
