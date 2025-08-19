import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

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

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
  onAddCategory: () => void;
  extraCategories: { name: string; color: string }[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  onClose,
  newCategoryName,
  setNewCategoryName,
  newCategoryColor,
  setNewCategoryColor,
  onAddCategory,
  extraCategories,
}) => {
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (extraCategories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Erro', 'Essa categoria já existe.');
      return;
    }

    onAddCategory();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-8">
        <View className="bg-zinc-800 p-6 rounded-2xl w-full">
          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor="#a1a1aa"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            className="text-white font-sans pb-4 font-3xl rounded mb-4"
          />

          <View className="flex flex-row flex-wrap gap-2 mb-4">
            {colorOptions.map((color) => (
              <TouchableOpacity
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

          <TouchableOpacity
            onPress={handleAddCategory}
            className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
          >
            <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 p-2"
          >
            <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryModal;