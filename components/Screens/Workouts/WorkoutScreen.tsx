import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useWorkout } from '../../../hooks/useWorkout';
import { useCategory } from '../../../hooks/useCategory';
import { Exercise, Workout } from '../../../api/model/Workout';
import { useAuth } from 'hooks/useAuth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CreateWorkoutModal from './comps/CreateWorkoutModal';
import CategoryFilters from '../../generalComps/CategoryFilters';
import CategoryModal from '../../generalComps/CategoryModal';
import DeleteCategoryModal from '../../generalComps/DeleteCategoryModal'; 
import { LinearGradient } from 'expo-linear-gradient';
import GradientIcon from 'components/generalComps/GradientIcon';
import WorkoutStatsSection from './comps/WorkoutStatsSection';
import { EmptyState } from 'components/generalComps/EmptyState';
import { OUTLINE } from 'imageConstants';
import { useTheme } from '../../../hooks/useTheme';

import {
  validateWorkoutForm,
  validateCategoryName,
  extractMuscleCategories,
  mergeCategoriesWithMuscles,
  getCategoryColor,
  filterWorkoutsByCategories,
  formatWorkoutDate,
  getCurrentDateString,
  getExerciseCountText,
  handleDeleteWorkout,
  handleDuplicateWorkout,
  handleDeleteCategory,
  getInitialWorkoutForm,
  getInitialExerciseForm,
  workoutToFormData,
  WorkoutFormData,
  ExerciseFormData
} from './workoutHelpers';

