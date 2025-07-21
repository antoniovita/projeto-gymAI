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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useWorkout } from '../hooks/useWorkout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'hooks/useAuth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const EmptyState = ({ onCreateWorkout }: { onCreateWorkout: () => void }) => {
  return (
    <View className="flex-1 justify-center items-center mb-[60px] px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="barbell-outline" size={60} color="gray" />
        </View>
        
        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhum treino criado
        </Text>
        
        <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
          Crie seus primeiros treinos para organizar sua rotina na academia
        </Text>
      </View>
    </View>
  );
};

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
];

const muscleColors: Record<string, string> = {
  Peito: '#f87171',
  Costas: '#60a5fa',
  Pernas: '#34d399',
  Bíceps: '#facc15',
  Tríceps: '#c084fc',
  Abdômen: '#f97316',
  Ombros: '#38bdf8',
};

export default function WorkoutScreen() {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [selectedMusclesForWorkout, setSelectedMusclesForWorkout] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const [extraCatWorkout, setextraCatWorkout] = useState<{ name: string; color: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  const [customMuscleGroups, setCustomMuscleGroups] = useState<{ name: string; color: string }[]>([]);


  const navigation = useNavigation();


  const handleGoBack = () => {
    navigation.goBack();
  };


  useEffect(() => {
    const loadMuscleGroups = async () => {
      try {
        const stored = await AsyncStorage.getItem('customMuscleGroups');
        if (stored) {
          setCustomMuscleGroups(JSON.parse(stored));
        } else {
          const initial = Object.entries(muscleColors).map(([name, color]) => ({ name, color }));
          setCustomMuscleGroups(initial);
          await AsyncStorage.setItem('customMuscleGroups', JSON.stringify(initial));
        }
      } catch (err) {
        console.error('Erro ao carregar grupos musculares:', err);
      }
    };

    loadMuscleGroups();
  }, []);

  const { userId } = useAuth();

  const muscleGroups = customMuscleGroups.map((g) => g.name);

  const {
    workouts,
    createWorkout,
    fetchWorkouts,
    updateWorkout,
    deleteWorkout,
  } = useWorkout();

  const workout = workouts ?? [];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await AsyncStorage.getItem('extraCatWorkout');
        if (stored) {
          setextraCatWorkout(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Erro ao carregar categorias extras:', err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('extraCatWorkout', JSON.stringify(extraCatWorkout));
      } catch (err) {
        console.error('Erro ao salvar categorias extras:', err);
      }
    };

    saveCategories();
  }, [extraCatWorkout]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts(userId!);
    }, [userId])
  );

  const categories = Array.from(
    new Set([
      ...muscleGroups,
      ...workout
        .flatMap((task) => task.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0),
      ...extraCatWorkout.map(cat => cat.name),
    ])
  );

  const getCategoryColor = (catName: string) => {
    const custom = customMuscleGroups.find(c => c.name === catName);
    if (custom) return custom.color;

    const extraCat = extraCatWorkout.find(c => c.name === catName);
    if (extraCat) return extraCat.color;

    return '#999999';
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (
      extraCatWorkout.find(
        cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      Alert.alert('Erro', 'Essa categoria já existe.');
      return;
    }

    const newCat = { name: newCategoryName.trim(), color: newCategoryColor };
    setextraCatWorkout(prev => [...prev, newCat]);

    setNewCategoryName('');
    setNewCategoryColor('#EF4444');
    setIsCategoryModalVisible(false);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const isCategoryInUse = workout.some(task =>
      task.type?.split(',').map((t: string) => t.trim()).includes(categoryToDelete)
    );

    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais tarefas e não pode ser excluída.');
      setShowConfirmDeleteModal(false);
      setCategoryToDelete(null);
      return;
    }

    const newMuscles = customMuscleGroups.filter(c => c.name !== categoryToDelete);
    const newExtras = extraCatWorkout.filter(c => c.name !== categoryToDelete);

    setCustomMuscleGroups(newMuscles);
    setextraCatWorkout(newExtras);

    await AsyncStorage.setItem('customMuscleGroups', JSON.stringify(newMuscles));
    await AsyncStorage.setItem('extraCatWorkout', JSON.stringify(newExtras));

    setShowConfirmDeleteModal(false);
    setCategoryToDelete(null);
  };

  const toggleMuscleForWorkout = (muscle: string) => {
    setSelectedMusclesForWorkout((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleOpenCreate = () => {
    setSelectedWorkout(null);
    setNewWorkoutTitle('');
    setSelectedMusclesForWorkout([]);
    setContent('');
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (workout: any) => {
    setSelectedWorkout(workout);
    setNewWorkoutTitle(workout.name);
    setSelectedMusclesForWorkout(workout.type ? workout.type.split(',') : []);
    setContent(workout.content);
    setIsCreateVisible(true);
  };

  const handleSaveWorkout = async () => {
    if (!newWorkoutTitle.trim()) {
      Alert.alert('Erro!', 'O título do treino não pode estar vazio.');
      return;
    }

    try {
      const type = selectedMusclesForWorkout.join(',');
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (selectedWorkout) {
        await updateWorkout(selectedWorkout.id, {
          name: newWorkoutTitle,
          content,
          date: formattedDate,
          type,
        });
      } else {
        await createWorkout(newWorkoutTitle, content, formattedDate, userId!, type);
      }

      setIsCreateVisible(false);
      setNewWorkoutTitle('');
      setSelectedMusclesForWorkout([]);
      setContent('');
      await fetchWorkouts(userId!);
    } catch (err) {
      console.error(err);
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

  const filteredWorkouts = selectedCategories.length === 0
    ? workouts
    : workouts.filter((workout) =>
        workout.type?.split(',').some((muscle) => selectedCategories.includes(muscle))
      );

  const renderLeftActions = (item: any) => {
    return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderTopWidth: 1,
      borderTopColor: '#f43f5e',
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
          borderRadius: 32,
        }}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
    );
  };

  const renderWorkoutItem = ({ item }: { item: any }) => {
    const muscles = item.type ? item.type.split(',') : [];

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
              <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {new Date(item.date ?? '').toLocaleDateString('pt-BR')}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2 justify-start mt-3 items-start flex-1 overflow-hidden">
            {muscles.length > 0 ? (
              muscles.map((muscle: string) => (
                <View
                  key={muscle}
                  className="px-3 py-1 rounded-xl max-w-[80px] overflow-hidden"
                  style={{ backgroundColor: muscleColors[muscle] ?? '#94a3b8' }}
                >
                  <Text
                    className="text-xs font-medium text-white font-sans"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {muscle}
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
    <SafeAreaView className="flex-1 bg-zinc-800">

       <Pressable
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-[6%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </Pressable>

      <View className="absolute bottom-[6%] left-6 z-20">
        <Pressable
          onPress={handleGoBack}
          className="flex-row items-center bg-rose-400 px-4 h-[50px] rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="black" />
          <Text className="text-black font-sans text-lg ml-1">Voltar</Text>
        </Pressable>
      </View>

      <View className="flex flex-col px-6 mt-[40px] mb-5">
        <View className='flex flex-row justify-between items-center'>
          <Text className="text-3xl text-white font-medium font-sans">Academia</Text>
        
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <Ionicons name="options-outline" size={24} color="#ff7a7f" />
          </Pressable>

          <Modal
            transparent
            animationType="fade"
            visible={showDeleteCategoryModal}
            onRequestClose={() => setShowDeleteCategoryModal(false)}
          >
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
              <View className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-4">
                <ScrollView className="mb-4">
                  {categories.length === 0 ? (
                    <View className="items-center justify-center py-12">
                      <Ionicons name="folder-open-outline" size={64} color="#aaa" className="mb-4" />
                      <Text className="text-neutral-400 text-lg font-sans text-center">
                        Você ainda não criou categorias.
                      </Text>
                    </View>
                  ) : (
                    categories.map((cat) => {
                      const color = getCategoryColor(cat);
                      return (
                        <View
                          key={cat}
                          className="flex-row justify-between items-center py-2 border-b border-neutral-700"
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff',}}
                            />
                            <Text className="text-white font-sans text-lg">{cat}</Text>
                          </View>
                          <Pressable
                            onPress={() => {
                              setCategoryToDelete(cat);
                              setShowConfirmDeleteModal(true);
                            }}
                            className="p-2 bg-neutral-700 rounded-xl"
                          >
                          <Ionicons name="trash" size={20} color="#fa4d5c" />
                          </Pressable>
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                <Pressable
                  onPress={() => setShowDeleteCategoryModal(false)}
                  className="bg-neutral-700 rounded-xl p-3 items-center"
                >
                  <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
                </Pressable>
              </View>

              <Modal
                transparent
                animationType="fade"
                visible={showConfirmDeleteModal}
                onRequestClose={() => setShowConfirmDeleteModal(false)}
              >
                <View className="flex-1 bg-black/80 justify-center items-center px-8">
                  <View className="bg-zinc-800 w-full rounded-2xl p-6 items-center shadow-lg">
                    <Ionicons name="alert-circle" size={48} color="#ff7a7f" className="mb-4" />
                    <Text className="text-white text-xl font-semibold mb-2 font-sans text-center">
                      Apagar Categoria
                    </Text>
                    <Text className="text-neutral-400 font-sans text-center mb-6">
                      {categoryToDelete
                        ? `Tem certeza que deseja apagar a categoria "${categoryToDelete}"? Esta ação não pode ser desfeita.`
                        : 'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.'}
                    </Text>

                    <View className="flex-row w-full justify-between gap-3">
                      <Pressable
                        onPress={() => setShowConfirmDeleteModal(false)}
                        className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
                      >
                        <Text className="text-white font-semibold font-sans">Cancelar</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleDeleteCategory}
                        className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
                      >
                        <Text className="text-black font-sans font-semibold">Apagar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </Modal>
        </View>

        <View className="flex flex-row flex-wrap gap-2 mt-6">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const color = getCategoryColor(cat);

            return (
              <Pressable
                key={cat}
                onPress={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                  )
                }
                className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                  isSelected ? 'bg-rose-400' : 'bg-zinc-700'
                }`}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff' }} />
                <Text className={`font-sans text-sm ${isSelected ? 'text-black' : 'text-white'}`}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => setIsCategoryModalVisible(true)}
            className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-zinc-700"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white text-sm font-sans">Nova Categoria</Text>
          </Pressable>

          <Modal
            transparent
            animationType="fade"
            visible={isCategoryModalVisible}
            onRequestClose={() => setIsCategoryModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/90 px-8">
              <View className="bg-zinc-800 p-6 rounded-2xl w-full">

                <TextInput
                  placeholder="Nome da categoria"
                  placeholderTextColor="#a1a1aa"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  className="text-white font-sans font-3xl p-2 rounded mb-4"
                />

                <View className="flex flex-row flex-wrap gap-2 mb-4">
                  {colorOptions.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setNewCategoryColor(color)}
                      style={{
                        backgroundColor: color,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        borderWidth: newCategoryColor === color ? 3 : 1,
                        borderColor: newCategoryColor === color ? '#fff' : '#333',
                      }}
                    />
                  ))}
                </View>

                <Pressable
                  onPress={handleAddCategory}
                  className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
                >
                  <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsCategoryModalVisible(false)}
                  className="mt-4 p-2"
                >
                  <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </View>
      
      {filteredWorkouts.length === 0 ? (
        <EmptyState onCreateWorkout={handleOpenCreate} />
      ) : (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderWorkoutItem}
        />
      )}

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

    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
      {/* Workout Title */}
      <View className="mt-3 mb-6">
        <TextInput
          placeholder="Nome do treino"
          placeholderTextColor="#71717a"
          value={newWorkoutTitle}
          onChangeText={setNewWorkoutTitle}
          className="text-white text-2xl font-sans"
          multiline
          autoFocus
        />
      </View>

      {/* Muscle Categories */}
      <View className="mb-8">
        <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Grupos Musculares
        </Text>
        
        <View className="flex flex-row flex-wrap gap-2">
          {categories.map((muscle) => {
            const isSelected = selectedMusclesForWorkout.includes(muscle);
            const color = muscleColors[muscle];
            return (
              <Pressable
                key={muscle}
                onPress={() => toggleMuscleForWorkout(muscle)}
                className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                  isSelected ? 'bg-rose-400' : 'bg-zinc-700'
                }`}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff' }} />
                <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{muscle}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Workout Content */}
      <View className="mb-6">
        <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Descrição do Treino
        </Text>
        <TextInput
          placeholder="Descreva os exercícios, séries, repetições..."
          placeholderTextColor="#71717a"
          className="text-white text-base leading-6 bg-zinc-700/30 font-sans border-zinc-600 rounded-xl px-4 py-3 min-h-[150px]"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />
      </View>
    </ScrollView>
  </View>
</Modal>
    </SafeAreaView>
  );
}