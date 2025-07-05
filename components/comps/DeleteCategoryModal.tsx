import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: string[];
  getCategoryColor: (catName: string) => string;
  onDeleteCategory: (categoryName: string) => void;
}

export default function DeleteCategoryModal({
  isVisible,
  onClose,
  categories,
  getCategoryColor,
  onDeleteCategory,
}: DeleteCategoryModalProps) {
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  const handleDeletePress = (categoryName: string) => {
    setCategoryToDelete(categoryName);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setShowConfirmDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDeleteModal(false);
    setCategoryToDelete(null);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-4">
          <ScrollView className="mb-4">
            {categories.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons name="folder-open-outline" size={64} color="#aaa" className="mb-4" />
                <Text className="text-neutral-400 text-center font-sans text-lg">
                  Você ainda não criou categorias.
                </Text>
              </View>
            ) : (
              categories.map((cat) => {
                const color = getCategoryColor(cat);

                return (
                  <View
                    key={cat}
                    className="flex-row justify-between items-center py-2 pb-3 border-b border-neutral-700"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 7.5,
                          backgroundColor: color,
                          borderWidth: 0.5, 
                          borderColor: '#fff'
                        }}
                      />
                      <Text className="text-white font-sans text-lg">{cat}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePress(cat)}
                      className="p-2 bg-neutral-700 rounded-xl"
                    >
                      <Ionicons name="trash" size={20} color="#fa4d5c" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            className="bg-neutral-700 rounded-xl p-3 items-center"
          >
            <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
          </TouchableOpacity>
        </View>

        <Modal
          transparent
          animationType="fade"
          visible={showConfirmDeleteModal}
          onRequestClose={handleCancelDelete}
        >
          <View className="flex-1 bg-black/80 justify-center items-center px-8">
            <View className="bg-zinc-800 w-full rounded-2xl p-6 items-center shadow-lg">
              <Ionicons name="alert-circle" size={48} color="#ff7a7f" className="mb-4" />

              <Text className="text-white text-xl font-semibold mb-2 font-sans text-center">
                Apagar Categoria
              </Text>

              <Text className="text-neutral-400 font-sans text-center mb-6">
                {categoryToDelete
                  ? `Tem certeza que deseja apagar a categoria "${categoryToDelete}"? Esta ação não pode ser desfeita.`
                  : 'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.'}
              </Text>

              <View className="flex-row w-full justify-between gap-3">
                <TouchableOpacity
                  onPress={handleCancelDelete}
                  className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold font-sans">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmDelete}
                  className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
                >
                  <Text className="text-black font-sans font-semibold">Apagar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}