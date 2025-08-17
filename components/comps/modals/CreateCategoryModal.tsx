import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';

interface CreateCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddCategory: () => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isVisible,
  onClose,
  onAddCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryColor,
  setNewCategoryColor,
}) => {
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

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/90 px-8">
        <View className="bg-zinc-800 p-6 rounded-2xl w-full">
          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor="#a1a1aa"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            className="text-white font-sans font-3xl p-2 rounded mb-4"
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
            onPress={onAddCategory}
            className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
          >
            <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-4 p-2">
            <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CreateCategoryModal;