import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../comps/progressBar';
import { Easing } from 'react-native-reanimated';

interface DataModalProps {
  visible: boolean;
  currentStep: number;
  name: string;
  setName: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  skipPin: boolean;
  toggleSkipPin: () => void;
  acceptTerms: boolean;
  toggleAcceptTerms: () => void;
  handleNextStep: () => void;
  onClose: () => void;
}

const CELL_COUNT = 6;

export function DataModal({
  visible,
  currentStep,
  name,
  setName,
  pin,
  setPin,
  skipPin,
  toggleSkipPin,
  acceptTerms,
  toggleAcceptTerms,
  handleNextStep,
  onClose,
}: DataModalProps) {
  const ref = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  });

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">

        <View className="absolute top-0 left-0 right-0 z-20 pt-12">
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </View>

        <View className="flex-1 mt-[120px]">
          <View className="absolute top-[50px] gap-1 left-[6%] px-2 z-10">
            <Text className="text-white font-sans text-2xl max-w-[300px]">
              Boas vindas ao Dayo, sua jornada começa aqui!
            </Text>
          </View>

          <MotiView
            from={{ scale: 4 }}
            animate={{ scale: 2 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              repeatReverse: true,
            }}
            className="absolute w-full h-full"
          >
            <LinearGradient
              colors={[ '#000000', '#1f1f1f', '#f43f5e' ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, width: '100%', height: '100%' }}
            />
          </MotiView>

          <View className="h-[300px] p-4 mt-[145px]">
            <Text className="text-neutral-200 font-sans text-[14px] mb-3 px-5">
              Insira seu nome:
            </Text>
            <View className="flex items-center mb-[40px]">
              <TextInput
                className="bg-neutral-800/80 backdrop-blur-sm font-sans text-lg text-white h-[50px] w-[335px] px-5 rounded-2xl border border-neutral-700"
                placeholder="Seu nome"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text className="text-neutral-200 font-sans text-[14px] mb-3 px-5">
              Crie o seu PIN:
            </Text>
            <View
              pointerEvents={skipPin ? 'none' : 'auto'}
              style={{ opacity: skipPin ? 0.5 : 1 }}
              className="flex items-center justify-center mb-4"
            >
              <CodeField
                ref={ref}
                {...props}
                value={pin}
                onChangeText={setPin}
                cellCount={CELL_COUNT}
                rootStyle={{ flexDirection: 'row', justifyContent: 'center' }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    key={index}
                    onLayout={getCellOnLayoutHandler(index)}
                    className="w-[48px] h-[60px] rounded-xl items-center justify-center mx-[4px] bg-neutral-800/80 backdrop-blur-sm border border-neutral-700"
                  >
                    <Text className="text-white font-sans text-2xl">
                      {symbol || (isFocused ? <Cursor /> : '•')}
                    </Text>
                  </View>
                )}
              />
            </View>

            <TouchableOpacity
              className="flex-row items-center mt-3 mb-4 px-5"
              onPress={toggleSkipPin}
            >
              <Ionicons
                name={skipPin ? 'checkbox' : 'square-outline'}
                size={24}
                color="#ff7a7f"
              />
              <Text className="text-neutral-200 font-sans text-[14px] ml-2">
                Não criar PIN
              </Text>
            </TouchableOpacity>

            {/* Aceite de Termos de Uso */}
            <TouchableOpacity
              className="flex-row items-center mb-6 px-5"
              onPress={toggleAcceptTerms}
            >
              <Ionicons
                name={acceptTerms ? 'checkbox' : 'square-outline'}
                size={24}
                color="#ff7a7f"
              />
              <Text className="text-neutral-200 font-sans text-[14px] ml-2">
                Eu aceito os{' '}
                <Text
                  className="text-rose-400 underline"
                  onPress={() => Linking.openURL('https://seusite.com/termos')}
                >
                  Termos de Uso
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-[6%] self-center z-10">
            <TouchableOpacity
              className="bg-[#ff7a7f] rounded-xl h-[50px] w-[250px] items-center justify-center flex-row"
              onPress={handleNextStep}
              disabled={
                name.trim().length === 0 ||
                (!skipPin && pin.length !== CELL_COUNT) ||
                !acceptTerms
              }
            >
              <Text className="text-white font-sans font-medium text-xl px-3">
                Next step
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}