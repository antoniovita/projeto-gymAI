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
import { useTheme } from 'hooks/useTheme';

//types
import { ExpenseType } from 'api/types/expenseTypes';
import { Category } from 'api/types/categoryTypes';

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

const withAlpha = (hex: string, alpha: number) => {
  // aceita #RRGGBB
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  const theme = useTheme(); // <- pedido

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

  const isSaveDisabled = !newTaskTitle.trim() || !selectedExpenseType;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12 pb-8' : 'pt-8 pb-4'}`}
        style={{ backgroundColor: theme.colors.modalBackground }}
      >

        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity
            className="items-center flex flex-row"
            onPress={onClose}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={theme.colors.chevronIcon}
            />
            <Text
              className="text-lg font-poppins ml-1"
              style={{ color: theme.colors.modalHeaderText }}
            >
              Voltar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onSave}
            className="px-4 py-2"
            disabled={isSaveDisabled}
          >
            <Text
              className="text-lg font-semibold font-poppins"
              style={{ color: isSaveDisabled ? theme.colors.textMuted : theme.colors.modalSaveButton }}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

          {/* Título */}
          <View className="mt-3 mb-6">
            <TextInput
              placeholder="Nome da despesa"
              placeholderTextColor={theme.colors.modalPlaceholder}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="text-2xl font-poppins"
              multiline
              style={{ color: theme.colors.text }}
            />
          </View>

          {/* Tipo de Despesa */}
          <View className="mb-8">
            <Text
              className="text-sm font-medium mb-3 uppercase tracking-wide"
              style={{ color: theme.colors.modalSectionTitle }}
            >
              Tipo
            </Text>
            <View className="flex-row gap-3">
              {/* Ganho */}
              <Pressable
                onPress={() => handleExpenseTypeSelect(ExpenseType.GAIN)}
                className="flex-1 px-4 py-3 rounded-xl border"
                style={{
                  borderColor:
                    selectedExpenseType === ExpenseType.GAIN
                      ? theme.colors.gain
                      : theme.colors.border,
                  backgroundColor:
                    selectedExpenseType === ExpenseType.GAIN
                      ? withAlpha(theme.colors.gain, 0.10)
                      : theme.colors.modalDescriptionBackground,
                }}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="trending-up" 
                    size={20} 
                    color={
                      selectedExpenseType === ExpenseType.GAIN
                        ? theme.colors.gain
                        : theme.colors.textMuted
                    } 
                  />
                  <Text 
                    className="font-poppins font-medium"
                    style={{
                      color:
                        selectedExpenseType === ExpenseType.GAIN
                          ? theme.colors.gain
                          : theme.colors.textMuted,
                    }}
                  >
                    Ganho
                  </Text>
                </View>
              </Pressable>

              {/* Gasto */}
              <Pressable
                onPress={() => handleExpenseTypeSelect(ExpenseType.LOSS)}
                className="flex-1 px-4 py-3 rounded-xl border"
                style={{
                  borderColor:
                    selectedExpenseType === ExpenseType.LOSS
                      ? theme.colors.loss
                      : theme.colors.border,
                  backgroundColor:
                    selectedExpenseType === ExpenseType.LOSS
                      ? withAlpha(theme.colors.loss, 0.10)
                      : theme.colors.modalDescriptionBackground,
                }}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="trending-down" 
                    size={20} 
                    color={
                      selectedExpenseType === ExpenseType.LOSS
                        ? theme.colors.loss
                        : theme.colors.textMuted
                    } 
                  />
                  <Text 
                    className="font-poppins font-medium"
                    style={{
                      color:
                        selectedExpenseType === ExpenseType.LOSS
                          ? theme.colors.loss
                          : theme.colors.textMuted,
                    }}
                  >
                    Gasto
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Valor */}
          <View className="mb-8">
            <Text
              className="text-sm font-medium mb-3 uppercase tracking-wide"
              style={{ color: theme.colors.modalSectionTitle }}
            >
              Valor
            </Text>
            <View
              className="flex-row items-center px-3 py-3 rounded-xl"
              style={{
                backgroundColor: theme.colors.modalInputBackground,
              }}
            >
              <Text
                className="text-xl font-poppins ml-2 mr-1"
                style={{ color: expenseValue.trim() ? theme.colors.text : theme.colors.modalPlaceholder }}
              >
                R$
              </Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor={theme.colors.modalPlaceholder}
                className="text-xl font-poppins flex-1"
                keyboardType="numeric"
                value={expenseValue}
                onChangeText={setExpenseValue}
                style={{ color: expenseValue.trim() ? theme.colors.text : theme.colors.modalPlaceholder }}
              />
            </View>
          </View>

          {/* Categorias */}
          <View className="mb-6">
            <CategorySectionCreateModal
              categories={categories}
              selectedCategory={selectedCategories} 
              onCategorySelect={handleCategorySelect}
            />
          </View>

          {/* Descrição */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-3 uppercase tracking-wide"
              style={{ color: theme.colors.modalSectionTitle }}
            >
              Descrição (Opcional)
            </Text>
            <TextInput
              placeholder="Adicione uma descrição para sua despesa..."
              placeholderTextColor={theme.colors.modalPlaceholder}
              className="text-base leading-6 font-poppins rounded-xl px-4 py-3 min-h-[100px]"
              multiline
              textAlignVertical="top"
              value={taskContent}
              onChangeText={setTaskContent}
              style={{
                color: theme.colors.text,
                backgroundColor: theme.colors.modalDescriptionBackground,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CreateExpenseModal;
