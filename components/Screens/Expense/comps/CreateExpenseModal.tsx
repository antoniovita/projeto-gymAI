import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategorySectionCreateModal from '../../../generalComps/CategorySectionCreateModal';
import { ExpenseType } from '../../../../api/model/Expenses';

interface Category {
  id?: string;
  name: string;
  color: string;
  type?: string;
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
  selectedCategories: string[]; 
  setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
  selectedExpenseType: ExpenseType | null;
  setSelectedExpenseType: (type: ExpenseType | null) => void;
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
  selectedCategories, 
  setSelectedCategories,
  selectedExpenseType,
  setSelectedExpenseType,
  categories,
  isEditMode = false,
}) => {
  
  const handleCategorySelect = (categoryName: string): void => {
    setSelectedCategories((prev: string[]) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat: string) => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleExpenseTypeSelect = (type: ExpenseType): void => {
    setSelectedExpenseType(type);
  };

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
            className="px-4 py-2"
            disabled={!newTaskTitle.trim() || !selectedExpenseType}
          >
            <Text 
              className={`text-lg font-semibold font-sans ${
                (!newTaskTitle.trim() || !selectedExpenseType) 
                  ? 'text-zinc-500' 
                  : 'text-[#ffa41f]'
              }`}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

          <View className="mt-3 mb-6">
            <TextInput
              placeholder="Nome da despesa"
              placeholderTextColor="#71717a"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="text-white text-2xl font-sans"
              multiline
            />
          </View>

          {/* NOVA SEÇÃO: Seleção de Tipo de Despesa */}
          <View className="mb-8">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Tipo
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => handleExpenseTypeSelect(ExpenseType.GAIN)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  selectedExpenseType === ExpenseType.GAIN
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-zinc-600 bg-zinc-700/30'
                }`}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="trending-up" 
                    size={20} 
                    color={selectedExpenseType === ExpenseType.GAIN ? "#34D399" : "#71717a"} 
                  />
                  <Text 
                    className={`font-sans font-medium ${
                      selectedExpenseType === ExpenseType.GAIN
                        ? 'text-emerald-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    Ganho
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleExpenseTypeSelect(ExpenseType.LOSS)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  selectedExpenseType === ExpenseType.LOSS
                    ? 'border-red-400 bg-red-400/10'
                    : 'border-zinc-600 bg-zinc-700/30'
                }`}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="trending-down" 
                    size={20} 
                    color={selectedExpenseType === ExpenseType.LOSS ? "#ff7a7f" : "#71717a"} 
                  />
                  <Text 
                    className={`font-sans font-medium ${
                      selectedExpenseType === ExpenseType.LOSS
                        ? 'text-red-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    Gasto
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

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

          <View className="mb-6">
            <CategorySectionCreateModal
              categories={categories}
              selectedCategory={selectedCategories} 
              onCategorySelect={handleCategorySelect}
            />
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
              Descrição (Opcional)
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