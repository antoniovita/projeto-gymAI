import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  ScrollView
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);

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
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              entering={FadeIn.duration(800)}
              className="gap-6 items-center"
            >
              <Text className="text-white font-light text-2xl text-center">
                Your journey starts now
              </Text>

              <View className="flex-row items-end gap-1">
                <Text className="text-white text-4xl font-bold">Let’s</Text>
                <Text className="text-yellow-500 text-3xl font-bold">be</Text>
                <Text className="text-yellow-500 text-5xl font-extrabold">Better</Text>
              </View>

              <View className="w-full mt-10 items-center gap-3">
                <Text className="text-white text-lg mb-1">What is your name?</Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="antonio vita"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className={`w-[260px] text-center text-xl px-6 py-4 rounded-3xl ${
                    focused
                      ? 'bg-neutral-600 border border-yellow-500 text-white'
                      : 'bg-neutral-700 border border-gray-800 text-white'
                  }`}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-yellow-500 w-[260px] py-4 rounded-2xl mt-8 shadow-lg shadow-yellow-500/30"
              >
                <Text className="text-black text-center text-xl font-bold">
                  Begin the process
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
