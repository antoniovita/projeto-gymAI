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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'hooks/useAuth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useNotes } from 'hooks/useNotes';

const EmptyState = ({ onCreateNote }: { onCreateNote: () => void }) => {
  return (
    <View className="flex-1 justify-center items-center mb-[60px] px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="document-text-outline" size={60} color="gray" />
        </View>
        
        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma nota criada
        </Text>
        
        <Text className="text-neutral-400 text-sm font-sans mb-4 text-center" style={{ maxWidth: 230 }}>
          Crie sua primeira nota para começar
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

export default function NoteScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const { notes, loading, error, fetchNotes, createNote, deleteNote, updateNote } = useNotes(userId!);

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [selectedCategoriesForNote, setSelectedCategoriesForNote] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const [extraCategories, setExtraCategories] = useState<{ name: string; color: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  // Categorias padrão para notas
  const defaultCategories = [
    { name: 'Trabalho', color: '#3B82F6' },
    { name: 'Pessoal', color: '#10B981' },
    { name: 'Estudos', color: '#EAB308' },
    { name: 'Ideias', color: '#8B5CF6' },
    { name: 'Lembrete', color: '#EF4444' },
  ];

  const [categoryColors, setCategoryColors] = useState<{[key: string]: string}>({});

  // Função para voltar
  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await AsyncStorage.getItem('noteCategories');
        if (stored) {
          setExtraCategories(JSON.parse(stored));
        }
        
        const storedColors = await AsyncStorage.getItem('noteCategoryColors');
        if (storedColors) {
          setCategoryColors(JSON.parse(storedColors));
        } else {
          // Initialize with default colors
          const defaultColors: {[key: string]: string} = {};
          defaultCategories.forEach(cat => {
            defaultColors[cat.name] = cat.color;
          });
          setCategoryColors(defaultColors);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias das notas.', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('noteCategories', JSON.stringify(extraCategories));
      } catch (err) {
        console.error('Erro ao salvar categorias:', err);
      }
    };
    saveCategories();
  }, [extraCategories]);

  useEffect(() => {
    const saveColors = async () => {
      try {
        await AsyncStorage.setItem('noteCategoryColors', JSON.stringify(categoryColors));
      } catch (err) {
        console.error('Erro ao salvar cores das categorias:', err);
      }
    };
    saveColors();
  }, [categoryColors]);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const categories = Array.from(
    new Set([
      ...defaultCategories.map(cat => cat.name),
      ...notes
        .flatMap((note) => note.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0),
      ...extraCategories.map(cat => cat.name),
    ])
  );

  const getCategoryColor = (catName: string) => {
    // Check extra categories first
    const extraCat = extraCategories.find(c => c.name === catName);
    if (extraCat) return extraCat.color;

    // Check default categories
    const defaultCat = defaultCategories.find(c => c.name === catName);
    if (defaultCat) return defaultCat.color;

    // Check stored colors
    if (categoryColors[catName]) return categoryColors[catName];

    return '#999999';
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (
      extraCategories.find(
        cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      ) ||
      defaultCategories.find(
        cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      Alert.alert('Erro', 'Essa categoria já existe.');
      return;
    }

    const newCat = { name: newCategoryName.trim(), color: newCategoryColor };
    setExtraCategories(prev => [...prev, newCat]);

    setNewCategoryName('');
    setNewCategoryColor('#EF4444');
    setIsCategoryModalVisible(false);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const isCategoryInUse = notes.some(note =>
      note.type?.split(',').map((t: string) => t.trim()).includes(categoryToDelete)
    );

    if (isCategoryInUse) {
      Alert.alert('Atenção!', 'Esta categoria está associada a uma ou mais notas e não pode ser excluída.');
      setShowConfirmDeleteModal(false);
      setCategoryToDelete(null);
      return;
    }

    const newExtras = extraCategories.filter(c => c.name !== categoryToDelete);
    setExtraCategories(newExtras);

    await AsyncStorage.setItem('noteCategories', JSON.stringify(newExtras));

    setShowConfirmDeleteModal(false);
    setCategoryToDelete(null);
  };

  const toggleCategoryForNote = (category: string) => {
    setSelectedCategoriesForNote((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleOpenCreate = () => {
    setSelectedNote(null);
    setNewNoteTitle('');
    setSelectedCategoriesForNote([]);
    setContent('');
    setIsCreateVisible(true);
  };

  const handleOpenEdit = (note: any) => {
    setSelectedNote(note);
    setNewNoteTitle(note.name);
    setSelectedCategoriesForNote(note.type ? note.type.split(',') : []);
    setContent(note.content);
    setIsCreateVisible(true);
  };

  const handleSaveNote = async () => {
    if (!newNoteTitle.trim()) {
      Alert.alert('Erro!', 'O título da nota não pode estar vazio.');
      return;
    }

    try {
      const type = selectedCategoriesForNote.join(',');
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (selectedNote) {
        await updateNote(selectedNote.id, {
          name: newNoteTitle,
          content,
          date: formattedDate,
          type,
        });
      } else {
        await createNote({
          name: newNoteTitle,
          content,
          date: formattedDate,
          type,
        });
      }

      setIsCreateVisible(false);
      setNewNoteTitle('');
      setSelectedCategoriesForNote([]);
      setContent('');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Excluir nota',
      'Tem certeza que deseja excluir esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir a nota.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredNotes = selectedCategories.length === 0
    ? notes
    : notes.filter((note) =>
        note.type?.split(',').some((category) => selectedCategories.includes(category))
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

  const renderNoteItem = ({ item }: { item: any }) => {
    const categories = item.type ? item.type.split(',') : [];

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
            {categories.length > 0 ? (
              categories.map((category: string) => (
                <View
                  key={category}
                  className="px-3 py-1 rounded-xl max-w-[80px] overflow-hidden"
                  style={{ backgroundColor: getCategoryColor(category) }}
                >
                  <Text
                    className="text-xs font-medium text-white font-sans"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {category}
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-800 justify-center items-center">
        <Text className="text-white text-lg font-sans">Carregando notas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">


      <Pressable
        onPress={handleOpenCreate}
        className="w-[50px] h-[50px] absolute bottom-[8%] right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </Pressable>

      <View className="absolute bottom-[8%] left-6 z-20">
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
          <Text className="text-3xl text-white font-medium font-sans">Notas</Text>
        
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
                      const isDefault = defaultCategories.some(defaultCat => defaultCat.name === cat);
                      
                      return (
                        <View
                          key={cat}
                          className="flex-row justify-between items-center py-2 border-b border-neutral-700"
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff'}}
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
      
      {filteredNotes.length === 0 ? (
        <EmptyState onCreateNote={handleOpenCreate} />
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderNoteItem}
        />
      )}

      <Modal
        transparent
        animationType="slide"
        visible={isCreateVisible}
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View className={`flex-1 ${Platform.OS == 'ios' && "py-[50px]" }  bg-zinc-800`}>
          <View className="flex-row justify-between items-center px-4 py-4">
            <Pressable
              className="items-center flex flex-row"
              onPress={() => setIsCreateVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-white text-lg font-sans"> Voltar</Text>
            </Pressable>

            <Pressable onPress={handleSaveNote}>
              <Text className="text-rose-400 font-sans text-lg font-semibold mr-4">Salvar</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 py-4 px-8">
            <TextInput
              placeholder="Título da nota"
              placeholderTextColor="#a1a1aa"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              className="text-gray-300 text-3xl font-semibold mb-4"
              multiline
            />

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {categories.map((category) => {
                const isSelected = selectedCategoriesForNote.includes(category);
                const color = getCategoryColor(category);

                return (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategoryForNote(category)}
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                      isSelected ? 'bg-rose-400' : 'bg-zinc-700'
                    }`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff' }} />
                    <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{category}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              placeholder="Escreva sua nota aqui"
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