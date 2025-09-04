import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css";
import { AuthService } from 'api/service/authService';
import { initDatabase, deleteDatabase} from 'database';
import WelcomeScreen from './components/Screens/Welcome/WelcomeScreen';
import MainTabs from './widgets/MainTabs';
import SettingsScreen from 'components/SettingsScreen';
import { RootStackParamList } from 'widgets/types';
import InfoScreen from 'components/InfoScreen';
import HelpScreen from 'components/HelpScreen';
import PinScreen from 'components/PinScreen';
import RoutineScreen from 'components/Screens/Routine/RoutineScreen';
import WorkoutScreen from 'components/Screens/Workouts/WorkoutScreen';
import MoreScreen from 'components/Screens/More/MoreScreen';
import NoteScreen from 'components/Screens/Notes/NoteScreen';
import GoalScreen from 'components/Screens/Goal/GoalScreen';
import TimerScreen from 'components/Screens/Timer/TimerScreen';
// import Purchases, { LOG_LEVEL } from 'react-native-purchases';

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

// // trocar isso para a minha chave depois
//   const REVENUECAT_APPLE_API_KEY = 'your_apple_api_key_here';
//   const REVENUECAT_GOOGLE_API_KEY = 'your_google_api_key_here';

//   useEffect(() => {
//     Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

//     if (Platform.OS === 'ios') {
//        Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
//     } else if (Platform.OS === 'android') {
//        Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
//     }

//   }, []);

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
      try {
        const userId = await AuthService.getUserId();
        setIsAuthenticated(!!userId);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        console.log('Iniciando configuração do banco de dados...');
        
        await initDatabase();
        console.log('Banco de dados configurado com sucesso');
        
        setIsDbReady(true);
      } catch (err) {
        console.error('Erro ao configurar o banco de dados:', err);
        setIsDbReady(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedPin = await AuthService.getUserPin();
        console.log('PIN verificado');

        const pinExists = !!storedPin && storedPin.length > 0;
        console.log('Existe PIN?', pinExists);

        setHasPin(pinExists);
      } catch (error) {
        console.error('Erro ao verificar PIN:', error);
        setHasPin(false);
      }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Stack.Screen name="WorkoutScreen" component={WorkoutScreen} />
            <Stack.Screen name="MoreScreen" component={MoreScreen} />
            <Stack.Screen name="NoteScreen" component={NoteScreen} />
            <Stack.Screen name="GoalScreen" component={GoalScreen} />
            <Stack.Screen name="TimerScreen" component={TimerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </GestureHandlerRootView>
  );
}