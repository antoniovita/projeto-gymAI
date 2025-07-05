import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface TaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  taskContent: string;
  setTaskContent: (content: string) => void;
  date: Date;
  time: Date;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  setDate: (date: Date) => void;
  setTime: (time: Date) => void;
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  getCategoryColor: (catName: string) => string;
}

export default function TaskModal({
  isVisible,
  onClose,
  onSave,
  newTaskTitle,
  setNewTaskTitle,
  taskContent,
  setTaskContent,
  date,
  time,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  setDate,
  setTime,
  categories,
  selectedCategories,
  setSelectedCategories,
  getCategoryColor
}: TaskModalProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 py-[50px] bg-zinc-800">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans"> Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSave}>
            <Text className="text-rose-400 text-lg mr-4 font-semibold font-sans">Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 py-4 px-8">
          <TextInput
            placeholder="Título"
            placeholderTextColor="#a1a1aa"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            className="text-gray-300 text-3xl font-semibold mb-4"
            multiline
          />

          <View className='flex flex-row justify-between'>
            <View className="flex-row space-x-4 flex gap-3 mb-4">
              <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center border border-[#ff7a7f] px-2 py-1 rounded-lg">
                <Text className="text-white text-lg font-sans">{date.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-row items-center border border-[#ff7a7f] px-2 py-1 rounded-lg">
                <Text className="text-white text-lg font-sans">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={date}
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setShowDatePicker(false);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
            textColor="#ff0000"
            accentColor="#ff7a7f"
            buttonTextColorIOS='#ff7a7f'
            themeVariant='light'
            display='inline'
            locale="pt-BR"
          />
          
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            date={time}
            onConfirm={(selectedTime) => {
              setTime(selectedTime);
              setShowTimePicker(false);
            }}
            onCancel={() => setShowTimePicker(false)}
            textColor="#ff0000"
            accentColor="#ff7a7f"
            buttonTextColorIOS="#ff7a7f"
            themeVariant="light"
            locale="pt-BR"
          />

          <View className="flex flex-row flex-wrap gap-2 mb-2">
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
                  className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 0.5, borderColor: '#fff', }} />
                  <Text className={`font-sans text-sm ${isSelected ? 'text-black' : 'text-white'}`}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            placeholder="Descrição da tarefa"
            placeholderTextColor="#a1a1aa"
            className="text-gray-300 text-lg"
            multiline
            value={taskContent}
            onChangeText={setTaskContent}
            style={{ minHeight: 150, textAlignVertical: 'top' }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}