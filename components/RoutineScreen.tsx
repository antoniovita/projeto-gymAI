import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRecurrentTaskDrafts } from '../hooks/useRecurrentTaskDrafts';
import { useAuth } from 'hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'widgets/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function RoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {userId} = useAuth()

  const [activeTab, setActiveTab] = useState<'agenda' | 'expenses'>('agenda');
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;
  type DayKey = typeof days[number];
  const [selectedDay, setSelectedDay] = useState<DayKey>(days[0]);
  const [expenseFilter, setExpenseFilter] = useState<'Gastos' | 'Ganhos'>('Gastos');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingDraft, setEditingDraft] = useState<any>(null);

  // Controla a visibilidade do picker de horário
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Guarda o Date selecionado (inicializado com a hora atual)
  const [time, setTime] = useState(new Date());
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    time: '',
    daysOfWeek: [] as number[],
    userId,
    type: 'rotina'
  });

  // Hook integration
  const { 
    drafts, 
    loading, 
    addDraft, 
    updateDraft, 
    deleteDraft, 
  } = useRecurrentTaskDrafts();

  // Mapear dias da semana para números (0=domingo, 1=segunda...)
  const dayToNumber = {
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6,
    'Domingo': 0
  };

  // Filtrar drafts do dia selecionado
  const draftsForSelectedDay = drafts.filter(draft => 
    draft.daysOfWeek.includes(dayToNumber[selectedDay])
  );

  // Função para converter string de horário para Date
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
      type: 'task'
    });
    setTime(new Date()); // Reset do time picker para hora atual
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
      type: draft.type
    });
    
    // Atualizar o estado do time picker com o horário da tarefa
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

    try {
      if (modalType === 'create') {
        await addDraft({ ...formData, userId });
      } else {
        await updateDraft({ ...editingDraft, ...formData, userId });
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

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      {/* Header */}
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[15px]">Minha Rotina</Text>
        </View>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 rounded-xl mt-[30px] overflow-hidden bg-neutral-800 border border-neutral-700">
        {['expenses', 'agenda'].map(tab => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 ${activeTab === tab ? 'bg-[#ff7a7f]' : ''}`}
            onPress={() => setActiveTab(tab as 'agenda' | 'expenses')}
          >
            <Text className={`text-center font-sans ${activeTab === tab ? 'text-black' : 'text-white'}`}>  
              {tab === 'expenses' ? 'Expenses' : 'Agenda'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'agenda' ? (
        <View className="flex mt-4">
          {/* Day Picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} className="py-2">
            {days.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-[#ff7a7f]' : 'bg-neutral-700'}`}
              >
                <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tasks List */}
          <ScrollView className="flex px-4 mt-4">
            {draftsForSelectedDay.length > 0 ? (
              draftsForSelectedDay.map(draft => (
                <View key={draft.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-sans text-lg">{draft.title}</Text>
                      {draft.content && (
                        <Text className="text-neutral-400 font-sans text-sm mt-1">{draft.content}</Text>
                      )}
                      <Text className="text-[#ff7a7f] font-sans text-sm mt-2">{draft.time}</Text>
                      {/* Mostrar indicador se a tarefa está em múltiplos dias */}
                      {draft.daysOfWeek.length > 1 && (
                        <Text className="text-neutral-500 font-sans text-xs mt-1">
                          Recorrente em {draft.daysOfWeek.length} dias
                        </Text>
                      )}
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity 
                        onPress={() => openEditModal(draft)}
                        className="mr-3"
                      >
                        <Ionicons name="create-outline" size={20} color="#ff7a7f" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(draft)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="flex-1 items-center justify-center" style={{ paddingTop: 120 }}>
                <Ionicons name="calendar-outline" size={64} color="#6b7280" />
                <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
                  Nenhuma tarefa para {selectedDay}
                </Text>
                <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
                  Crie novas tarefas para organizar sua rotina
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 mt-4">
          {/* Expenses Filter */}
          <View className="flex-row mx-6 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800">
            {['Gastos', 'Ganhos'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setExpenseFilter(type as 'Gastos' | 'Ganhos')}
                className={`flex-1 py-3 ${expenseFilter === type ? 'bg-white' : ''}`}
              >
                <Text className={`text-center font-sans ${expenseFilter === type ? 'text-black' : 'text-white'}`}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          <View className="flex-1 justify-center items-center px-4">
            <Ionicons name="wallet-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">Expenses em desenvolvimento</Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Esta funcionalidade será implementada em breve
            </Text>
          </View>
        </View>
      )}

    <Modal
      visible={showModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowModal(false)}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-zinc-900 rounded-t-3xl p-6 min-h-[52%]">
            <ScrollView showsVerticalScrollIndicator={false} className='max-h-[290px]'>
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
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="px-2 py-3 flex-row items-center justify-between"
                >
                  <Text className={`font-bold text-2xl ${formData.time ? 'text-white' : 'text-gray-400'}`}>
                    {formData.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-6 mt-2">
                <View className="flex-row flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 0].map(dayNumber => (
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            <View className=" absolute bottom-[15%] self-center flex-row flex gap-3">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-neutral-700 rounded-xl py-4"
                >
                  <Text className="text-white font-sans text-center">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-[#ff7a7f] rounded-xl py-4"
                  disabled={loading}
                >
                  <Text className="text-black font-sans text-center">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
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