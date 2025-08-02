import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.5;

interface TimerModalProps {
  isVisible: boolean;
  onClose: () => void;
  secondsCreate: number;
  customTimerName: string;
  setCustomTimerName: (name: string) => void;
  setSecondsCreate: (seconds: number) => void;
  onSaveGoal: (name: string, seconds: number) => Promise<void>;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isVisible,
  onClose,
  secondsCreate,
  customTimerName,
  setCustomTimerName,
  setSecondsCreate,
  onSaveGoal,
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Converter segundos totais para horas, minutos e segundos
  useEffect(() => {
    const hrs = Math.floor(secondsCreate / 3600);
    const mins = Math.floor((secondsCreate % 3600) / 60);
    const secs = secondsCreate % 60;
    
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
  }, [secondsCreate]);

  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setSecondsCreate(total);
  }, [hours, minutes, seconds, setSecondsCreate]);

  const openDrawer = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: DRAWER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      translateY.setValue(DRAWER_HEIGHT);
      openDrawer();
    } else {
      translateY.setValue(DRAWER_HEIGHT);
      backdropOpacity.setValue(0);
    }
  }, [isVisible]);

  const formatTimeForName = (time: number) => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = time % 60;
    
    if (hrs > 0 && mins > 0) {
      return `${hrs}h ${mins}min`;
    } else if (hrs > 0) {
      return `${hrs}h`;
    } else if (mins > 0) {
      return `${mins} min`;
    } else {
      return `${secs} seg`;
    }
  };

  const handleSave = async () => {
    if (secondsCreate <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const finalName = customTimerName.trim() || formatTimeForName(secondsCreate);
      await onSaveGoal(finalName, secondsCreate);
      closeDrawer();
    } catch (error) {
      console.error('Erro ao salvar timer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = secondsCreate > 0;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'black',
                opacity: backdropOpacity,
              }}
            />
          </TouchableWithoutFeedback>

          {/* Drawer */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: DRAWER_HEIGHT,
              backgroundColor: '#27272a',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              transform: [{ translateY }],
            }}
          >

            {/* Content */}
            <View className="flex-1 px-6 pt-7">
              {/* Nome do Timer (Opcional) */}
              <View className="mb-6">
                <TextInput
                  value={customTimerName}
                  onChangeText={setCustomTimerName}
                  placeholder={`Nome do Timer (opcional)`}
                  placeholderTextColor="#71717a"
                  className="bg-zinc-800 text-white py-3 px-3 rounded-xl font-sans text-lg"
                  maxLength={50}
                />
              </View>

              {/* Time Pickers */}
              <View className="mb-6">
                <View className="flex-row bg-zinc-800 rounded-xl overflow-hidden">
                  {/* Hours */}
                  <View className="flex-1 items-center">
                    <Text className="text-zinc-400 text-xs py-2 font-sans">Horas</Text>
                    <Picker
                      selectedValue={hours}
                      onValueChange={setHours}
                      style={{ width: '100%', height: 180 }}
                      itemStyle={{ 
                        color: 'white', 
                        fontSize: 18, 
                        fontFamily: 'System',
                        height: 180 
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Picker.Item 
                          key={i} 
                          label={i.toString().padStart(2, '0')} 
                          value={i} 
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Minutes */}
                  <View className="flex-1 items-center border-l border-r border-zinc-700">
                    <Text className="text-zinc-400 text-xs py-2 font-sans">Minutos</Text>
                    <Picker
                      selectedValue={minutes}
                      onValueChange={setMinutes}
                      style={{ width: '100%', height: 180 }}
                      itemStyle={{ 
                        color: 'white', 
                        fontSize: 18, 
                        fontFamily: 'System',
                        height: 180 
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item 
                          key={i} 
                          label={i.toString().padStart(2, '0')} 
                          value={i} 
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Seconds */}
                  <View className="flex-1 items-center">
                    <Text className="text-zinc-400 text-xs py-2 font-sans">Segundos</Text>
                    <Picker
                      selectedValue={seconds}
                      onValueChange={setSeconds}
                      style={{ width: '100%', height: 180 }}
                      itemStyle={{ 
                        color: 'white', 
                        fontSize: 18, 
                        fontFamily: 'System',
                        height: 180 
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item 
                          key={i} 
                          label={i.toString().padStart(2, '0')} 
                          value={i} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="px-6 pb-8 pt-4">
              <Pressable
                onPress={handleSave}
                disabled={!isFormValid || isLoading}
                className={`py-4 rounded-xl mb-4 items-center justify-center ${
                  isFormValid && !isLoading
                    ? 'bg-rose-400'
                    : 'bg-zinc-700'
                }`}
              >
                {isLoading ? (
                  <Text className="text-zinc-400 font-sans font-semibold text-base">
                    Salvando...
                  </Text>
                ) : (
                  <Text 
                    className={`font-sans font-semibold text-base ${
                      isFormValid ? 'text-black' : 'text-zinc-400'
                    }`}
                  >
                    Salvar Timer
                  </Text>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TimerModal;