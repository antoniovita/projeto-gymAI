import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRecurrentTaskDrafts } from '../hooks/useRecurrentTaskDrafts';
import { useAuth } from 'hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'widgets/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTask } from 'hooks/useTask';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {userId} = useAuth()

  const {tasks} = useTask();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [extraCategories, setExtraCategories] = useState<{ name: string; color: string }[]>([]);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;
  type DayKey = typeof days[number];
  const [selectedDay, setSelectedDay] = useState<DayKey>(days[0]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingDraft, setEditingDraft] = useState<any>(null);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = Array.from(
    new Set([
      ...tasks
        .flatMap((task) => task.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0),
      ...extraCategories.map(cat => cat.name),
    ])
  );

  const getCategoryColor = (catName: string) => {
    const extraCat = extraCategories.find(c => c.name === catName);
    return extraCat ? extraCat.color : '#999999';
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await AsyncStorage.getItem('extraCategories');
        if (stored) {
          setExtraCategories(JSON.parse(stored));
          console.log('Categorias extras carregadas:', JSON.parse(stored));
        }
      } catch (err) {
        console.error('Erro ao carregar categorias extras:', err);
      }
    };

    loadCategories();
  }, []);

  const [time, setTime] = useState(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    time: '',
    daysOfWeek: [] as number[],
    userId,
    type: ''
  });

  const { 
    drafts, 
    loading, 
    addDraft, 
    updateDraft, 
    deleteDraft, 
  } = useRecurrentTaskDrafts();

  const dayToNumber = {
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6,
    'Domingo': 0
  };

  const draftsForSelectedDay = drafts.filter(draft => 
    draft.daysOfWeek.includes(dayToNumber[selectedDay])
  );

  const parseTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      time: '',
      daysOfWeek: [],
      userId,
      type: '', 
    });
    setSelectedCategories([]);
    setTime(new Date());
    setEditingDraft(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const openEditModal = (draft: any) => {
    setFormData({
      title: draft.title,
      content: draft.content || '',
      time: draft.time,
      daysOfWeek: draft.daysOfWeek,
      userId: draft.userId,
      type: draft.type || ''
    });
    
    // Definir categorias selecionadas baseado no type do draft
    const draftCategories = draft.type ? draft.type.split(',').map((s: string) => s.trim()) : [];
    setSelectedCategories(draftCategories);
    
    if (draft.time) {
      setTime(parseTimeString(draft.time));
    }
    
    setEditingDraft(draft);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.time || formData.daysOfWeek.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    const dataToSave = {
      ...formData,
      type: selectedCategories.join(', '),
      userId
    };

    try {
      if (modalType === 'create') {
        await addDraft(dataToSave);
      } else {
        await updateDraft({ ...editingDraft, ...dataToSave });
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa');
    }
  };

  const handleDelete = async (draft: any) => {
    const currentDayNumber = dayToNumber[selectedDay];
    const isMultipleDays = draft.daysOfWeek.length > 1;
    
    if (isMultipleDays) {
      Alert.alert(
        'Confirmar exclusão',
        `Esta tarefa está configurada para múltiplos dias. O que você deseja fazer?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: `Remover apenas de ${selectedDay}`, 
            onPress: async () => {
              try {
                const updatedDaysOfWeek = draft.daysOfWeek.filter((day: number) => day !== currentDayNumber);
                await updateDraft({ 
                  ...draft, 
                  daysOfWeek: updatedDaysOfWeek 
                });
              } catch (err) {
                Alert.alert('Erro', 'Não foi possível remover a tarefa deste dia');
              }
            }
          },
          { 
            text: 'Excluir completamente', 
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDraft(draft.id);
              } catch (err) {
                Alert.alert('Erro', 'Não foi possível excluir a tarefa');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir esta tarefa?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDraft(draft.id);
              } catch (err) {
                Alert.alert('Erro', 'Não foi possível excluir a tarefa');
              }
            }
          }
        ]
      );
    }
  };

  const toggleDaySelection = (dayNumber: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayNumber)
        ? prev.daysOfWeek.filter(d => d !== dayNumber)
        : [...prev.daysOfWeek, dayNumber]
    }));
  };

  const getDayName = (dayNumber: number) => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dayNames[dayNumber];
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    setShowTimePicker(false);
    setTime(selectedTime);
    
    const formattedTime = selectedTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setFormData(prev => ({
      ...prev,
      time: formattedTime
    }));
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  const renderLeftActions = (item: any) => {
    return (
      <View className="flex-row items-center justify-start border-t bg-rose-500 px-4 h-full" style={{ width: 80 }}>
        <TouchableOpacity
          className="flex-row items-center justify-center w-16 h-16 rounded-full"
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(item)}
        leftThreshold={80}
        rightThreshold={40}
        overshootLeft={false}
        overshootRight={false}
        friction={1}
        containerStyle={{ backgroundColor: '#27272a' }}
        childrenContainerStyle={{ backgroundColor: '#27272a' }}
        enableTrackpadTwoFingerGesture={false}
      >
        <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
          <View className="flex flex-row justify-between">
            <Pressable className="flex flex-col gap-1 mt-1" onPress={() => openEditModal(item)}>
              <Text className="text-xl font-sans font-medium text-gray-300">
                {item.title}
              </Text>
              <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {item.time}
              </Text>
              <Text className="text-neutral-500 font-sans text-xs mt-1">
                Recorrente em {item.daysOfWeek.length} dias
              </Text>
            </Pressable>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
      <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]" }  bg-zinc-800`}>
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[15px]">Minha Rotina</Text>
        </View>
        <Pressable onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16 }} 
        className="py-2 mt-[30px]"
        style={{ flexGrow: 0 }}
      >
        {days.map(day => (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(day)}
            className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-[#ff7a7f]' : 'bg-neutral-700'}`}
          >
            <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>{day}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="flex-1 mt-4">
        {draftsForSelectedDay.length > 0 ? (
          <FlatList
            data={draftsForSelectedDay}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          <View className="flex items-center justify-center" style={{ paddingTop: 180 }}>
            <Ionicons name="calendar-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
              Nenhuma rotina para {selectedDay}
            </Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Crie novas tarefas para organizar sua rotina
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-zinc-900 rounded-t-3xl p-6" style={{ minHeight: '53%' }}>
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={{ maxHeight: 320 }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View>
                  <TextInput
                    value={formData.title}
                    onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                    placeholder="Nome da tarefa"
                    placeholderTextColor="#6b7280"
                    className="px-1 py-3 text-white text-2xl font-bold"
                  />
                </View>

                <View className="mb-2">
                  <TextInput
                    value={formData.content}
                    onChangeText={text => setFormData(prev => ({ ...prev, content: text }))}
                    placeholder="Detalhes da tarefa"
                    placeholderTextColor="#6b7280"
                    multiline
                    numberOfLines={3}
                    className="rounded-xl text-lg px-1 py-3 text-white font-normal"
                  />
                </View>

                <View className="mb-4">
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    className="px-2 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`font-bold text-2xl ${formData.time ? 'text-white' : 'text-gray-400'}`}>
                      {formData.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Pressable>
                </View>

                <View className="mb-6 mt-2">
                  <View className="flex-row flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayNumber => (
                      <Pressable
                        key={dayNumber}
                        onPress={() => toggleDaySelection(dayNumber)}
                        className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                          formData.daysOfWeek.includes(dayNumber)
                            ? 'bg-[#ff7a7f]'
                            : 'bg-neutral-700'
                        }`}
                      >
                        <Text className={`font-sans ${
                          formData.daysOfWeek.includes(dayNumber)
                            ? 'text-black'
                            : 'text-white'
                        }`}>
                          {getDayName(dayNumber)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Seção de Categorias */}
                <View className="mb-4">
                  <View className="flex flex-row flex-wrap gap-2 mb-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      const color = getCategoryColor(cat);

                      return (
                        <Pressable
                          key={cat}
                          onPress={() =>
                            setSelectedCategories((prev) =>
                              prev.includes(cat) 
                                ? prev.filter((c) => c !== cat) 
                                : [...prev, cat]
                            )
                          }
                          className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                            isSelected ? 'bg-rose-400' : 'bg-zinc-700'
                          }`}
                        >
                          <View 
                            style={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: 5, 
                              backgroundColor: color, 
                              borderWidth: 0.5, 
                              borderColor: '#fff' 
                            }} 
                          />
                          <Text 
                            className={`font-sans text-sm ${
                              isSelected ? 'text-black' : 'text-white'
                            }`}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

              </ScrollView>

              <View className={`${Platform.OS == 'ios' ? 'absolute bottom-[15%] self-center flex-row flex gap-3' : 'self-center flex-row flex gap-3'}`}>
                <Pressable
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-neutral-700 rounded-xl py-4"
                >
                  <Text className="text-white font-sans text-center">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 bg-[#ff7a7f] rounded-xl py-4"
                  disabled={loading}
                >
                  <Text className="text-black font-sans text-center">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          date={time}
          onConfirm={handleTimeConfirm}
          onCancel={handleTimeCancel}
          textColor="#000000"
          accentColor="#ff7a7f"
          buttonTextColorIOS="#ff7a7f"
          themeVariant="light"
          locale="pt-BR"
          is24Hour
        />
      </Modal>
    </SafeAreaView>
  );
}