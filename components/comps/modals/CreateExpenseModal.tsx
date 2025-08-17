import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  name: string;
  color: string;
}

export interface CreateExpenseModalProps {
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
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'} bg-zinc-800`}>
        {/* Header */}
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
            className="px-4 py-2"
            disabled={!newTaskTitle.trim()}
          >
            <Text className="text-rose-400 text-lg font-semibold font-sans">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Expense Title */}
          <View className="mt-3 mb-6">
            <TextInput
              placeholder="Nome da despesa"
              placeholderTextColor="#71717a"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="text-white text-2xl font-sans"
              multiline
              autoFocus
            />
          </View>

          {/* Value Input */}
            <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Valor
            </Text>
            <View className="flex-row items-center bg-zinc-700/50 px-3 py-3 rounded-xl">
              <Text
              className="text-xl font-sans ml-2 mr-1"
              style={{ color: expenseValue.trim() ? "#fff" : "#71717a" }}
              >
              R$
              </Text>
              <TextInput
              placeholder="0,00"
              placeholderTextColor="#71717a"
              className="text-xl font-sans flex-1"
              keyboardType="numeric"
              value={expenseValue}
              onChangeText={setExpenseValue}
              style={{ color: expenseValue.trim() ? "#fff" : "#71717a" }}
              />
            </View>
            </View>

          {/* Categories */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Categoria
            </Text>
            
            {categories.length > 0 ? (
              <View className="flex flex-row flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.name;

                  return (
                    <TouchableOpacity
                      key={category.name}
                      onPress={() => handleCategorySelection(category.name)}
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
                          backgroundColor: category.color,
                          borderWidth: 0.5,
                          borderColor: "white"
                        }}
                      />
                      <Text
                        className={`font-sans text-sm ${
                          isSelected ? 'text-black font-medium' : 'text-white'
                        }`}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="bg-zinc-700/30 px-4 py-6 rounded-xl items-center justify-center">
                <Ionicons name="pricetag-outline" size={24} color="#71717a" />
                <Text className="text-zinc-400 text-base font-sans mt-2">
                  Nenhuma categoria disponível
                </Text>
                <Text className="text-zinc-500 text-sm font-sans mt-1 text-center">
                  Crie categorias para organizar suas despesas
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Descrição
            </Text>
            <TextInput
              placeholder="Adicione uma descrição para sua despesa..."
              placeholderTextColor="#71717a"
              className="text-white text-base leading-6 bg-zinc-700/30 font-sans border-zinc-600 rounded-xl px-4 py-3 min-h-[100px]"
              multiline
              textAlignVertical="top"
              value={taskContent}
              onChangeText={setTaskContent}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CreateExpenseModal;