import {
  View,
  Text,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
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

const colorOptions = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#EAB308', // Amarelo
  '#10B981', // Verde
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#F43F5E', // Rosa escuro
  '#6B7280', // Cinza
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquesa
];

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
    return category ? category.color : '#999999';
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
      setNewCategoryColor('#EF4444');
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
            borderTopColor: '#404040',
            backgroundColor: '#FFAA1D',
          }}
          onPress={() => handleDuplicate(item.id)}
        >
          <Ionicons name="copy" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            display: "flex",
            justifyContent: 'center',
            backgroundColor: '#f43f5e',
            borderTopWidth: 1,
            borderTopColor: '#404040',
            height: "100%",
            width: 100
          }}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={24} color="white" />
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
        <View className="w-full flex flex-col justify-center px-6 h-[102px] pt-1 pb-4 border-b border-neutral-700 bg-zinc-800">
          <View className="flex flex-row justify-between">
            <Pressable
              className="flex flex-col gap-1 mt-1"
              onPress={() => handleOpenEdit(item)}
            >
              <Text className="text-xl font-sans font-medium text-gray-300">{item.name}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-neutral-400 text-sm mt-1 font-sans">
                  {new Date(item.date ?? '').toLocaleDateString('pt-BR')}
                </Text>
                <Text className="text-neutral-400 text-sm font-sans">
                  • {exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2 justify-start mt-3 items-start flex-1 overflow-hidden">
            {muscles.length > 0 ? (
              muscles.map((muscle: string) => (
                <View
                  key={muscle}
                  className="px-3 py-1 rounded-xl max-w-[80px] overflow-hidden"
                  style={{ backgroundColor: getCategoryColor(muscle.trim()) }}
                >
                  <Text
                    className="text-xs font-medium text-white font-sans"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {muscle.trim()}
                  </Text>
                </View>
              ))
            ) : (
              <View
                className="px-3 py-1 rounded-xl overflow-hidden"
                style={{ backgroundColor: '#94a3b8' }}
              >
                <Text
                  className="text-xs font-medium text-white font-sans"
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
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>

      <Pressable
        className="absolute bottom-6 right-6 z-20 rounded-full items-center justify-center"
        onPress={handleOpenCreate}
      >
        <LinearGradient
          colors={['#FFD45A', '#FFA928', '#FF7A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            width: 50, 
            height: 50, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            borderRadius: "100%"
          }}
        >
          <Feather name="plus" strokeWidth={3} size={32} color="black" />
        </LinearGradient>
      </Pressable>

      {/* Header */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-end">
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Academia</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
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