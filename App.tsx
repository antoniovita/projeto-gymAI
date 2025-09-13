// general imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useState, createContext } from 'react';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from "styled-components/native";
import { useFonts } from 'expo-font';

// database and auth
import { AuthService } from 'api/service/authService';
import { initDatabase } from 'database';

// components
import WelcomeScreen from './components/Screens/Welcome/WelcomeScreen';
import SettingsScreen from 'components/SettingsScreen';
import InfoScreen from 'components/InfoScreen';
import HelpScreen from 'components/HelpScreen';
import PinScreen from 'components/PinScreen';
import RoutineScreen from 'components/Screens/Routine/RoutineScreen';
import WorkoutScreen from 'components/Screens/Workouts/WorkoutScreen';
import MoreScreen from 'components/Screens/More/MoreScreen';
import NoteScreen from 'components/Screens/Notes/NoteScreen';
import GoalScreen from 'components/Screens/Goal/GoalScreen';
import TimerScreen from 'components/Screens/Timer/TimerScreen';

//maintabs
import MainTabs from './widgets/MainTabs';
import { RootStackParamList } from 'widgets/types';

//fonts
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_400Regular_Italic,
} from '@expo-google-fonts/poppins';

// llama-rn
import { bootstrapLlama } from './llm.config';
import type { LlamaCtx } from './llm.config';

//styles and theme
import "./global.css";
import { themes } from 'appearance';




// import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// ⚠️ manter antes do primeiro render
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

// ===== Utils =====
async function withTimeout<T>(p: Promise<T>, ms = 8000, label = 'operação'): Promise<T> {
  return await Promise.race<T>([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`Timeout (${label}, ${ms}ms)`)), ms)
    ) as Promise<T>,
  ]);
}
// =================

// ===== Contexto do LLM disponível para o app inteiro =====
type LlmContextType = {
  ctx: LlamaCtx | null;
  ready: boolean;
  progress: number; // 0..100 durante o primeiro download
  error: string | null;
};
export const LlmContext = createContext<LlmContextType>({
  ctx: null,
  ready: false,
  progress: 0,
  error: null,
});
// =========================================================

export default function App() {

const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_400Regular_Italic,
  });



  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  // ===== Estado do LLM (NÃO bloqueia splash) =====
  const [llmCtx, setLlmCtx] = useState<LlamaCtx | null>(null);
  const [isLlmReady, setIsLlmReady] = useState(false);
  const [llmProgress, setLlmProgress] = useState(0);
  const [llmError, setLlmError] = useState<string | null>(null);
  // ===============================================

  // --------- Notificações ---------
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permissão de notificações negada');
        }
      } catch (e) {
        console.warn('Falha ao pedir permissão de notificações:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const receiveSub = Notifications.addNotificationReceivedListener(n => {
      console.log('Notificação recebida:', n);
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener(r => {
      console.log('Resposta da notificação:', r);
    });
    return () => {
      receiveSub.remove();
      responseSub.remove();
    };
  }, []);
  // --------------------------------

  // --------- Auth ---------
  useEffect(() => {
    (async () => {
      try {
        const userId = await withTimeout(AuthService.getUserId(), 8000, 'getUserId');
        setIsAuthenticated(!!userId);
      } catch (error) {
        console.error('Erro/timeout ao verificar autenticação:', error);
        setIsAuthenticated(false); // fallback seguro
      }
    })();
  }, []);
  // -----------------------

  // --------- DB ---------
  useEffect(() => {
    (async () => {
      try {
        console.log('Iniciando configuração do banco de dados...');
        await withTimeout(initDatabase(), 8000, 'initDatabase');
        console.log('Banco de dados configurado com sucesso');
        setIsDbReady(true);
      } catch (err) {
        console.error('Erro/timeout ao configurar o banco de dados:', err);
        setIsDbReady(false); // segue sem DB (app decide comportamento)
      }
    })();
  }, []);
  // ----------------------

  // --------- PIN ---------
  useEffect(() => {
    (async () => {
      try {
        const storedPin = await withTimeout(AuthService.getUserPin(), 8000, 'getUserPin');
        const pinExists = !!storedPin && storedPin.length > 0;
        setHasPin(pinExists);
      } catch (error) {
        console.error('Erro/timeout ao verificar PIN:', error);
        setHasPin(false); // fallback: sem PIN
      }
    })();
  }, []);
  // -----------------------

  // ===== Inicialização do LLM (paralelo, não bloqueia splash) =====
  useEffect(() => {
    let cancelled = false;

    async function startLLM() {
      try {
        // você pode condicionar pelo login, mas não bloqueia a splash
        if (isAuthenticated === false) {
          setIsLlmReady(true);
          return;
        }
        setLlmError(null);
        setIsLlmReady(false);
        setLlmProgress(0);
        const ctx = await bootstrapLlama(p => !cancelled && setLlmProgress(p));
        if (!cancelled) {
          setLlmCtx(ctx);
          setIsLlmReady(true);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLlmError(e?.message ?? 'Falha ao iniciar LLM');
          setIsLlmReady(true); // erro não bloqueia UI
        }
      }
    }

    if (isAuthenticated !== null) {
      startLLM();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
  // ================================================================

  // --------- Controle da Splash ---------
  // Boot "essencial" pronto? (LLM NÃO está incluso)
  const bootReady =
    !!fontsLoaded &&
    isAuthenticated !== null &&
    isDbReady !== null &&
    hasPin !== null;

  // Esconde splash quando essencial estiver pronto
  useEffect(() => {
    if (bootReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [bootReady]);

  // Watchdog: garante esconder em 12s, mesmo se algo travar
  useEffect(() => {
    const t = setTimeout(() => {
      if (!bootReady) {
        console.warn('[boot] watchdog: escondendo splash por timeout');
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 12000);
    return () => clearTimeout(t);
  }, [bootReady]);

  const onLayoutRootView = useCallback(() => {
    // caso o layout já esteja na tela e o bootReady tenha virado true,
    // garantimos um hide extra (idempotente)
    if (bootReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [bootReady]);
  // --------------------------------------

  // Enquanto carrega o essencial, mostra um painel leve
  const isBooting = !bootReady;

  let initialRoute: keyof RootStackParamList;
  if (!isAuthenticated) {
    initialRoute = 'WelcomeScreen';
  } else if (hasPin) {
    initialRoute = 'PinScreen';
  } else {
    initialRoute = 'MainTabs';
  }


  // Valor do contexto do LLM (reutilizável em telas)
  const llmValue = useMemo<LlmContextType>(() => ({
    ctx: llmCtx,
    ready: isLlmReady,
    progress: llmProgress,
    error: llmError,
  }), [llmCtx, isLlmReady, llmProgress, llmError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={themes.default}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <LlmContext.Provider value={llmValue}>
          {isBooting ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Poppins' }}>Carregando…</Text>
              <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Poppins' }}>
                fontes: {String(!!fontsLoaded)} · auth: {String(isAuthenticated)} · db: {String(isDbReady)} · pin: {String(hasPin)}
              </Text>
              <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Poppins' }}>
                IA (download em segundo plano): {llmProgress}%
              </Text>
              {llmError ? (
                <Text style={{ marginTop: 8, fontSize: 12, color: 'red' }}>
                  Erro LLM: {llmError}
                </Text>
              ) : null}
            </View>
          ) : (
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
          )}
        </LlmContext.Provider>
      </View>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
