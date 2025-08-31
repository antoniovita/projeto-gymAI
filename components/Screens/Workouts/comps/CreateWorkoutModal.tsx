import React, { useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { Exercise, Workout } from '../../../../api/model/Workout';
import { useStats } from 'hooks/useStats';

const { height: screenHeight } = Dimensions.get('window');

interface CreateWorkoutModalProps {
  isCreateVisible: boolean;
  setIsCreateVisible: (visible: boolean) => void;
  selectedWorkout: Workout | null;
  newWorkoutTitle: string;
  setNewWorkoutTitle: (title: string) => void;
  selectedMusclesForWorkout: string[];
  setSelectedMusclesForWorkout: React.Dispatch<React.SetStateAction<string[]>>;
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: string[];
  getCategoryColor: (catName: string) => string;
  handleSaveWorkout: () => Promise<void>;
  newExerciseName: string;
  setNewExerciseName: (name: string) => void;
  newExerciseReps: string;
  setNewExerciseReps: (reps: string) => void;
  newExerciseSeries: string;
  setNewExerciseSeries: (series: string) => void;
  userId: string,
}

const WeightSlider: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
}> = ({ value, onValueChange }) => {

  const generateWeightOptions = () => {
    const options = [];

    for (let i = 0; i <= 250; i += 2.5) {
      options.push(i.toString());
    }
    return options;
  };

  const weightOptions = generateWeightOptions();
  const currentIndex = weightOptions.findIndex(w => w === value) || 0;

  const renderWeightItem = ({ item, index }: { item: string, index: number }) => {
    const isSelected = item === value;
    
    return (
      <Pressable
        onPress={() => onValueChange(item)}
        className={`mx-1 px-3 py-2 rounded-lg min-w-[50px] items-center ${
          isSelected ? 'bg-rose-400' : 'bg-zinc-700/20'
        }`}
      >
        <Text className={`font-sans text-base ${
          isSelected ? 'text-black font-semibold' : 'text-white'
        }`}>
          {item}
        </Text>
        <Text className={`font-sans text-xs mt-0.5 ${
          isSelected ? 'text-black/70' : 'text-zinc-400'
        }`}>
          kg
        </Text>
      </Pressable>
    );
  };

  return (
    <View>
      <FlatList
        data={weightOptions}
        renderItem={renderWeightItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        initialScrollIndex={currentIndex > 0 ? Math.max(0, currentIndex - 2) : 0}
        getItemLayout={(data, index) => ({
          length: 58,
          offset: 58 * index,
          index,
        })}
        onScrollToIndexFailed={() => {}}
        style={{ flexGrow: 0 }}
      />
    </View>
  );
};

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({
  isCreateVisible,
  setIsCreateVisible,
  newWorkoutTitle,
  setNewWorkoutTitle,
  selectedMusclesForWorkout,
  setSelectedMusclesForWorkout,
  exercises,
  setExercises,
  categories,
  getCategoryColor,
  handleSaveWorkout,
  newExerciseName,
  setNewExerciseName,
  newExerciseReps,
  setNewExerciseReps,
  newExerciseSeries,
  setNewExerciseSeries,
  userId
}) => {
  const [isVisibleExerciseModal, setIsVisibleExerciseModal] = React.useState(false);
  const [newExerciseLoad, setNewExerciseLoad] = React.useState('');

  const {addExperience} = useStats()
  

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const toggleMuscleForWorkout = (muscle: string) => {
    setSelectedMusclesForWorkout((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  // Funções de animação para o modal de exercício
  const showExerciseModal = () => {
    setIsVisibleExerciseModal(true);
    
    // Fade in do fundo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Slide up da gavetinha
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const hideExerciseModal = () => {
    // Slide down da gavetinha
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade out do fundo
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleExerciseModal(false);
      // Reset form
      setNewExerciseName('');
      setNewExerciseReps('10');
      setNewExerciseSeries('3');
      setNewExerciseLoad('');
    });
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Erro', 'O nome do exercício não pode estar vazio.');
      return;
    }

    if (!newExerciseReps.trim() || !newExerciseSeries.trim() || !newExerciseLoad.trim()) {
      Alert.alert('Erro', 'Repetições, séries e carga são obrigatórios.');
      return;
    }

    const reps = parseInt(newExerciseReps);
    const series = parseInt(newExerciseSeries);
    const load = parseFloat(newExerciseLoad);

    if (isNaN(reps) || isNaN(series) || isNaN(load) || reps <= 0 || series <= 0 || load < 0) {
      Alert.alert('Erro', 'Repetições e séries devem ser números positivos e carga deve ser um número não negativo.');
      return;
    }

    const newExercise: Exercise = {
      name: newExerciseName.trim(),
      reps,
      series,
      load,
      completion: 0,
      xp_granted: 0,
    };

    setExercises(prev => [...prev, newExercise]);
    hideExerciseModal();
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const toggleExerciseCompletion = async (index: number) => {
    const exercise = exercises[index];
    const wasCompleted = exercise.completion === 1;
    const wasXpGranted = exercise.xp_granted === 1;

    try {
      if (!wasCompleted) {
        if (!wasXpGranted) {
          await addExperience(userId, 10);
          
          setExercises(prev => prev.map((ex, i) => 
            i === index 
              ? { ...ex, completion: 1, xp_granted: 1 }
              : ex
          ));
        } else {
          setExercises(prev => prev.map((ex, i) => 
            i === index 
              ? { ...ex, completion: 1 }
              : ex
          ));
        }
      } else {
        if (wasXpGranted) {
          await addExperience(userId, -10);
          
          setExercises(prev => prev.map((ex, i) => 
            i === index 
              ? { ...ex, completion: 0, xp_granted: 0 }
              : ex
          ));
        } else {
          setExercises(prev => prev.map((ex, i) => 
            i === index 
              ? { ...ex, completion: 0 }
              : ex
          ));
        }
      }
    } catch (error) {
      console.error('Erro ao processar XP do exercício:', error);
      setExercises(prev => prev.map((ex, i) => 
        i === index 
          ? { ...ex, completion: ex.completion === 0 ? 1 : 0 }
          : ex
      ));
    }
  };

  const renderLeftActionsExercise = (index: number) => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f43f5e',
        paddingHorizontal: 16,
        height: '100%',
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
          }}
          onPress={() => handleRemoveExercise(index)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isCreateVisible}
      onRequestClose={() => setIsCreateVisible(false)}
    >
      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>

        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4">
          <Pressable
            className="items-center flex flex-row"
            onPress={() => setIsCreateVisible(false)}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans"> Voltar</Text>
          </Pressable>

          <Pressable onPress={handleSaveWorkout}>
            <Text className="text-rose-400 font-sans text-lg font-semibold mr-4">Salvar</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          {/* Título do Treino */}
          <View className="mt-6 mb-6">
            <TextInput
              placeholder="Nome do treino"
              placeholderTextColor="#71717a"
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              className="text-white text-2xl px-6 font-sans py-3"
              multiline
            />
          </View>

          {/* Grupos Musculares */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm px-6 font-medium mb-3 uppercase tracking-wide">
              Grupos Musculares
            </Text>
            
            <View className="flex flex-row flex-wrap gap-2 px-6">
              {categories.map((muscle) => {
                const isSelected = selectedMusclesForWorkout.includes(muscle);
                const color = getCategoryColor(muscle);
                return (
                  <Pressable
                    key={muscle}
                    onPress={() => toggleMuscleForWorkout(muscle)}
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                    isSelected ? 'bg-rose-400' : 'bg-zinc-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff' }} />
                    <Text className={`font-sans ${isSelected ? 'text-black' : 'text-white'}`}>
                      {muscle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Exercícios */}
          <View className="mb-8">
            <View className='flex-row justify-between items-center'>
              <Text className="text-zinc-400 text-sm px-6 font-medium uppercase tracking-wide">
                Exercícios ({exercises.length})
              </Text>

              <Pressable className='px-6' onPress={showExerciseModal}>
                <Feather name='plus' size={18} color='#a1a1aa' />
              </Pressable>

              {/* Modal de Exercício */}
              <Modal
                visible={isVisibleExerciseModal}
                transparent
                animationType="none"
                onRequestClose={hideExerciseModal}
              >
                <Animated.View 
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'flex-end',
                    opacity: fadeAnim,
                  }}
                >
                  <Pressable 
                    style={{ flex: 1 }} 
                    onPress={hideExerciseModal}
                  />
                  
                  <View
                  >
                    <Animated.View 
                      style={{
                        backgroundColor: '#27272a',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      {/* Handle do modal */}

                      <View className="px-6 pt-9">

                        {/* Nome do exercício */}
                        <View className="mb-6">
                          <Text className="text-zinc-400 font-sans text-sm font-medium mb-2  uppercase tracking-wide">
                            Nome
                          </Text>
                          <View className="bg-zinc-700/15 rounded-xl">
                            <TextInput
                              placeholder="Supino reto"
                              placeholderTextColor="#71717a"
                              value={newExerciseName}
                              onChangeText={setNewExerciseName}
                              className="text-white font-sans text-lg px-4 py-4"
                            />
                          </View>
                        </View>

                        {/* Carga com Slider Horizontal */}
                        <View className="mb-6">
                          <Text className="text-zinc-400 font-sans text-sm font-medium mb-2 uppercase tracking-wide">
                            Carga - {newExerciseLoad || '0'} kg
                          </Text>
                          <View className="bg-zinc-700/10 rounded-xl py-3">
                            <WeightSlider
                              value={newExerciseLoad}
                              onValueChange={setNewExerciseLoad}
                            />
                          </View>
                        </View>

                        {/* Séries e Repetições */}
                        <View className="flex-row gap-4 mb-8">
                          <View className="flex-1">
                            <View className="bg-zinc-800 overflow-hidden">
                              <Picker
                                selectedValue={newExerciseSeries}
                                onValueChange={(itemValue) => setNewExerciseSeries(itemValue)}
                                style={{
                                  color: 'white',
                                  backgroundColor: 'transparent',
                                  height: Platform.OS === 'ios' ? 180 : 50,
                                }}
                                itemStyle={{
                                  color: 'white',
                                  fontSize: 16,
                                  fontWeight: '500',
                                }}
                              >
                                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                                  <Picker.Item 
                                    key={num} 
                                    label={`${num} série${num > 1 ? 's' : ''}`} 
                                    value={num.toString()} 
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>

                          <View className="flex-1">
                            <View className="bg-zinc-800 overflow-hidden">
                              <Picker
                                selectedValue={newExerciseReps}
                                onValueChange={(itemValue) => setNewExerciseReps(itemValue)}
                                style={{
                                  color: 'white',
                                  backgroundColor: 'transparent',
                                  height: Platform.OS === 'ios' ? 180 : 50,
                                }}
                                itemStyle={{
                                  color: 'white',
                                  fontSize: 16,
                                  fontWeight: '500',
                                }}
                              >
                                {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                                  <Picker.Item 
                                    key={num} 
                                    label={`${num} rep${num > 1 ? 's' : ''}`} 
                                    value={num.toString()} 
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        </View>

                        <Pressable
                          onPress={() => {
                            handleAddExercise();
                            hideExerciseModal();
                          }}
                          className="bg-rose-400 rounded-xl p-4 items-center mb-4"
                        >
                          <Text className="text-black font-sans font-semibold text-lg">
                            Adicionar Exercício
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={hideExerciseModal}
                          className="items-center py-2"
                        >
                          <Text className="text-zinc-400 font-sans">Cancelar</Text>
                        </Pressable>
                      </View>
                    </Animated.View>
                  </View>
                </Animated.View>
              </Modal>
            </View>

            <View className='mt-2'>
              <GestureHandlerRootView>
                {exercises.map((exercise, index) => (
                  <Swipeable
                    key={index}
                    renderLeftActions={() => renderLeftActionsExercise(index)}
                    leftThreshold={40}
                    rightThreshold={40}
                    overshootLeft={false}
                    overshootRight={false}
                    dragOffsetFromLeftEdge={80}
                    friction={1}
                  >
                    <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
                      <View className="flex flex-row justify-between">
                        <Pressable className="flex flex-col gap-1 mt-1 flex-1">
                          <View className="flex flex-row items-center gap-2">
                            <Text className={`text-xl font-sans font-medium max-w-[280px] ${
                              exercise.completion === 1 ? 'line-through text-neutral-500' : 'text-gray-300'
                            }`}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            >
                              {exercise.name}
                            </Text>
                          </View>
                          <Text className="text-neutral-400 text-sm mt-1 font-sans">
                            {exercise.series} série{exercise.series > 1 ? 's' : ''} • {exercise.reps} rep{exercise.reps > 1 ? 's' : ''} • {exercise.load}kg
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => toggleExerciseCompletion(index)}
                          className={`w-[25px] h-[25px] mt-[20px] border rounded-lg ${
                            exercise.completion === 1 ? 'bg-rose-500' : 'border-2 border-neutral-600'
                          }`}
                          style={{ alignItems: 'center', justifyContent: 'center' }}
                        >
                          {exercise.completion === 1 ? <Ionicons name="checkmark" size={20} color="white" /> : null}
                        </Pressable>
                      </View>
                    </View>
                  </Swipeable>
                ))}
              </GestureHandlerRootView>
            </View>

            {exercises.length === 0 && (
              <View className="items-center justify-center py-32">
                <Ionicons name="barbell-outline" size={48} color="#71717a" />
                <Text className="text-zinc-400 font-sans text-center mt-2">
                  Nenhum exercício adicionado
                </Text>
                <Text className="text-zinc-500 font-sans text-sm text-center mt-1">
                  Adicione exercícios para compor seu treino
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CreateWorkoutModal;