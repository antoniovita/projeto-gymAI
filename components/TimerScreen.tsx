import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Vibration,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface TimerScreenProps {}

const TimerScreen: React.FC<TimerScreenProps> = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular total de segundos quando os valores mudam
  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    if (!isRunning) {
      setRemainingTime(total);
    }
  }, [hours, minutes, seconds, isRunning]);

  // Timer principal
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
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingTime]);

  // Animação do progresso
  useEffect(() => {
    if (totalSeconds > 0) {
      const progress = (totalSeconds - remainingTime) / totalSeconds;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingTime, totalSeconds]);

  // Animação de pulso quando timer está ativo
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
  }, [isRunning, isPaused]);

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

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(totalSeconds);
    progressAnim.setValue(0);
  };

  const CircularProgress = () => {
    const radius = 120;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    
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
          <Animated.View>
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="#ff7a7f"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
            />
          </Animated.View>
        </Svg>
      </View>
    );
  };

  const EmptyState = () => {
    return (
      <View className="flex-1 justify-center items-center px-8 pb-20">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
            <Ionicons name="timer-outline" size={60} color="gray" />
          </View>
          <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
            Configure seu timer
          </Text>
          <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
            Defina horas, minutos e segundos para começar
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-6 mt-[40px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Timer</Text>
        <View className='flex flex-row gap-4 items-center'>
          {isRunning && (
            <View className={`${isPaused ? 'border-zinc-400' : 'border-[#ff7a7f]'} flex flex-row items-center gap-4 border rounded-lg px-2 py-1.5`}>
              <Text className="text-[15px] font-sans text-white">
                {isPaused ? 'Pausado' : 'Ativo'}
              </Text>
            </View>
          )}
          <Pressable onPress={resetTimer}>
            <Ionicons name="refresh" size={22} color="#ff7a7f" />
          </Pressable>
        </View>
      </View>

      {!isRunning ? (
        // Timer Setup View
        <View className="flex-1">
          {totalSeconds === 0 ? (
            <EmptyState />
          ) : null}
          
          {/* Time Display Card */}
          <View className="px-6 mb-6">
            <Pressable className="flex-row items-center justify-between px-4 py-4 rounded-2xl bg-[#35353a]">
              <View className="flex-row items-center gap-3">
                <View
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(255, 122, 127, 0.15)'
                  }}
                >
                  <Ionicons name="time-outline" size={16} color="#ff7a7f" />
                </View>
                <View className="flex-col">
                  <Text className="text-zinc-400 font-sans text-xs mb-1">Tempo configurado</Text>
                  <Text className="text-white font-sans text-lg font-semibold">
                    {totalSeconds > 0 ? formatTime(totalSeconds) : '00:00'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="px-2 py-1 rounded-lg border border-zinc-400/60">
                  <Text className="text-zinc-400 font-sans text-xs font-medium">
                    {totalSeconds > 0 ? 'Pronto' : 'Configure'}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
          
          {/* Time Pickers */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-center bg-[#35353a] rounded-2xl overflow-hidden py-4">
              {/* Hours */}
              <View className="items-center px-4 flex-1">
                <Text className="text-zinc-400 text-sm mb-2 font-sans">horas</Text>
                <Picker
                  selectedValue={hours}
                  onValueChange={setHours}
                  style={{ width: '100%', height: 150 }}
                  itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'System' }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>

              {/* Minutes */}
              <View className="items-center px-4 flex-1">
                <Text className="text-zinc-400 text-sm mb-2 font-sans">min</Text>
                <Picker
                  selectedValue={minutes}
                  onValueChange={setMinutes}
                  style={{ width: '100%', height: 150 }}
                  itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'System' }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>

              {/* Seconds */}
              <View className="items-center px-4 flex-1">
                <Text className="text-zinc-400 text-sm mb-2 font-sans">seg</Text>
                <Picker
                  selectedValue={seconds}
                  onValueChange={setSeconds}
                  style={{ width: '100%', height: 150 }}
                  itemStyle={{ color: 'white', fontSize: 20, fontFamily: 'System' }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Quick Time Buttons */}
          <View className="px-6 mb-8">
            <Text className="text-zinc-400 text-sm font-sans mb-3">Tempos rápidos</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: '1 min', time: 60 },
                { label: '3 min', time: 180 },
                { label: '5 min', time: 300 },
                { label: '10 min', time: 600 },
                { label: '15 min', time: 900 },
                { label: '30 min', time: 1800 },
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
        </View>
      ) : (
        // Running Timer View
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
                {Math.round(((totalSeconds - remainingTime) / totalSeconds) * 100)}% concluído
              </Text>
            </View>
            <Text className="text-zinc-500 text-xs font-sans">
              Tempo total: {formatTime(totalSeconds)}
            </Text>
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

            {/* Add Time Button */}
            <Pressable
              onPress={() => setRemainingTime(prev => prev + 60)}
              className="w-14 h-14 rounded-full bg-zinc-700 items-center justify-center"
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Start Button - Only show when not running */}
      {!isRunning && (
        <Pressable
          onPress={startTimer}
          disabled={totalSeconds === 0}
          className={`w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full items-center justify-center shadow-lg ${
            totalSeconds > 0 ? 'bg-[#ff7a7f]' : 'bg-zinc-700'
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons 
            name="play" 
            size={24} 
            color={totalSeconds > 0 ? 'white' : 'gray'} 
          />
        </Pressable>
      )}
    </SafeAreaView>
  );
};

export default TimerScreen;