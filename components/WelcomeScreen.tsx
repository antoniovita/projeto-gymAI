import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { UserService } from 'api/service/userService';
import { AuthService } from 'api/service/authService';
import { initDatabase } from 'database';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const prepareDatabase = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
      }
    };
    prepareDatabase();
  }, []);

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, digite seu nome.');
      return;
    }

    try {
      setLoading(true);
      const response = await UserService.createUser(name.trim());
      if (response.success) {
        console.log('Usuário criado com sucesso:', response);
      } else {
        console.error('Erro ao criar usuário:', response.error);
        Alert.alert('Erro', response.error || 'Falha ao criar usuário.');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  if (!dbReady) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <LinearGradient
          colors={['#000000', '#111827']}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-6 flex items-center">
              <Animated.Text
                entering={SlideInLeft.duration(600)}
                className="text-white font-light text-xl text-center"
              >
                Your journey starts now
              </Animated.Text>

              <View className="flex-row items-baseline gap-3">
                <Animated.Text
                  entering={SlideInLeft.delay(200).duration(500)}
                  className="text-white text-4xl font-bold"
                >
                  Let’s
                </Animated.Text>

                <View className="flex flex-row items-baseline">
                  <Animated.Text
                    entering={SlideInLeft.delay(400).duration(500)}
                    className="text-yellow-500 text-3xl font-bold"
                  >
                    be
                  </Animated.Text>
                  <Animated.Text
                    entering={SlideInLeft.delay(600).duration(500)}
                    className="text-yellow-500 text-5xl font-extrabold"
                  >
                    Better
                  </Animated.Text>
                </View>
              </View>

              <Animated.View
                entering={FadeIn.delay(1500).duration(1000)}
                className="w-full mt-6 items-center"
              >
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name here..."
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-[260px] text-center text-2xl text-white font-bold px-6 py-4 rounded-3xl"
                />
              </Animated.View>

              <Animated.View
                entering={SlideInLeft.delay(800).duration(500)}
                className="w-full items-center"
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCreateUser}
                  disabled={loading}
                  className="bg-yellow-500 w-[260px] py-4 rounded-2xl mt-6 shadow-lg shadow-yellow-500/30"
                >
                  <Text className="text-black text-center text-xl font-bold">
                    {loading ? 'Creating...' : 'Begin the process'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </LinearGradient>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
