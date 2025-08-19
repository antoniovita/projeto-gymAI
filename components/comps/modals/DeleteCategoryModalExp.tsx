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

interface DeleteCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (category: Category) => void;
  showConfirmDeleteModal: boolean;
  setShowConfirmDeleteModal: (show: boolean) => void;
  categoryToDelete: Category | null;
  onConfirmDelete: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isVisible,
  onClose,
  categories,
  onDeleteCategory,
  showConfirmDeleteModal,
  setShowConfirmDeleteModal,
  categoryToDelete,
  onConfirmDelete,
}) => {
  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-4">
            <ScrollView className="mb-4">
              {categories.map((cat) => (
                <View
                  key={cat.name}
                  className="flex-row justify-between items-center py-2 border-b border-neutral-700"
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
                    <Text className="text-white font-sans text-lg">{cat.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (cat.name !== 'Ganhos' && cat.name !== 'Gastos') {
                        onDeleteCategory(cat);
                      }
                    }}
                    className="p-2 bg-neutral-700 rounded-xl"
                  >
                    {cat.name === 'Ganhos' || cat.name === 'Gastos' ? (
                      <Ionicons name="ban" size={20} color="#fa4d5c" />
                    ) : (
                      <Ionicons name="trash" size={20} color="#fa4d5c" />
                    )}
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <Pressable
              onPress={onClose}
              className="bg-neutral-700 rounded-xl p-3 items-center"
            >
              <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showConfirmDeleteModal}
        onRequestClose={() => setShowConfirmDeleteModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-8">
          <View className="bg-zinc-800 w-full rounded-2xl p-6 items-center shadow-lg">
            <Ionicons name="alert-circle" size={48} color="#F25C5C" className="mb-4" />

            <Text className="text-white text-xl font-semibold mb-2 font-sans text-center">
              Apagar Categoria
            </Text>

            <Text className="text-neutral-400 font-sans text-center mb-6">
              {categoryToDelete
                ? `Tem certeza que deseja apagar a categoria "${categoryToDelete.name}"? Esta ação não pode ser desfeita.`
                : 'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.'}
            </Text>

            <View className="flex-row w-full justify-between gap-3">
              <Pressable
                onPress={() => setShowConfirmDeleteModal(false)}
                className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold font-sans">Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={onConfirmDelete}
                className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
              >
                <Text className="text-black font-sans font-semibold">Apagar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DeleteCategoryModal;