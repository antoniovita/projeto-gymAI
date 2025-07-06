import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  name: string;
  color: string;
}

interface CreateExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  expenseValue: string;
  setExpenseValue: (value: string) => void;
  taskContent: string;
  setTaskContent: (content: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  isEditMode?: boolean;
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isVisible,
  onClose,
  onSave,
  newTaskTitle,
  setNewTaskTitle,
  expenseValue,
  setExpenseValue,
  taskContent,
  setTaskContent,
  selectedCategory,
  setSelectedCategory,
  categories,
  isEditMode = false,
}) => {
  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? '' : categoryName);
  };

  return (
    <Modal transparent animationType="slide" visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 py-[50px] bg-zinc-800">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity onPress={onClose} className="items-center flex flex-row">
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans">Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave}>
            <Text className="text-rose-400 text-lg mr-4 font-semibold">Salvar</Text>
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

          <View className="flex flex-row flex-wrap gap-2 mb-4">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => handleCategorySelection(category.name)}
                  className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${
                    isSelected ? 'bg-rose-400' : 'bg-neutral-700'
                  }`}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: category.color,
                      borderWidth: 0.5,
                      borderColor: '#fff',
                    }}
                  />
                  <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex flex-row items-center mt-2 gap-2 mb-4">
            <Text className="font-sans text-2xl text-white">R$</Text>
            <TextInput
              placeholder="00,00"
              placeholderTextColor="#a1a1aa"
              className="text-white text-2xl font-sans"
              keyboardType="numeric"
              value={expenseValue}
              onChangeText={setExpenseValue}
            />
          </View>

          <TextInput
            placeholder="Descrição da despesa"
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
};

export default CreateExpenseModal;