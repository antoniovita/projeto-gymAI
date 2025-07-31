import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  Vibration,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { GestureHandlerRootView, Swipeable, TouchableOpacity } from 'react-native-gesture-handler';
import { useTimerHook } from 'hooks/useTimerHook';
import { CustomTimer } from "hooks/useTimerHook";
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import TimerModal from './comps/TimerModal';

interface TimerScreenProps {}

const TimerScreen: React.FC<TimerScreenProps> = () => {
  const navigation = useNavigation();
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  const EmptyState = () => {
    return (
      <View className="flex-1 justify-center items-center px-8 pb-18">
        <View className="items-center">
          {/* Ícone de Timer */}
          {/* Texto principal */}
          <Text className="text-white text-xl font-sans mb-2 text-center">
            Nenhum timer personalizado
          </Text>
          {/* Texto descritivo */}
          <Text className="text-zinc-400 text-sm font-sans mb-4 text-center leading-6" style={{ maxWidth: 280 }}>
            Crie seus próprios timers personalizados para facilitar o uso no dia a dia
          </Text>
        </View>
      </View>
    );
  };

  const { customTimer, createCustomTimer, removeCustomTimer } = useTimerHook();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customTimerName, setCustomTimerName] = useState("");
  const [secondsCreate, setSecondsCreate] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    if (!isRunning) {
      setRemainingTime(total);
    }
  }, [hours, minutes, seconds, isRunning]);

  useEffect(() => {
    if (isRunning && !isPaused && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // Timer acabou
            setIsRunning(false);
            setIsPaused(false);
            Vibration.vibrate([0, 500, 200, 500]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, remainingTime]);

  useEffect(() => {
    if (totalSeconds > 0) {
      const progress = (totalSeconds - remainingTime) / totalSeconds;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingTime, totalSeconds, progressAnim]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRunning && !isPaused) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, isPaused, pulseAnim]);

  const formatTime = (time: number) => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = time % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (totalSeconds > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const startTimerFromCustom = (timer: CustomTimer) => {
    const hrs = Math.floor(timer.seconds / 3600);
    const mins = Math.floor((timer.seconds % 3600) / 60);
    const secs = timer.seconds % 60;

    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);

    // Aguarda um pouco para os states serem atualizados
    setTimeout(() => {
      setIsRunning(true);
      setIsPaused(false);
    }, 100);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(totalSeconds);
    progressAnim.setValue(0);
  };

  const handleOpenCreate = () => {
    setCustomTimerName('');
    setSecondsCreate(0);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setCustomTimerName('');
    setSecondsCreate(0);
    setIsModalVisible(false);
  };

  const handleSaveTimer = async (name: string, seconds: number) => {
    const id = uuid.v4() as string;
    try {
      await createCustomTimer(id, name, seconds);
      handleCloseModal();
    } catch (error) {
      console.log("Erro detectado: ", error);
    }
  };

  const handleDeleteTimer = async (id: string) => {
    try {
      await removeCustomTimer(id);
    } catch (error) {
      console.log("Erro detectado: ", error);
    }
  };

  const handleSelectCustomTimer = (timer: CustomTimer) => {
    const hrs = Math.floor(timer.seconds / 3600);
    const mins = Math.floor((timer.seconds % 3600) / 60);
    const secs = timer.seconds % 60;

    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
  };

  const SwipeableTimerItem = ({
    item,
    onDelete,
    onSelect,
    onStartTimer
  }: {
    item: CustomTimer;
    onDelete: (taskId: string) => void;
    onSelect: (timer: CustomTimer) => void;
    onStartTimer: (timer: CustomTimer) => void;
  }) => {
    let swipeableRow: any;

    const closeSwipeable = () => {
      swipeableRow?.close();
    };

    const renderLeftActions = () => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          width: 80,
          height: '100%',
          paddingRight: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            closeSwipeable();
            onDelete(item.id);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#dc2626',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );

    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={(ref: any) => { swipeableRow = ref; }}
          renderLeftActions={renderLeftActions}
          leftThreshold={40}
          friction={1}
          overshootLeft={false}
        >
          <View className="bg-[#3f3f46] mx-5 mb-3 rounded-2xl flex flex-row items-center px-6 h-[90px]">
            <Pressable
              onPress={() => onSelect(item)}
              className="flex-1 flex flex-row justify-between items-center py-4"
            >
              <View className="flex flex-col gap-1">
                <Text className="text-xl font-sans font-medium max-w-[250px] text-white">
                  {item.name}
                </Text>
                <Text className="text-zinc-300 mt-2 text-sm font-sans">
                  {formatTime(item.seconds)}
                </Text>
              </View>
            </Pressable>
            {/* Botão Play - Separado */}
            <Pressable
              onPress={() => onStartTimer(item)}
              className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center ml-2"
            >
              <Ionicons name="play" size={15} color="white" />
            </Pressable>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const CircularProgress = () => {
    const radius = 120;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const progress = totalSeconds > 0 ? (totalSeconds - remainingTime) / totalSeconds : 0;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
      <View style={{ width: radius * 2 + strokeWidth * 2, height: radius * 2 + strokeWidth * 2 }}>
        <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
          {/* Background circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#35353a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#ff7a7f"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
          />
        </Svg>
      </View>
    );
  };

  const renderCustomTimerItem = ({ item }: { item: CustomTimer }) => (
    <SwipeableTimerItem
      item={item}
      onDelete={handleDeleteTimer}
      onSelect={handleSelectCustomTimer}
      onStartTimer={startTimerFromCustom}
    />
  );

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      {!isRunning ? (
        <>
          {/* Header */}
          <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
            <Pressable onPress={handleGoBack} className="flex-row items-center">
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text className="ml-1 text-white font-sans text-[16px]">Voltar</Text>
            </Pressable>
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-white font-sans text-[18px] font-medium">Timer Pomodoro</Text>
            </View>
            <View className="flex-row items-center gap-4 mr-1">
              {/* Placeholder para manter simetria */}
              <View style={{ width: 22, height: 22 }} />
            </View>
          </View>

          {/* Timer Setup View */}
          <View className="flex-1">
            {/* Time Pickers */}
            <View className="px-6 mb-6">
              <View className="flex-row items-center justify-center rounded-2xl overflow-hidden py-4">
                {/* Hours */}
                <View className="items-center px-4 flex-1">
                  <Text className="text-zinc-400 text-sm mb-2 font-sans">Horas</Text>
                  <Picker
                    selectedValue={hours}
                    onValueChange={setHours}
                    style={{ width: '100%', height: 200 }}
                    itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'Poppins' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                    ))}
                  </Picker>
                </View>

                {/* Divisor vertical */}
                <View className="w-[1px] bg-zinc-700 h-64" />

                {/* Minutes */}
                <View className="items-center px-4 flex-1">
                  <Text className="text-zinc-400 text-sm mb-2 font-sans">Minutos</Text>
                  <Picker
                    selectedValue={minutes}
                    onValueChange={setMinutes}
                    style={{ width: '100%', height: 200 }}
                    itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'Poppins' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                    ))}
                  </Picker>
                </View>

                {/* Divisor vertical */}
                <View className="w-[1px] bg-zinc-700 h-64" />

                {/* Seconds */}
                <View className="items-center px-4 flex-1">
                  <Text className="text-zinc-400 text-sm mb-2 font-sans">Segundos</Text>
                  <Picker
                    selectedValue={seconds}
                    onValueChange={setSeconds}
                    style={{ width: '100%', height: 200 }}
                    itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'Poppins' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Quick Time Buttons */}
            <View className="px-6 mb-8 flex flex-row gap-1">
              <View className='flex flex-col'>
                <Text className="text-zinc-400 text-sm font-sans mb-4">Tempos rápidos</Text>
                <View className="flex-row flex-wrap gap-2 max-w-[290px]">
                  {[
                    { label: '1 min', time: 60 },
                    { label: '3 min', time: 180 },
                    { label: '5 min', time: 300 },
                    { label: '10 min', time: 600 },
                    { label: '15 min', time: 900 },
                    { label: '30 min', time: 1800 },
                    { label: '45 min', time: 2700 },
                    { label: '1 hora', time: 3600 },
                  ].map((preset) => (
                    <Pressable
                      key={preset.label}
                      onPress={() => {
                        const hrs = Math.floor(preset.time / 3600);
                        const mins = Math.floor((preset.time % 3600) / 60);
                        const secs = preset.time % 60;
                        setHours(hrs);
                        setMinutes(mins);
                        setSeconds(secs);
                      }}
                      className="px-3 py-1 rounded-xl bg-zinc-700"
                    >
                      <Text className="text-white text-sm font-sans">{preset.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pressable
                onPress={startTimer}
                disabled={totalSeconds === 0}
                className={`w-[65px] h-[65px] mt-8 rounded-full items-center justify-center ${
                  totalSeconds > 0 ? 'bg-rose-400' : 'bg-zinc-700'
                }`}
              >
                <Text className={`font-sans  text-md ${
                  totalSeconds > 0 ? 'text-black' : 'text-white'}`}> Iniciar 
                </Text>
              </Pressable>
            </View>

            {/* Seção de Timers Personalizados */}
            <View className="flex-1">
            <Text className="text-zinc-400 px-7 text-sm font-sans">Tempos personalizados</Text>

              {customTimer.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <View className="w-full mt-4">
                  </View>
                  <FlatList
                    data={customTimer}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCustomTimerItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                  />
                </>
              )}
            </View>

            {/* Botão de adicionar */}
            <Pressable
              onPress={handleOpenCreate}
              className="w-[50px] h-[50px] absolute bottom-[2%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
            >
              <Feather name="plus" size={32} color="black" />
            </Pressable>

            <TimerModal
              isVisible={isModalVisible}
              onClose={handleCloseModal}
              secondsCreate={secondsCreate}
              customTimerName={customTimerName}
              setCustomTimerName={setCustomTimerName}
              setSecondsCreate={setSecondsCreate}
              onSaveGoal={handleSaveTimer}
            />
          </View>
        </>
      ) : (
        <>
          {/* Header para timer em execução */}
          <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
            <Pressable onPress={resetTimer} className="flex-row items-center">
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text className="ml-1 text-white font-sans text-[16px]">Voltar</Text>
            </Pressable>
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-white font-sans text-[18px] font-medium">Timer Ativo</Text>
            </View>
            <View className="flex-row items-center gap-4 mr-1">
              {/* Placeholder para manter simetria */}
              <View style={{ width: 22, height: 22 }} />
            </View>
          </View>

          {/* Running Timer View */}
          <View className="flex-1 justify-center items-center px-6">
            {/* Circular Progress */}
            <View className="relative mb-8">
              <CircularProgress />
              <Animated.View
                className="absolute inset-0 justify-center items-center"
                style={{ transform: [{ scale: pulseAnim }] }}
              >
                <Text className="text-white text-4xl font-light font-sans">
                  {formatTime(remainingTime)}
                </Text>
                <Text className="text-zinc-400 text-sm mt-2 font-sans">
                  {isPaused ? 'Pausado' : 'Em andamento'}
                </Text>
              </Animated.View>
            </View>

            {/* Progress Info */}
            <View className="mb-8 items-center">
              <View className="px-3 py-1 rounded-lg border border-zinc-400/60 mb-2">
                <Text className="text-zinc-400 font-sans text-xs font-medium">
                  {totalSeconds > 0 ? Math.round(((totalSeconds - remainingTime) / totalSeconds) * 100) : 0}% concluído
                </Text>
              </View>
            </View>

            {/* Control Buttons */}
            <View className="flex-row items-center justify-center gap-6">
              {/* Reset Button */}
              <Pressable
                onPress={resetTimer}
                className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center"
              >
                <Ionicons name="stop" size={20} color="white" />
              </Pressable>

              {/* Play/Pause Button */}
              <Pressable
                onPress={pauseTimer}
                className="w-16 h-16 rounded-full bg-[#ff7a7f] items-center justify-center"
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={24}
                  color="white"
                />
              </Pressable>

              <Pressable
                onPress={() => setRemainingTime(prev => prev + 60)}
                className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default TimerScreen;