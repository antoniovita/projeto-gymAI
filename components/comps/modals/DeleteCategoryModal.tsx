import React from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert } from 'react-native';
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

  const handleDeletePress = (categoryName: string) => {
    Alert.alert(
      'Apagar Categoria',
      `Tem certeza que deseja apagar a categoria "${categoryName}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => onDeleteCategory(categoryName),
        },
      ]
    );
  };

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
            {categories.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="folder-outline" size={48} color="#6b7280" className="mb-3" />
                <Text className="text-neutral-400 font-sans text-center">
                  Você ainda não criou categorias.
                </Text>
                <Text className="text-neutral-500 font-sans text-sm text-center mt-1">
                  Crie categorias personalizadas na tela principal
                </Text>
              </View>
            ) : (
              categories.map((cat) => {
                const color = getCategoryColor(cat);

                return (
                  <View
                    key={cat}
                    className="flex-row justify-between items-center py-4 px-2 border-b border-neutral-700/50"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 7.5,
                          backgroundColor: color,
                          borderWidth: 0.5,
                          borderColor: '#fff',
                        }}
                      />
                      <Text className="text-white font-sans text-base">{cat}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeletePress(cat)}
                      className="p-2 bg-rose-500/20 rounded-xl"
                    >
                      <Ionicons name="trash" size={16} color="#ff7a7f" />
                    </Pressable>
                  </View>
                );
              })
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
}