export default function WorkoutScreen() {
  // Estados do modal de criação/edição
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  // Estados do formulário de treino
  const [workoutForm, setWorkoutForm] = useState<WorkoutFormData>(getInitialWorkoutForm());
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>(getInitialExerciseForm());
  
  // Estados de filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Estados do modal de categorias
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  // Hooks
  const navigation = useNavigation();
  const { userId } = useAuth();
  const theme = useTheme();

  // Hook de categorias
  const {
    categories: allCategories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    deleteCategory,
    getCategoriesByType,
    refreshCategories
  } = useCategory();

  // Hook de treinos
  const {
    workouts,
    createWorkout,
    fetchWorkouts,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
  } = useWorkout();

  // Dados derivados
  const workoutCategories = getCategoriesByType('workout');
  const taskMuscles = extractMuscleCategories(workouts ?? []);
  const categories = mergeCategoriesWithMuscles(workoutCategories, taskMuscles);
  const filteredWorkouts = filterWorkoutsByCategories(workouts ?? [], selectedCategories);

  // Efeitos
  useFocusEffect(
    useCallback(() => {
      fetchWorkouts(userId!);
      refreshCategories();
    }, [userId])
  );

  // Handlers de categoria
  const handleAddCategory = async () => {
    const error = validateCategoryName(newCategoryName, workoutCategories);
    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    try {
      await createCategory(newCategoryName.trim(), newCategoryColor, 'workout');
      setNewCategoryName('');
      setNewCategoryColor(theme.colors.primary);
      setIsCategoryModalVisible(false);
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    }
  };

  const onDeleteCategory = async (categoryName: string) => {
    const categoryToDelete = workoutCategories.find(cat => cat.name === categoryName);
    if (!categoryToDelete) return;

    const handleDelete = async () => {
      try {
        await deleteCategory(categoryToDelete.id);
      } catch (err) {
        console.error('Erro ao deletar categoria:', err);
        Alert.alert('Erro', 'Não foi possível excluir a categoria.');
      }
    };

    handleDeleteCategory(categoryName, workouts ?? [], handleDelete);
  };

  // Handlers de treino
  const handleOpenCreate = () => {
    setSelectedWorkout(null);
    setWorkoutForm(getInitialWorkoutForm());
    setExerciseForm(getInitialExerciseForm());
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setWorkoutForm(workoutToFormData(workout));
    setExerciseForm(getInitialExerciseForm());
    setIsCreateVisible(true);
  };

  const handleSaveWorkout = async () => {
    const error = validateWorkoutForm(workoutForm);
    if (error) {
      Alert.alert('Erro!', error);
      return;
    }

    try {
      const type = workoutForm.muscles.join(',');
      const formattedDate = getCurrentDateString();

      if (selectedWorkout) {
        await updateWorkout(selectedWorkout.id, {
          name: workoutForm.title,
          exercises: workoutForm.exercises,
          date: formattedDate,
          type,
        });
      } else {
        await createWorkout(
          workoutForm.title, 
          workoutForm.exercises, 
          formattedDate, 
          userId!, 
          type
        );
      }

      setIsCreateVisible(false);
      setWorkoutForm(getInitialWorkoutForm());
      setExerciseForm(getInitialExerciseForm());
      await fetchWorkouts(userId!);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    }
  };

  const onDeleteWorkout = async (id: string) => {
    try {
      await deleteWorkout(id);
      await fetchWorkouts(userId!);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível excluir o treino.');
    }
  };

  const onDuplicateWorkout = async (itemId: string) => {
    try {
      await duplicateWorkout(userId!, itemId);
      await fetchWorkouts(userId!);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível duplicar o treino.');
    }
  };

  // Handlers de filtros
  const handleToggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };

  // Componentes de renderização
  const renderLeftActions = (item: Workout) => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100%',
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: "100%",
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.primary,
          }}
          onPress={() => handleDuplicateWorkout(item.id, onDuplicateWorkout)}
        >
          <Ionicons name="copy" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            display: "flex",
            justifyContent: 'center',
            backgroundColor: theme.colors.deleteAction,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: "100%",
            width: 100
          }}
          onPress={() => handleDeleteWorkout(item.id, onDeleteWorkout)}
        >
          <Ionicons name="trash" size={24} color={theme.colors.deleteActionIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    const muscles = item.type ? item.type.split(',') : [];
    const exerciseCount = item.exercises?.length || 0;

    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(item)}
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
          height: 102,
          paddingTop: 4,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.itemBackground,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              style={{ flexDirection: 'column', gap: 4, marginTop: 4 }}
              onPress={() => handleOpenEdit(item)}
            >
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '500', 
                color: theme.colors.itemTitle 
              }}>
                {item.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ 
                  color: theme.colors.textExpenseDate, 
                  fontSize: 14, 
                  marginTop: 4 
                }}>
                  {formatWorkoutDate(item.date ?? '')}
                </Text>
                <Text style={{ 
                  color: theme.colors.textExpenseDate, 
                  fontSize: 14 
                }}>
                  • {getExerciseCountText(exerciseCount)}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 8, 
            justifyContent: 'flex-start', 
            marginTop: 12, 
            alignItems: 'flex-start', 
            flex: 1, 
            overflow: 'hidden' 
          }}>
            {muscles.length > 0 ? (
              muscles.map((muscle: string) => (
                <View
                  key={muscle}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    maxWidth: 80,
                    overflow: 'hidden',
                    backgroundColor: getCategoryColor(
                      muscle.trim(), 
                      workoutCategories, 
                      theme.colors.textMuted
                    ),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: 'white',
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {muscle.trim()}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.textMuted,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: 'white',
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Sem categoria
                </Text>
              </View>
            )}
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background,
      ...(Platform.OS === 'android' && { paddingVertical: 30 })
    }}>

      {/* Botão de adicionar */}
      <Pressable
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 20,
          borderRadius: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={handleOpenCreate}
      >
        <LinearGradient
          colors={[...theme.colors.linearGradient.primary] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            width: 50, 
            height: 50, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            borderRadius: 25
          }}
        >
          <Feather name="plus" strokeWidth={3} size={32} color={theme.colors.onPrimary} />
        </LinearGradient>
      </Pressable>

      {/* Header */}
      <View style={{
        marginTop: 20,
        paddingHorizontal: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
        }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 18,
            fontFamily: "Poppins_400Regular",
            fontWeight: '500',
          }}>
            Academia
          </Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginRight: 4,
        }}>
          <Pressable 
            onPress={() => setShowDeleteCategoryModal(true)}
          >
            <GradientIcon name="folder" size={22} />
          </Pressable>
        </View>
      </View>

      <WorkoutStatsSection />

      {/* Modal de Gerenciar Categorias */}
      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={workoutCategories}
        onDeleteCategory={onDeleteCategory}
      />

      {/* Filtros de Categoria */}
      <CategoryFilters
        categories={workoutCategories}
        selectedTypes={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onAddNewCategory={() => setIsCategoryModalVisible(true)}
        addButtonText="Nova Categoria"
      />

      {/* Modal de Nova Categoria */}
      <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
        onAddCategory={handleAddCategory}
        categories={workoutCategories}
      />
      
      {/* Lista de Treinos ou Estado Vazio */}
      {filteredWorkouts.length === 0 ? (
        <EmptyState
          image={OUTLINE.fuocoACADEMIA}
          title="Nenhum treino registrado"
          subtitle="Adicione treinos para analisar seu progresso"
        />
      ) : (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderWorkoutItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Criação/Edição */}
      <CreateWorkoutModal
        isCreateVisible={isCreateVisible}
        setIsCreateVisible={setIsCreateVisible}
        selectedWorkout={selectedWorkout}
        newWorkoutTitle={workoutForm.title}
        setNewWorkoutTitle={(title) => setWorkoutForm(prev => ({ ...prev, title }))}
        selectedMusclesForWorkout={workoutForm.muscles}
        setSelectedMusclesForWorkout={(muscles) => {
          const musclesArray = typeof muscles === 'function' ? muscles(workoutForm.muscles) : muscles;
          setWorkoutForm(prev => ({ ...prev, muscles: musclesArray }));
        }}
        exercises={workoutForm.exercises}
        setExercises={(exercises) => {
          const exercisesArray = typeof exercises === 'function' ? exercises(workoutForm.exercises) : exercises;
          setWorkoutForm(prev => ({ ...prev, exercises: exercisesArray }));
        }}
        categories={categories}
        getCategoryColor={(name) => getCategoryColor(name, workoutCategories, theme.colors.textMuted)}
        handleSaveWorkout={handleSaveWorkout}
        newExerciseName={exerciseForm.name}
        setNewExerciseName={(name) => setExerciseForm(prev => ({ ...prev, name }))}
        newExerciseReps={exerciseForm.reps}
        setNewExerciseReps={(reps) => setExerciseForm(prev => ({ ...prev, reps }))}
        newExerciseSeries={exerciseForm.series}
        setNewExerciseSeries={(series) => setExerciseForm(prev => ({ ...prev, series }))}
        userId={userId!}
      />
    </SafeAreaView>
  );
}