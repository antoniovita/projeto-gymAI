import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './progressBar';
import { Easing } from 'react-native-reanimated';


interface SubscriptionModalProps {
  visible: boolean;
  currentStep: number;
  selectedPlan: 'free' | 'premium' | null;
  setSelectedPlan: (plan: 'free' | 'premium') => void;
  onBack: () => void;
  onFinish: () => void;
}

export function SubscriptionModal({
  visible,
  currentStep,
  selectedPlan,
  setSelectedPlan,
  onBack,
  onFinish,
}: SubscriptionModalProps) {
  const planButtonStyle = (active: boolean, gradient?: boolean): ViewStyle => ({
    backgroundColor: gradient
      ? 'transparent'
      : active
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.05)',
    borderWidth: active ? 2 : 1,
    borderColor: active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    shadowColor: active ? (gradient ? '#f43f5e' : '#ffffff') : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: active ? 0.3 : 0,
    shadowRadius: active ? 20 : 0,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onBack}
    >
      <View className="flex-1 bg-neutral-800">
        {/* Progress Bar */}
        <View className="absolute top-0 left-0 right-0 z-30 pt-14 px-6">
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </View>

        {/* Background Animation */}
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
          className="absolute inset-0 z-0"
        >
          <LinearGradient
            colors={[ '#000000', '#1f1f1f', '#f43f5e' ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </MotiView>

        {/* Plans List */}
        <ScrollView
          contentContainerStyle={{ paddingTop: 200, paddingBottom: 40 }}
          className="flex-1"
        >
          <View className="px-6 space-y-10 flex flex-col gap-[50px]">
            {/* Free Plan */}
            <MotiView
              from={{ opacity: 0, translateX: -50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 400 }}
            >
              <TouchableOpacity
                style={planButtonStyle(selectedPlan === 'free')}
                className="relative rounded-3xl p-6"
                onPress={() => setSelectedPlan('free')}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white text-2xl font-sans mb-1">Gratuito</Text>
                    <Text className="text-white/60 text-base">Para começar</Text>
                  </View>
                  <Text className="text-white text-2xl font-sans">R$ 0</Text>
                </View>
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-white/40 mr-3" />
                    <Text className="text-white/80 text-base">Acesso limitado</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-white/40 mr-3" />
                    <Text className="text-white/80 text-base">3 usos por dia</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-white/40 mr-3" />
                    <Text className="text-white/80 text-base">Suporte básico</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>

            {/* Premium Plan */}
            <MotiView
              from={{ opacity: 0, translateX: 50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 600 }}
            >
              <TouchableOpacity
                style={planButtonStyle(selectedPlan === 'premium', true)}
                className="relative rounded-3xl p-6"
                onPress={() => setSelectedPlan('premium')}
              >
                <View className="absolute -top-3 left-6 bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">RECOMENDADO</Text>
                </View>
                
                <View className="flex-row items-center justify-between mb-4 mt-2">
                  <View>
                    <Text className="text-white text-2xl font-sans mb-1">Premium</Text>
                    <Text className="text-white/60 text-base">Experiência completa</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white text-2xl font-sans">R$ 9,90</Text>
                    <Text className="text-white/60 text-sm">/mês</Text>
                  </View>
                </View>
                <View className="space-y-3">
                  {['Uso ilimitado','Suporte prioritário','Recursos exclusivos','Sem anúncios'].map((feat, i) => (
                    <View key={i} className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#f43f5e" className="mr-3" />
                      <Text className="text-white text-base ml-2">{feat}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </MotiView>
          </View>
        </ScrollView>

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 800 }}
            className="absolute self-center bottom-[6%]"
          >
            <TouchableOpacity
              onPress={onFinish}
              disabled={!selectedPlan}
              className="bg-[#ff7a7f] rounded-xl h-[50px] w-[250px] items-center justify-center flex-row"
            >
              <Text className="text-white font-sans font-medium text-xl px-3">
                Continuar
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </MotiView>
      </View>
    </Modal>
  );
}
