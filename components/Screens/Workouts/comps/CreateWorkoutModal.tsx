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
  FlatList
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { Exercise, Workout } from '../../../../api/model/Workout';
import { useStats } from 'hooks/useStats';
import { useTheme } from 'hooks/useTheme';

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
  const theme = useTheme();

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
        style={{
          marginHorizontal: 4,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          minWidth: 50,
          alignItems: 'center',
          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
        }}
      >
        <Text style={{
          fontSize: 16,
          color: isSelected ? theme.colors.textSelected : theme.colors.text,
          fontWeight: isSelected ? '600' : 'normal',
        }}>
          {item}
        </Text>
        <Text style={{
          fontSize: 12,
          marginTop: 2,
          color: isSelected ? theme.colors.textSelected : theme.colors.textMuted,
        }}>
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
  const theme = useTheme();
  const [isVisibleExerciseModal, setIsVisibleExerciseModal] = React.useState(false);
  const [newExerciseLoad, setNewExerciseLoad] = React.useState('');

  const {addExperience} = useStats();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const toggleMuscleForWorkout = (muscle: string) => {
    setSelectedMusclesForWorkout((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const showExerciseModal = () => {
    setIsVisibleExerciseModal(true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const hideExerciseModal = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleExerciseModal(false);
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
        backgroundColor: theme.colors.deleteAction,
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
          <Ionicons name="trash" size={24} color={theme.colors.deleteActionIcon} />
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
      <View style={{
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 48 : 32,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: theme.colors.background,
      }}>

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}>
          <Pressable
            style={{
              alignItems: 'center',
              flexDirection: 'row',
            }}
            onPress={() => setIsCreateVisible(false)}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
            <Text style={{
              color: theme.colors.text,
              fontSize: 18,
              marginLeft: 4,
            }}>
              Voltar
            </Text>
          </Pressable>

          <Pressable onPress={handleSaveWorkout}>
            <Text style={{
              color: theme.colors.primary,
              fontSize: 18,
              fontWeight: '600',
              marginRight: 16,
            }}>
              Salvar
            </Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

          {/* Título do Treino */}
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <TextInput
              placeholder="Nome do treino"
              placeholderTextColor={theme.colors.modalPlaceholder}
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              style={{
                color: theme.colors.text,
                fontSize: 32,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
              multiline
            />
          </View>

          {/* Grupos Musculares */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              color: theme.colors.modalSectionTitle,
              fontSize: 14,
              paddingHorizontal: 24,
              fontWeight: '500',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
            }}>
              Grupos Musculares
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              paddingHorizontal: 24,
            }}>
              {categories.map((muscle) => {
                const isSelected = selectedMusclesForWorkout.includes(muscle);
                const color = getCategoryColor(muscle);
                return (
                  <Pressable
                    key={muscle}
                    onPress={() => toggleMuscleForWorkout(muscle)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.secondary,
                    }}
                  >
                    <View style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: 5, 
                      backgroundColor: color, 
                      borderWidth: 0.5, 
                      borderColor: theme.colors.text 
                    }} />
                    <Text style={{
                      color: isSelected ? theme.colors.textSelected : theme.colors.text,
                    }}>
                      {muscle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Exercícios */}
          <View style={{ marginBottom: 32 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                color: theme.colors.modalSectionTitle,
                fontSize: 14,
                paddingHorizontal: 24,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}>
                Exercícios ({exercises.length})
              </Text>

              <Pressable 
                style={{ paddingHorizontal: 24 }} 
                onPress={showExerciseModal}
              >
                <Feather name='plus' size={18} color={theme.colors.modalSectionTitle} />
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
                  
                  <Animated.View 
                    style={{
                      backgroundColor: theme.colors.modalBackground,
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingBottom: Platform.OS === 'ios' ? 32 : 16,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <View style={{ paddingHorizontal: 24, paddingTop: 36 }}>

                      {/* Nome do exercício */}
                      <View style={{ marginBottom: 24 }}>
                        <Text style={{
                          color: theme.colors.modalSectionTitle,
                          fontSize: 14,
                          fontWeight: '500',
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 1.2,
                        }}>
                          Nome
                        </Text>
                        <View style={{
                          backgroundColor: theme.colors.modalInputBackground,
                          borderRadius: 12,
                        }}>
                          <TextInput
                            placeholder="Supino reto"
                            placeholderTextColor={theme.colors.modalPlaceholder}
                            value={newExerciseName}
                            onChangeText={setNewExerciseName}
                            style={{
                              color: theme.colors.text,
                              fontSize: 18,
                              paddingHorizontal: 16,
                              paddingVertical: 16,
                            }}
                          />
                        </View>
                      </View>

                      {/* Carga com Slider Horizontal */}
                      <View style={{ marginBottom: 24 }}>
                        <Text style={{
                          color: theme.colors.modalSectionTitle,
                          fontSize: 14,
                          fontWeight: '500',
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 1.2,
                        }}>
                          Carga - {newExerciseLoad || '0'} kg
                        </Text>
                        <View style={{
                          backgroundColor: theme.colors.modalInputBackground,
                          borderRadius: 12,
                          paddingVertical: 12,
                        }}>
                          <WeightSlider
                            value={newExerciseLoad}
                            onValueChange={setNewExerciseLoad}
                          />
                        </View>
                      </View>

                      {/* Séries e Repetições */}
                      <View style={{
                        flexDirection: 'row',
                        gap: 16,
                        marginBottom: 32,
                      }}>
                        <View style={{ flex: 1 }}>
                          <View style={{
                            backgroundColor: theme.colors.secondary,
                            overflow: 'hidden',
                          }}>
                            <Picker
                              selectedValue={newExerciseSeries}
                              onValueChange={(itemValue) => setNewExerciseSeries(itemValue)}
                              style={{
                                color: theme.colors.text,
                                backgroundColor: 'transparent',
                                height: Platform.OS === 'ios' ? 180 : 50,
                              }}
                              itemStyle={{
                                color: theme.colors.text,
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

                        <View style={{ flex: 1 }}>
                          <View style={{
                            backgroundColor: theme.colors.secondary,
                            overflow: 'hidden',
                          }}>
                            <Picker
                              selectedValue={newExerciseReps}
                              onValueChange={(itemValue) => setNewExerciseReps(itemValue)}
                              style={{
                                color: theme.colors.text,
                                backgroundColor: 'transparent',
                                height: Platform.OS === 'ios' ? 180 : 50,
                              }}
                              itemStyle={{
                                color: theme.colors.text,
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
                        style={{
                          backgroundColor: theme.colors.primary,
                          borderRadius: 12,
                          padding: 16,
                          alignItems: 'center',
                          marginBottom: 16,
                        }}
                      >
                        <Text style={{
                          color: theme.colors.textSelected,
                          fontWeight: '600',
                          fontSize: 18,
                        }}>
                          Adicionar Exercício
                        </Text>
                      </Pressable>
                      
                      <Pressable
                        onPress={hideExerciseModal}
                        style={{
                          alignItems: 'center',
                          paddingVertical: 8,
                        }}
                      >
                        <Text style={{
                          color: theme.colors.textMuted,
                        }}>
                          Cancelar
                        </Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                </Animated.View>
              </Modal>
            </View>

            <View style={{ marginTop: 8 }}>
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
                    <View style={{
                      width: '100%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      paddingHorizontal: 24,
                      height: 90,
                      paddingBottom: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                        <Pressable style={{
                          flexDirection: 'column',
                          gap: 4,
                          marginTop: 4,
                          flex: 1,
                        }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: '500',
                                maxWidth: 280,
                                color: exercise.completion === 1 ? theme.colors.textMuted : theme.colors.text,
                                textDecorationLine: exercise.completion === 1 ? 'line-through' : 'none',
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {exercise.name}
                            </Text>
                          </View>
                          <Text style={{
                            color: theme.colors.textMuted,
                            fontSize: 14,
                            marginTop: 4,
                          }}>
                            {exercise.series} série{exercise.series > 1 ? 's' : ''} • {exercise.reps} rep{exercise.reps > 1 ? 's' : ''} • {exercise.load}kg
                          </Text>
                        </Pressable>
                        
                        <Pressable
                          onPress={() => toggleExerciseCompletion(index)}
                          style={{
                            width: 25,
                            height: 25,
                            marginTop: 20,
                            borderWidth: exercise.completion === 1 ? 0 : 2,
                            borderColor: theme.colors.border,
                            borderRadius: 8,
                            backgroundColor: exercise.completion === 1 ? theme.colors.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {exercise.completion === 1 ? (
                            <Ionicons name="checkmark" size={20} color={theme.colors.textSelected} />
                          ) : null}
                        </Pressable>
                      </View>
                    </View>
                  </Swipeable>
                ))}
              </GestureHandlerRootView>
            </View>

            {exercises.length === 0 && (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 128,
              }}>
                <Ionicons name="barbell-outline" size={48} color={theme.colors.textMuted} />
                <Text style={{
                  color: theme.colors.textMuted,
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  Nenhum exercício adicionado
                </Text>
                <Text style={{
                  color: theme.colors.textMuted,
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 4,
                  opacity: 0.7,
                }}>
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