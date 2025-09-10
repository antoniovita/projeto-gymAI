import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../api/model/Category';

interface DeleteCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (categoryName: string) => void;
}

export default function DeleteCategoryModal({
  isVisible,
  onClose,
  categories,
  onDeleteCategory,
}: DeleteCategoryModalProps) {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      scaleValue.setValue(0);
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

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
          onPress: () => {
            Animated.timing(scaleValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onDeleteCategory(categoryName);
            });
          },
        },
      ]
    );
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-8">
        <Animated.View
          style={{ transform: [{ scale: scaleValue }] }}
          className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-6"
        >
          
          <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
            {categories.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="folder-outline" size={48} color="#6b7280" className="mb-3" />
                <Text className="text-neutral-400 font-poppins text-center">
                  Você ainda não criou categorias.
                </Text>
                <Text className="text-neutral-500 font-poppins text-sm text-center mt-1">
                  Crie categorias personalizadas na tela principal
                </Text>
              </View>
            ) : (
              categories.map((category) => (
                <View
                  key={category.id}
                  className="flex-row justify-between items-center py-4 px-2 border-b border-neutral-700/50"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 7.5,
                        backgroundColor: category.color,
                      }}
                    />
                    <Text className="text-white font-poppins text-base">{category.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeletePress(category.name)}
                    className="p-2 bg-rose-500/20 rounded-xl"
                  > 
                    <Ionicons name="trash" size={16} color="#ff7a7f" />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            onPress={handleClose}
            className="mt-4 p-2 bg-[#ffa41f] py-3 rounded-xl"
          >
            <Text className="text-black text-center font-poppins">Fechar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}