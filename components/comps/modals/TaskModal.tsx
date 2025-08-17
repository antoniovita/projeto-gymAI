import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  Platform
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
      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>

        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans ml-1">Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onSave}
            className="px-4 py-2 "
            disabled={!newTaskTitle.trim()}
          >
            <Text className="text-rose-400 text-lg font-semibold font-sans">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

          <View className="mt-3 mb-6">
            <TextInput
              placeholder="Nome da tarefa"
              placeholderTextColor="#71717a"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="text-white text-2xl font-sans"
              multiline
              autoFocus
            />
          </View>

          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Data e Hora
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)} 
                className="flex-row items-center bg-zinc-700/50 border border-rose-400/30 px-4 py-3 rounded-xl flex-1"
              >
                <Ionicons name="calendar-outline" size={18} color="#fb7185" />
                <Text className="text-white text-base font-sans ml-2">
                  {date.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowTimePicker(true)} 
                className="flex-row items-center bg-zinc-700/50 border border-rose-400/30 px-4 py-3 rounded-xl flex-1"
              >
                <Ionicons name="time-outline" size={18} color="#fb7185" />
                <Text className="text-white text-base font-sans ml-2">
                  {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Categorias
            </Text>
            
            {categories.length > 0 ? (
              <View className="flex flex-row flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const color = getCategoryColor(category);

                  return (
                    <TouchableOpacity
                      key={category}
                      onPress={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(category)
                            ? prev.filter((c) => c !== category)
                            : [...prev, category]
                        )
                      }
                      className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                        isSelected 
                          ? 'bg-rose-400 border-rose-400' 
                          : 'bg-zinc-700 border-zinc-600'
                      }`}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: color,
                          borderWidth: 0.5,
                          borderColor: "white"
                        }}
                      />
                      <Text
                        className={`font-sans text-sm ${
                          isSelected ? 'text-black font-medium' : 'text-white'
                        }`}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="bg-zinc-700/30 px-4 py-6 rounded-xl items-center justify-center">
                <Ionicons name="folder-outline" size={24} color="#71717a" />
                <Text className="text-zinc-400 text-base font-sans mt-2">
                  Nenhuma categoria disponível
                </Text>
                <Text className="text-zinc-500 text-sm font-sans mt-1 text-center">
                  Crie categorias para organizar suas tarefas
                </Text>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Descrição
            </Text>
            <TextInput
              placeholder="Adicione uma descrição para sua tarefa..."
              placeholderTextColor="#71717a"
              className="text-white leading-6 bg-zinc-700/30 fonts-sans text-lg  border-zinc-600 rounded-xl px-4 py-3 min-h-[100px]"
              multiline
              textAlignVertical="top"
              value={taskContent}
              onChangeText={setTaskContent}
            />
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={date}
          onConfirm={(selectedDate) => {
            setDate(selectedDate);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          textColor="#000000"
          accentColor="#fb7185"
          buttonTextColorIOS="#fb7185"
          themeVariant="light"
          display="inline"
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
          textColor="#000000"
          accentColor="#fb7185"
          buttonTextColorIOS="#fb7185"
          themeVariant="light"
          locale="pt-BR"
        />
      </View>
    </Modal>
  );
}