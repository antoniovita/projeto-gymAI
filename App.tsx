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
import PinScreen from 'components/PinScreen';
import RoutineScreen from 'components/RoutineScreen';


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
  const [hasPin, setHasPin] = useState<boolean | null>(null);

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
    (async () => {
      const userId = await AuthService.getUserId();
      setIsAuthenticated(!!userId);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        console.log('Banco de dados pronto:', getDb());
        setIsDbReady(true);
      } catch (err) {
        console.error('Erro ao inicializar o DB:', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const storedPin = await AuthService.getUserPin();
      console.log('PIN armazenado no AsyncStorage:', storedPin);

      const pinExists = !!storedPin && storedPin.length > 0;
      console.log('Existe PIN?', pinExists);

      setHasPin(pinExists);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (
      fontsLoaded &&
      isAuthenticated !== null &&
      isDbReady &&
      hasPin !== null
    ) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated, isDbReady, hasPin]);

  if (!fontsLoaded || isAuthenticated === null || !isDbReady || hasPin === null) {
    return null;
  }

  let initialRoute: keyof RootStackParamList;
  if (!isAuthenticated) {
    initialRoute = 'WelcomeScreen';
  } else if (hasPin) {
    initialRoute = 'PinScreen';
  } else {
    initialRoute = 'MainTabs';
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="InfoScreen" component={InfoScreen} />
          <Stack.Screen name="PinScreen" component={PinScreen} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} />
          <Stack.Screen name="RoutineScreen" component={RoutineScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
