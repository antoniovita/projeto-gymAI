import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../api/model/Category';
import { useTheme } from 'hooks/useTheme';

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
  
  // Add theme hook
  const theme = useTheme();

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
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            backgroundColor: theme.colors.itemBackground,
            borderRadius: 16,
            width: '100%',
            maxHeight: '80%',
            padding: 24,
          }}
        >
          
          <ScrollView 
            style={{ marginBottom: 24 }} 
            showsVerticalScrollIndicator={false}
          >
            {categories.length === 0 ? (
              <View style={{
                paddingVertical: 32,
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="folder-outline" 
                  size={48} 
                  color={theme.colors.textMuted} 
                  style={{ marginBottom: 12 }}
                />
                <Text style={{
                  color: theme.colors.textMuted,
                  fontFamily: 'Poppins',
                  textAlign: 'center',
                }}>
                  Você ainda não criou categorias.
                </Text>
                <Text style={{
                  color: theme.colors.textMuted,
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 4,
                  opacity: 0.7,
                }}>
                  Crie categorias personalizadas na tela principal
                </Text>
              </View>
            ) : (
              categories.map((category) => (
                <View
                  key={category.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: `${theme.colors.border}80`, // Adding opacity
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 7.5,
                        backgroundColor: category.color,
                      }}
                    />
                    <Text style={{
                      color: theme.colors.text,
                      fontFamily: 'Poppins',
                      fontSize: 16,
                    }}>
                      {category.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeletePress(category.name)}
                    style={{
                      padding: 8,
                      backgroundColor: `${theme.colors.deleteAction}33`, // Adding opacity for background
                      borderRadius: 12,
                    }}
                  > 
                    <Ionicons 
                      name="trash" 
                      size={16} 
                      color={theme.colors.deleteAction} 
                    />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            onPress={handleClose}
            style={{
              marginTop: 16,
              padding: 8,
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{
              color: theme.colors.onPrimary,
              textAlign: 'center',
              fontFamily: 'Poppins',
            }}>
              Fechar
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}