import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useWorkout } from '../hooks/useWorkout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';


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

  const { userId, loading } = useAuth();

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


  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>

      <View className="flex flex-col px-6 mt-[40px] mb-5">
        <View className='flex flex-row justify-between items-center'>
          <Text className="text-3xl text-white font-medium font-sans">Academia</Text>
        
            <TouchableOpacity onPress={() => setShowDeleteCategoryModal(true)}>
              <Ionicons name="options-outline" size={24} color="#ff7a7f" />
            </TouchableOpacity>


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
                            style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: color }}
                          />
                          <Text className="text-white font-sans text-lg">{cat}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setCategoryToDelete(cat);
                            setShowConfirmDeleteModal(true);
                          }}
                          className="p-2 bg-neutral-700 rounded-xl"
                        >
                        <Ionicons name="trash" size={20} color="#fa4d5c" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowDeleteCategoryModal(false)}
                className="bg-neutral-700 rounded-xl p-3 items-center"
              >
                <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
              </TouchableOpacity>
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
                    <TouchableOpacity
                      onPress={() => setShowConfirmDeleteModal(false)}
                      className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
                    >
                      <Text className="text-white font-semibold font-sans">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteCategory}
                      className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
                    >
                      <Text className="text-black font-sans font-semibold">Apagar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </Modal>


        </View>


        <View className="flex flex-row flex-wrap gap-2 mt-6 pb-3">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const color = getCategoryColor(cat);

            return (
              <TouchableOpacity
                key={cat}
                onPress={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                  )
                }
                className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                  isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                }`}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                <Text className={`font-sans text-sm ${isSelected ? 'text-black' : 'text-white'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => setIsCategoryModalVisible(true)}
            className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-neutral-700"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white text-sm font-sans">Nova Categoria</Text>
          </TouchableOpacity>

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
                                      <TouchableOpacity
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
          
                                  <TouchableOpacity
                                    onPress={handleAddCategory}
                                    className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
                                  >
                                    <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
                                  </TouchableOpacity>
          
                                  <TouchableOpacity
                                    onPress={() => setIsCategoryModalVisible(false)}
                                    className="mt-4 p-2"
                                  >
                                    <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </Modal>
                            
        </View>

      </View>
      

      <SwipeListView
        data={filteredWorkouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const muscles = item.type ? item.type.split(',') : [];

          return (
            <View className="w-full flex flex-col justify-center px-6 h-[100px] pt-1 pb-4 border-b border-neutral-700 bg-zinc-800">
              <View className="flex flex-row justify-between">
                <TouchableOpacity
                  className="flex flex-col gap-1 mt-1"
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text className="text-xl font-sans font-medium text-gray-300">{item.name}</Text>
                  <Text className="text-neutral-400 text-sm mt-1 font-sans">
                    {new Date(item.date ?? '').toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2 justify-start mt-3 items-start flex-1 overflow-hidden">
                {muscles.map((muscle) => (
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
                ))}
              </View>
            </View>
          );
        }}
        renderHiddenItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 border-b border-neutral-700 bg-rose-500">
            <View className="flex flex-row justify-start items-center h-full">
              <TouchableOpacity className="p-3" onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        leftOpenValue={80}
        rightOpenValue={0}
        disableRightSwipe={false}
        disableLeftSwipe={true}
      />

      <Modal
        transparent
        animationType="slide"
        visible={isCreateVisible}
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View className="flex-1 py-[50px] bg-zinc-800">
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
              className="items-center flex flex-row"
              onPress={() => setIsCreateVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-white text-lg font-sans"> Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveWorkout}>
              <Text className="text-rose-400 font-sans text-lg font-semibold mr-4">Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 py-4 px-8">
            <TextInput
              placeholder="Título"
              placeholderTextColor="#a1a1aa"
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              className="text-gray-300 text-3xl font-semibold mb-4"
              multiline
            />

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {categories.map((muscle) => {
                const isSelected = selectedMusclesForWorkout.includes(muscle);
                const color = muscleColors[muscle];

                return (
                  <TouchableOpacity
                    key={muscle}
                    onPress={() => toggleMuscleForWorkout(muscle)}
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                      isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                    <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{muscle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Escreva o seu treino aqui"
              placeholderTextColor="#a1a1aa"
              value={content}
              onChangeText={setContent}
              className="text-gray-300 text-lg"
              multiline
              style={{ minHeight: 150, textAlignVertical: 'top' }}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}