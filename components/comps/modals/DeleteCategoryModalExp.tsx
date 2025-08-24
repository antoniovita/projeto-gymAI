import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  name: string;
  color: string;
}

interface DeleteCategoryModalExpProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (category: Category) => void;
}

const DeleteCategoryModalExp: React.FC<DeleteCategoryModalExpProps> = ({
  isVisible,
  onClose,
  categories,
  onDeleteCategory,
}) => {
  const handleDeletePress = (category: Category) => {
    // Chama diretamente a função onDeleteCategory, que já tem toda a lógica de confirmação
    onDeleteCategory(category);
  };

  // Filtra apenas as categorias customizadas (exclui Ganhos e Gastos das opções de exclusão)
  const customCategories = categories.filter(cat => 
    cat.name !== 'Ganhos' && cat.name !== 'Gastos'
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#26262a] rounded-2xl w-full max-h-[80%] p-6">

          {/* Lista de categorias */}
          <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
            <Text className="text-neutral-400 font-sans text-sm mb-3 px-2">
              Categorias
            </Text>
            
            {categories.map((cat) => (
              <View
                key={cat.name}
                className="flex-row justify-between items-center py-4 px-2 border-b border-neutral-700/50"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 7.5,
                      backgroundColor: cat.color,
                      borderWidth: 0.5,
                      borderColor: '#fff',
                    }}
                  />
                  <Text className="text-white font-sans text-base">{cat.name}</Text>
                </View>
                
                {cat.name === 'Ganhos' || cat.name === 'Gastos' ? (
                  <View className="p-2 bg-[#3d3d43] rounded-xl opacity-50">
                    <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleDeletePress(cat)}
                    className="p-2 bg-rose-500/20 rounded-xl"
                  >
                    <Ionicons name="trash" size={16} color="#ff7a7f" />
                  </Pressable>
                )}
              </View>
            ))}

            {customCategories.length === 0 && (
              <View className="py-8 items-center">
                <Ionicons name="folder-outline" size={48} color="#6b7280" className="mb-3" />
                <Text className="text-neutral-400 font-sans text-center">
                  Nenhuma categoria personalizada
                </Text>
                <Text className="text-neutral-500 font-sans text-sm text-center mt-1">
                  Crie categorias personalizadas na tela principal
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botão de fechar */}
          <Pressable
            onPress={onClose}
            className="bg-[#35353a] rounded-xl p-4 items-center"
          >
            <Text className="text-white text-base font-sans font-semibold">Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteCategoryModalExp;