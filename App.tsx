import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import "./global.css";

import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './widgets/MainTabs';
import { AuthService } from './api/service/authService';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins: require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isAuthenticated !== null) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await AuthService.getUserId();
      setIsAuthenticated(!!userId);
    };
    checkAuth();
  }, []);

  if (!fontsLoaded || isAuthenticated === null) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
