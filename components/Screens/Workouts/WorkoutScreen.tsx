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


export default function WorkoutScreen() {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false); 

  // Estados para controle dos exercícios
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('10');
  const [newExerciseSeries, setNewExerciseSeries] = useState('3');

  const navigation = useNavigation();
  const { userId } = useAuth();
  
  // Add theme hook
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

  // Filtrar categorias por tipo 'workout'
  const workoutCategories = getCategoriesByType('workout');

  const {
    workouts,
    createWorkout,
    fetchWorkouts,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
  } = useWorkout();

  const workout = workouts ?? [];

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts(userId!);
      refreshCategories();
    }, [userId])
  );

  // Criar categorias dos grupos musculares existentes nas tarefas
  const taskMuscles = Array.from(
    new Set(
      workout
        .flatMap((task) => task.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0)
    )
  );

  const categories = [
    ...workoutCategories.map(cat => cat.name),
    ...taskMuscles.filter(muscle => !workoutCategories.some(cat => cat.name === muscle))
  ];

  const getCategoryColor = (catName: string) => {
    const category = workoutCategories.find(c => c.name === catName);
    return category ? category.color : theme.colors.textMuted;
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (workoutCategories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Erro', 'Essa categoria já existe.');
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

  // Nova função simplificada para deletar categoria
  const handleDeleteCategory = async (categoryName: string) => {
    const categoryToDelete = workoutCategories.find(cat => cat.name === categoryName);
    if (!categoryToDelete) return;

    const isCategoryInUse = workout.some(task =>
      task.type?.split(',').map((t: string) => t.trim()).includes(categoryName)
    );

    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais tarefas e não pode ser excluída.');
      return;
    }

    try {
      await deleteCategory(categoryToDelete.id);
      // O modal será fechado automaticamente após a exclusão bem-sucedida
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      Alert.alert('Erro', 'Não foi possível excluir a categoria.');
    }
  };

  const handleOpenCreate = () => {
    setSelectedWorkout(null);
    setNewWorkoutTitle('');
    setSelectedMusclesForWorkout([]);
    setExercises([]);
    setNewExerciseName('');
    setNewExerciseReps('10');
    setNewExerciseSeries('3');
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setNewWorkoutTitle(workout.name);
    setSelectedMusclesForWorkout(workout.type ? workout.type.split(',') : []);
    setExercises(workout.exercises || []);
    setNewExerciseName('');
    setNewExerciseReps('10');
    setNewExerciseSeries('3');
    setIsCreateVisible(true);
  };

  const handleSaveWorkout = async () => {
    if (!newWorkoutTitle.trim()) {
      Alert.alert('Erro!', 'O título do treino não pode estar vazio.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Erro!', 'Adicione pelo menos um exercício ao treino.');
      return;
    }

    try {
      const type = selectedMusclesForWorkout.join(',');
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (selectedWorkout) {
        await updateWorkout(selectedWorkout.id, {
          name: newWorkoutTitle,
          exercises,
          date: formattedDate,
          type,
        });
      } else {
        await createWorkout(newWorkoutTitle, exercises, formattedDate, userId!, type);
      }

      setIsCreateVisible(false);
      setNewWorkoutTitle('');
      setSelectedMusclesForWorkout([]);
      setExercises([]);
      setNewExerciseName('');
      setNewExerciseReps('10');
      setNewExerciseSeries('3');
      await fetchWorkouts(userId!);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Excluir treino',
      'Tem certeza que deseja excluir este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(id);
              await fetchWorkouts(userId!);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir o treino.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDuplicate = async (itemId: string) => {
    Alert.alert(
      'Duplicar treino',
      'Tem certeza que deseja duplicar este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Duplicar',
          style: 'cancel',
          onPress: async () => {
            try {
              await duplicateWorkout(userId!, itemId);
              await fetchWorkouts(userId!);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível duplicar o treino.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  const filteredWorkouts = selectedCategories.length === 0
    ? workouts
    : workouts.filter((workout) =>
        workout.type?.split(',').some((muscle) => selectedCategories.includes(muscle))
      );

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
          onPress={() => handleDuplicate(item.id)}
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
          onPress={() => handleDelete(item.id)}
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
                  {new Date(item.date ?? '').toLocaleDateString('pt-BR')}
                </Text>
                <Text style={{ 
                  color: theme.colors.textExpenseDate, 
                  fontSize: 14 
                }}>
                  • {exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}
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
                    backgroundColor: getCategoryColor(muscle.trim()),
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

      {/* Novo Modal de Gerenciar Categorias */}
      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={workoutCategories}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Filtros de Categoria */}
      <CategoryFilters
        categories={workoutCategories}
        selectedTypes={selectedCategories}
        onToggleCategory={(categoryName) =>
          setSelectedCategories((prev) =>
            prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName]
          )
        }
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

      <CreateWorkoutModal
        isCreateVisible={isCreateVisible}
        setIsCreateVisible={setIsCreateVisible}
        selectedWorkout={selectedWorkout}
        newWorkoutTitle={newWorkoutTitle}
        setNewWorkoutTitle={setNewWorkoutTitle}
        selectedMusclesForWorkout={selectedMusclesForWorkout}
        setSelectedMusclesForWorkout={setSelectedMusclesForWorkout}
        exercises={exercises}
        setExercises={setExercises}
        categories={categories}
        getCategoryColor={getCategoryColor}
        handleSaveWorkout={handleSaveWorkout}
        newExerciseName={newExerciseName}
        setNewExerciseName={setNewExerciseName}
        newExerciseReps={newExerciseReps}
        setNewExerciseReps={setNewExerciseReps}
        newExerciseSeries={newExerciseSeries}
        setNewExerciseSeries={setNewExerciseSeries}
        userId={userId!}
      />
    </SafeAreaView>
  );
}