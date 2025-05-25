import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "../widgets/types";
import { useState } from 'react';

export default function AccountScreen() {
  const [input, setInput] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end">

            <View className="w-full rounded-t-[30px] pt-8 pl-6 pb-6 bg-neutral-900">
              <View className="flex-row pr-6">
                <TextInput
                  placeholder="Digite algo..."
                  placeholderTextColor="#A1A1AA"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  textAlignVertical="top"
                  className="flex-1 font-sans text-white font-light text-xl"
                />

                <TouchableOpacity
                  className="w-[28px] h-[28px] rounded-full mr-8 mt-2 bg-white justify-center items-center"
                  onPress={() => {
                    console.log('Enviar:', input);
                    setInput('');
                  }}
                >
                  <Ionicons name="caret-forward" size={18} color="black" />
                </TouchableOpacity>

              </View>
            </View>
            
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
