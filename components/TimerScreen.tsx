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
  Alert,
  StyleSheet,
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
      <View style={styles.emptyState}>
        <View style={styles.emptyStateContent}>
          <Ionicons style={{ marginBottom: 12 }} name='timer-outline' size={50} color='#a1a1aa' />
          <Text style={styles.emptyStateTitle}>
            Nenhum timer personalizado
          </Text>
          <Text style={styles.emptyStateSubtitle}>
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

  // Corrigido: Evitar loops infinitos
  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    if (!isRunning) {
      setRemainingTime(total);
    }
  }, [hours, minutes, seconds]); // Removido isRunning da dependência

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

  // Corrigido: Animação de progresso
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

  // Corrigido: Animação de pulso
  useEffect(() => {
    let pulseAnimation: any;
    
    if (isRunning && !isPaused) {
      const pulse = () => {
        pulseAnimation = Animated.sequence([
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
        ]);
        
        pulseAnimation.start(() => {
          if (isRunning && !isPaused) pulse();
        });
      };
      pulse();
    } else {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
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

  const startTimerFromCustom = (timer: CustomTimer) => {
    const hrs = Math.floor(timer.seconds / 3600);
    const mins = Math.floor((timer.seconds % 3600) / 60);
    const secs = timer.seconds % 60;
    
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    
    // Usar requestAnimationFrame em vez de setTimeout
    requestAnimationFrame(() => {
      setIsRunning(true);
      setIsPaused(false);
    });
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
    Alert.alert(
      "Excluir Timer",
      "Tem certeza que deseja excluir este timer personalizado?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCustomTimer(id);
            } catch (error) {
              console.log("Erro detectado: ", error);
            }
          }
        }
      ]
    );
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
      <View style={styles.swipeActionContainer}>
        <TouchableOpacity
          onPress={() => {
            closeSwipeable();
            onDelete(item.id);
          }}
          style={styles.deleteButton}
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
          <View style={styles.timerItem}>
            <Pressable
              onPress={() => onSelect(item)}
              style={styles.timerItemContent}
            >
              <View style={styles.timerItemInfo}>
                <Text style={styles.timerItemName}>
                  {item.name}
                </Text>
                <Text style={styles.timerItemTime}>
                  {formatTime(item.seconds)}
                </Text>
              </View>
            </Pressable>
            
            <Pressable
              onPress={() => onStartTimer(item)}
              style={styles.playButton}
            >
              <Ionicons name="play" size={18} color="#ff7a7f" />
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
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#35353a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
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

  const quickTimePresets = [
    { label: '1 min', time: 60 },
    { label: '3 min', time: 180 },
    { label: '5 min', time: 300 },
    { label: '10 min', time: 600 },
    { label: '15 min', time: 900 },
    { label: '30 min', time: 1800 },
    { label: '45 min', time: 2700 },
    { label: '1 hora', time: 3600 },
  ];

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && { paddingVertical: 30 }]}>
      {!isRunning ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Temporizador</Text>
            </View>
          </View>

          {/* Timer Setup View */}
          <View style={styles.timerSetup}>
            {/* Time Pickers */}
            <View style={styles.pickersContainer}>
              <View style={styles.pickersWrapper}>
                <View style={styles.pickerRow}>
                  {/* Hours */}
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={hours}
                      onValueChange={setHours}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Picker.Item
                          key={i}
                          label={i === 0 ? '0 horas' : i === 1 ? '1 hora' : `${i} horas`}
                          value={i}
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Minutes */}
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={minutes}
                      onValueChange={setMinutes}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item
                          key={i}
                          label={i === 0 ? '0 min' : i === 1 ? '1 min' : `${i} min`}
                          value={i}
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Seconds */}
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={seconds}
                      onValueChange={setSeconds}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item
                          key={i}
                          label={i === 0 ? '0 seg' : i === 1 ? '1 seg' : `${i} seg`}
                          value={i}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Time Buttons */}
            <View style={styles.quickTimesContainer}>
              <View style={styles.quickTimesContent}>
                <Text style={styles.quickTimesTitle}>Tempos rápidos</Text>
                <View style={styles.quickTimesButtons}>
                  {quickTimePresets.map((preset) => (
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
                      style={styles.quickTimeButton}
                    >
                      <Text style={styles.quickTimeButtonText}>{preset.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={startTimer}
                disabled={totalSeconds === 0}
                style={[
                  styles.startButton,
                  totalSeconds > 0 ? styles.startButtonActive : styles.startButtonInactive
                ]}
              >
                <Text style={[
                  styles.startButtonText,
                  totalSeconds > 0 ? styles.startButtonTextActive : styles.startButtonTextInactive
                ]}>
                  Iniciar
                </Text>
              </Pressable>
            </View>

            {/* Seção de Timers Personalizados */}
            <View style={styles.customTimersSection}>
              <View style={styles.customTimersHeader}>
                <Text style={styles.customTimersTitle}>Tempos personalizados</Text>
                <Pressable onPress={handleOpenCreate}>
                  <Feather name='plus' color="#a1a1aa" size={18} />
                </Pressable>
              </View>

              {customTimer.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <View style={{ width: '100%', marginTop: 20 }} />
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
          {/* Running Timer View */}
          <View style={styles.runningTimerContainer}>
            {/* Circular Progress */}
            <View style={styles.circularProgressContainer}>
              <CircularProgress />
              <Animated.View
                style={[
                  styles.timerDisplay,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Text style={styles.remainingTimeText}>
                  {formatTime(remainingTime)}
                </Text>
                <Text style={styles.timerStatusText}>
                  {isPaused ? 'Pausado' : 'Em andamento'}
                </Text>
              </Animated.View>
            </View>

            {/* Progress Info */}
            <View style={styles.progressInfo}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {totalSeconds > 0 ? Math.round(((totalSeconds - remainingTime) / totalSeconds) * 100) : 0}% concluído
                </Text>
              </View>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlButtons}>
              <Pressable onPress={resetTimer} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>Parar</Text>
              </Pressable>

              <Pressable onPress={pauseTimer} style={styles.pauseButton}>
                <Text style={styles.pauseButtonText}>
                  {isPaused ? "Retomar" : "Pausar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRemainingTime(prev => prev + 60)}
                style={styles.controlButton}
              >
                <Text style={styles.controlButtonText}>+1min</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27272a',
  },
  header: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: 'white',
    fontSize: 16,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  timerSetup: {
    flex: 1,
  },
  pickersContainer: {
    paddingHorizontal: 16,
  },
  pickersWrapper: {
    marginBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
  },
  pickerContainer: {
    alignItems: 'center',
    flex: 1,
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  quickTimesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    flexDirection: 'row',
  },
  quickTimesContent: {
    flex: 1,
  },
  quickTimesTitle: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 16,
  },
  quickTimesButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: 290,
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#3f3f46',
  },
  quickTimeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  startButton: {
    width: 65,
    height: 65,
    marginTop: 32,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonActive: {
    backgroundColor: 'rgba(255, 122, 127, 0.15)',
  },
  startButtonInactive: {
    backgroundColor: 'rgba(161, 161, 170, 0.1)',
  },
  startButtonText: {
    fontSize: 14,
  },
  startButtonTextActive: {
    color: '#ff7a7f',
  },
  startButtonTextInactive: {
    color: '#71717a',
  },
  customTimersSection: {
    flex: 1,
  },
  customTimersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  customTimersTitle: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 72,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: '#a1a1aa',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  swipeActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: 80,
    height: '100%',
    paddingLeft: 20,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f43f5e',
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
  },
  timerItem: {
    backgroundColor: '#2d2d32',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 90,
  },
  timerItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  timerItemInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  timerItemName: {
    fontSize: 20,
    fontWeight: '500',
    maxWidth: 250,
    color: 'white',
  },
  timerItemTime: {
    color: '#d4d4d8',
    fontSize: 14,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255, 122, 127, 0.15)',
  },
  runningTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  circularProgressContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  timerDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingTimeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '300',
  },
  timerStatusText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 8,
  },
  progressInfo: {
    marginBottom: 32,
    alignItems: 'center',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(161, 161, 170, 0.6)',
    marginBottom: 8,
  },
  progressText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63, 63, 70, 0.3)',
  },
  controlButtonText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  pauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 122, 127, 0.15)',
  },
  pauseButtonText: {
    color: '#ff7a7f',
    fontSize: 14,
  },
});

export default TimerScreen;