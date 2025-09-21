import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { Category } from 'api/types/categoryTypes';

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
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquesa
];

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
  onAddCategory: () => void;
  categories: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  onClose,
  newCategoryName,
  setNewCategoryName,
  newCategoryColor,
  setNewCategoryColor,
  onAddCategory,
  categories,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  
  const theme  = useTheme();

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

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
      return;
    }

    if (categories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Erro', 'Essa categoria já existe.');
      return;
    }

    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onAddCategory();
    });
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 32,
      }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            backgroundColor: theme.colors.itemBackground,
            padding: 24,
            borderRadius: 16,
            width: '100%',
          }}
        >
          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor={theme.colors.textMuted}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            style={{
              color: theme.colors.text,
              fontFamily: 'Poppins',
              paddingBottom: 16,
              fontSize: 18,
              maxWidth: 300,
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}>
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
                  borderColor: newCategoryColor === color ? theme.colors.text : theme.colors.border,
                }}
              />
            ))}
          </View>
          
          <TouchableOpacity
            onPress={handleAddCategory}
            style={{
              backgroundColor: theme.colors.primary,
              padding: 12,
              marginTop: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: theme.colors.onPrimary,
              fontWeight: '600',
              fontFamily: 'Poppins',
            }}>
              Adicionar Categoria
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleClose}
            style={{
              marginTop: 16,
              padding: 8,
            }}
          >
            <Text style={{
              color: theme.colors.textMuted,
              textAlign: 'center',
              fontFamily: 'Poppins',
            }}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CategoryModal;