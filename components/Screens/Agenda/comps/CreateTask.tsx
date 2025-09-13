import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GradientIcon from 'components/generalComps/GradientIcon';
import CategorySectionCreateModal from 'components/generalComps/CategorySectionCreateModal';
import { useTheme } from 'hooks/useTheme';

interface Category {
  id: string;
  name: string;
  color: string;
}

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
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onAddNewCategory?: () => void;
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
  onAddNewCategory,
}: TaskModalProps) {
  
  const theme= useTheme();
  const { colors } = theme;
  
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View 
        className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'}`}
        style={{ backgroundColor: colors.modalBackground }}
      >
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color={colors.modalHeaderText} />
            <Text 
              className="text-lg font-poppins ml-1"
              style={{ color: colors.modalHeaderText }}
            >
              Voltar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onSave}
            className="px-4 py-2"
            disabled={!newTaskTitle.trim()}
          >
            <Text 
              className="text-lg font-semibold font-poppins"
              style={{ color: colors.modalSaveButton }}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mt-3 mb-6">
            <TextInput
              placeholder="Nome da tarefa"
              placeholderTextColor={colors.modalPlaceholder}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="text-2xl font-poppins"
              style={{ color: colors.text }}
              multiline
            />
          </View>
          
          <View className="mb-8">
            <Text 
              className="text-sm font-medium mb-3 uppercase tracking-wide"
              style={{ color: colors.modalSectionTitle }}
            >
              Data e Hora
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center px-4 py-3 rounded-xl flex-1"
                style={{ 
                  backgroundColor: colors.modalInputBackground,
                  borderWidth: 1,
                  borderColor: colors.modalInputBorder 
                }}
              >
                <GradientIcon name="calendar" size={18} />
                <Text 
                  className="text-base font-poppins ml-2"
                  style={{ color: colors.text }}
                >
                  {date.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="flex-row items-center px-4 py-3 rounded-xl flex-1"
                style={{ 
                  backgroundColor: colors.modalInputBackground,
                  borderWidth: 1,
                  borderColor: colors.modalInputBorder 
                }}
              >
                <GradientIcon name="time" size={18} />
                <Text 
                  className="text-base font-poppins ml-2"
                  style={{ color: colors.text }}
                >
                  {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <CategorySectionCreateModal
            categories={categories}
            selectedCategory={selectedCategories}
            onCategorySelect={handleCategorySelect}
            onAddNewCategory={onAddNewCategory}
            addButtonText="Nova Categoria"
            containerClassName="mb-8"
            unselectedColor="bg-zinc-700" // Você pode criar uma cor específica para isso também
          />
          
          <View className="mb-6">
            <Text 
              className="text-sm font-medium mb-3 uppercase tracking-wide"
              style={{ color: colors.modalSectionTitle }}
            >
              Descrição
            </Text>
            <TextInput
              placeholder="Adicione uma descrição para sua tarefa..."
              placeholderTextColor={colors.modalPlaceholder}
              className="leading-6 fonts-poppins text-lg rounded-xl px-4 py-3 min-h-[100px]"
              style={{ 
                color: colors.text,
                backgroundColor: colors.modalDescriptionBackground,
              }}
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
          accentColor={colors.datePickerAccent}
          buttonTextColorIOS={colors.datePickerButton}
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
          accentColor={colors.datePickerAccent}
          buttonTextColorIOS={colors.datePickerButton}
          themeVariant="light"
          locale="pt-BR"
        />
      </View>
    </Modal>
  );
}